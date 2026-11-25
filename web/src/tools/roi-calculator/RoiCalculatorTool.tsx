import {
  AlertOctagon,
  Award,
  Calculator,
  CheckCircle2,
  CreditCard,
  FileText,
  PieChart,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  Trophy,
  Users,
} from 'lucide-react';
import { CalculatorBoard } from '../../components/containers/CalculatorBoard';
import { CanvasHeader } from '../../components/primitives/CanvasHeader';
import { CanvasFooter } from '../../components/primitives/CanvasFooter';
import { EditableBulletList } from '../../components/primitives/EditableBulletList';
import { computeRoiMetrics, formatMoney } from './math';
import type { RoiData } from './schema';
import './roi-calculator.css';

interface RoiCalculatorToolProps {
  data: RoiData;
  projectName: string;
  colorMode: boolean;
  onChange: (next: RoiData) => void;
}

function parseNumericInput(raw: string): number {
  const cleaned = raw.replace(/[^\d.-]/g, '');
  const num = Number(cleaned);
  return Number.isFinite(num) ? Math.max(0, num) : 0;
}

export function RoiCalculatorTool({ data, projectName, colorMode, onChange }: RoiCalculatorToolProps) {
  const m = computeRoiMetrics(data);
  const symbol = data.currency || '¥';

  const RatingIcon =
    m.ratingTier === 'excellent'
      ? Trophy
      : m.ratingTier === 'good'
        ? CheckCircle2
        : m.ratingTier === 'average'
          ? TrendingDown
          : AlertOctagon;

  return (
    <CalculatorBoard colorMode={colorMode}>
      <CanvasHeader
        title="ROI 计算器"
        enSubtitle="Marketing ROI Calculator"
        metaFields={
          <>
            <div className="canvas-meta-field">
              <label htmlFor="roi-currency">
                货币 <span className="en-sub">(Currency)</span>
              </label>
              <input
                id="roi-currency"
                type="text"
                maxLength={3}
                className="canvas-meta-input compact"
                value={data.currency}
                onChange={(e) => onChange({ ...data, currency: e.target.value })}
              />
            </div>
            <div className="canvas-meta-field">
              <label htmlFor="roi-campaign">
                活动 <span className="en-sub">(Campaign)</span>
              </label>
              <input
                id="roi-campaign"
                type="text"
                className="canvas-meta-input"
                value={data.campaignName}
                placeholder="输入活动名称"
                onChange={(e) => onChange({ ...data, campaignName: e.target.value })}
              />
            </div>
            <div className="canvas-meta-field">
              <label htmlFor="roi-date">
                日期 <span className="en-sub">(Date)</span>
              </label>
              <input
                id="roi-date"
                type="date"
                className="canvas-meta-input"
                value={data.date}
                onChange={(e) => onChange({ ...data, date: e.target.value })}
              />
            </div>
          </>
        }
      />

      <div className="roi-board-grid">
        <section className="roi-pane">
          <div className="roi-pane-head">
            <Calculator size={18} />
            <h2>
              数据输入 <span className="en-sub">(Input Data)</span>
            </h2>
          </div>

          <div className="roi-group-box roi-revenue-box">
            <div className="roi-group-head">
              <TrendingUp size={16} />
              <h3>
                收益 <span className="en-sub">(Revenue)</span>
              </h3>
            </div>

            <div className="roi-field">
              <label htmlFor="roi-revenue">归因收入 (Attributed Revenue)</label>
              <div className="roi-input-wrap">
                <span className="roi-prefix">{symbol}</span>
                <input
                  id="roi-revenue"
                  type="number"
                  min={0}
                  className="roi-num-input"
                  value={data.revenue}
                  onChange={(e) => onChange({ ...data, revenue: parseNumericInput(e.target.value) })}
                />
              </div>
            </div>

            <div className="roi-field">
              <label htmlFor="roi-conversions">转化次数 (Conversions)</label>
              <div className="roi-input-wrap">
                <span className="roi-prefix">
                  <Users size={14} />
                </span>
                <input
                  id="roi-conversions"
                  type="number"
                  min={0}
                  className="roi-num-input"
                  value={data.conversions}
                  onChange={(e) => onChange({ ...data, conversions: parseNumericInput(e.target.value) })}
                />
              </div>
              <span className="roi-hint">总成交订单数或有效线索数</span>
            </div>

            <div className="roi-field">
              <label htmlFor="roi-inc-rev">增量收入 (Incremental Revenue)</label>
              <div className="roi-input-wrap">
                <span className="roi-prefix">{symbol}</span>
                <input
                  id="roi-inc-rev"
                  type="number"
                  min={0}
                  className="roi-num-input"
                  value={data.incrementalRevenue}
                  onChange={(e) => onChange({ ...data, incrementalRevenue: parseNumericInput(e.target.value) })}
                />
              </div>
              <span className="roi-hint">剔除自然流量后由本次活动带来的净增收入</span>
            </div>
          </div>

          <div className="roi-group-box roi-cost-box">
            <div className="roi-group-head">
              <CreditCard size={16} />
              <h3>
                成本 <span className="en-sub">(Costs)</span>
              </h3>
            </div>

            <div className="roi-field">
              <label htmlFor="roi-adspend">广告投放费 (Ad Spend)</label>
              <div className="roi-input-wrap">
                <span className="roi-prefix">{symbol}</span>
                <input
                  id="roi-adspend"
                  type="number"
                  min={0}
                  className="roi-num-input"
                  value={data.adSpend}
                  onChange={(e) => onChange({ ...data, adSpend: parseNumericInput(e.target.value) })}
                />
              </div>
            </div>

            <div className="roi-field">
              <label htmlFor="roi-labor">人力与制作成本 (Labor Cost)</label>
              <div className="roi-input-wrap">
                <span className="roi-prefix">{symbol}</span>
                <input
                  id="roi-labor"
                  type="number"
                  min={0}
                  className="roi-num-input"
                  value={data.laborCost}
                  onChange={(e) => onChange({ ...data, laborCost: parseNumericInput(e.target.value) })}
                />
              </div>
            </div>

            <div className="roi-field">
              <label htmlFor="roi-tools">工具 / 平台费 (Tools &amp; Platform)</label>
              <div className="roi-input-wrap">
                <span className="roi-prefix">{symbol}</span>
                <input
                  id="roi-tools"
                  type="number"
                  min={0}
                  className="roi-num-input"
                  value={data.toolsCost}
                  onChange={(e) => onChange({ ...data, toolsCost: parseNumericInput(e.target.value) })}
                />
              </div>
            </div>

            <div className="roi-field">
              <label htmlFor="roi-other">其他成本 (Other Costs)</label>
              <div className="roi-input-wrap">
                <span className="roi-prefix">{symbol}</span>
                <input
                  id="roi-other"
                  type="number"
                  min={0}
                  className="roi-num-input"
                  value={data.otherCost}
                  onChange={(e) => onChange({ ...data, otherCost: parseNumericInput(e.target.value) })}
                />
              </div>
            </div>

            <div className="roi-cost-total">
              <span>总成本 (Total Cost)</span>
              <span>{formatMoney(m.totalCost, symbol)}</span>
            </div>
          </div>
        </section>

        <section className="roi-pane">
          <div className="roi-pane-head">
            <PieChart size={18} />
            <h2>
              计算结果 <span className="en-sub">(Results)</span>
            </h2>
          </div>

          <div className="roi-hero-card">
            <div className="roi-formula-line">ROI = (归因收入 - 总成本) ÷ 总成本 × 100%</div>
            <div className="roi-big-number" data-testid="roi-main-value">
              {m.roiPercent === null ? '--' : `${m.roiPercent.toFixed(1)}%`}
            </div>
            <div className="roi-interpretation">
              {m.returnPerUnit === null
                ? '请输入大于 0 的成本项以核算投资回报'
                : `每投入 ${symbol}1，收回 ${symbol}${m.returnPerUnit.toFixed(2)}（增量 ROI：${
                    m.incrementalRoiPercent !== null ? `${m.incrementalRoiPercent.toFixed(1)}%` : '--'
                  }）`}
            </div>
          </div>

          <div className="roi-metrics-grid">
            <div className="roi-metric-card">
              <div className="roi-metric-label">净利润 (Net Profit)</div>
              <div className="roi-metric-val">{formatMoney(m.netProfit, symbol)}</div>
            </div>
            <div className="roi-metric-card">
              <div className="roi-metric-label">广告回报 (ROAS)</div>
              <div className="roi-metric-val">{m.roas === null ? '--' : `${m.roas.toFixed(2)}x`}</div>
            </div>
            <div className="roi-metric-card">
              <div className="roi-metric-label">获客成本 (CAC)</div>
              <div className="roi-metric-val">{formatMoney(m.cac, symbol, 2)}</div>
            </div>
            <div className="roi-metric-card">
              <div className="roi-metric-label">单客贡献 (ARPU)</div>
              <div className="roi-metric-val">{formatMoney(m.arpu, symbol, 2)}</div>
            </div>
          </div>

          <div className="roi-group-box">
            <div className="roi-group-head">
              <SlidersHorizontal size={15} />
              <h3>
                情景模拟 <span className="en-sub">(What-If Simulation)</span>
              </h3>
            </div>
            <div className="roi-slider-row">
              <div className="roi-slider-head">
                <label htmlFor="slider-cvr">转化率提升 (CVR Lift)</label>
                <span className="roi-slider-val">
                  {data.cvrLiftPercent >= 0 ? `+${data.cvrLiftPercent}%` : `${data.cvrLiftPercent}%`}
                </span>
              </div>
              <input
                id="slider-cvr"
                type="range"
                min={-50}
                max={100}
                value={data.cvrLiftPercent}
                className="roi-range"
                onChange={(e) => onChange({ ...data, cvrLiftPercent: Number(e.target.value) })}
              />
            </div>

            <div className="roi-slider-row">
              <div className="roi-slider-head">
                <label htmlFor="slider-cost">单位成本优化 (Cost Opt.)</label>
                <span className="roi-slider-val">
                  {data.costOptPercent >= 0 ? `-${data.costOptPercent}%` : `+${Math.abs(data.costOptPercent)}%`}
                </span>
              </div>
              <input
                id="slider-cost"
                type="range"
                min={-50}
                max={50}
                value={data.costOptPercent}
                className="roi-range"
                onChange={(e) => onChange({ ...data, costOptPercent: Number(e.target.value) })}
              />
            </div>

            <div className="roi-sim-summary">
              <span>模拟预期 ROI：</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>
                {m.simulatedRoiPercent === null ? '--' : `${m.simulatedRoiPercent.toFixed(1)}%`}
              </strong>
              {m.roiDiffPercent !== null ? (
                <span className={`roi-diff-badge ${m.roiDiffPercent >= 0 ? 'positive' : 'negative'}`}>
                  {m.roiDiffPercent >= 0 ? `+${m.roiDiffPercent.toFixed(1)}%` : `${m.roiDiffPercent.toFixed(1)}%`}
                </span>
              ) : null}
            </div>
          </div>

          <div className="roi-group-box">
            <div className="roi-group-head">
              <Award size={15} />
              <h3>
                ROI 评级 <span className="en-sub">(Performance Rating)</span>
              </h3>
            </div>
            <div className="roi-rating-track">
              <div className="roi-rating-marker" style={{ left: `${m.ratingPercent}%` }} />
            </div>
            <div className="roi-rating-labels">
              <span>差 (Poor)</span>
              <span>一般 (Average)</span>
              <span>良好 (Good)</span>
              <span>优秀 (Excellent)</span>
            </div>
            <div className="roi-rating-banner">
              <RatingIcon size={16} />
              <span>{m.ratingLabel}</span>
            </div>
          </div>

          <div className="roi-group-box">
            <div className="roi-group-head">
              <FileText size={15} />
              <h3>
                分析备注 <span className="en-sub">(Analysis Notes)</span>
              </h3>
            </div>
            <EditableBulletList
              items={data.notes}
              placeholder="补充复盘结论与预算调整建议..."
              addLabel="新增备注"
              onChange={(notes) => onChange({ ...data, notes })}
            />
          </div>
        </section>
      </div>

      <CanvasFooter projectName={projectName} />
    </CalculatorBoard>
  );
}
