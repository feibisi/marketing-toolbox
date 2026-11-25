import { AlertCircle, AlertTriangle, Lightbulb, TrendingUp } from 'lucide-react';
import { FixedCanvasSheet } from '../../components/containers/FixedCanvasSheet';
import { CanvasHeader } from '../../components/primitives/CanvasHeader';
import { CanvasFooter } from '../../components/primitives/CanvasFooter';
import { EditableBulletList } from '../../components/primitives/EditableBulletList';
import type { SwotData } from './schema';
import './swot-analysis.css';

interface SwotAnalysisToolProps {
  data: SwotData;
  projectName: string;
  colorMode: boolean;
  justSaved?: boolean;
  toolbarHidden?: boolean;
  onToggleToolbar?: () => void;
  onChange: (next: SwotData) => void;
}

export function SwotAnalysisTool({
  data,
  projectName,
  colorMode,
  justSaved,
  toolbarHidden,
  onToggleToolbar,
  onChange,
}: SwotAnalysisToolProps) {
  return (
    <FixedCanvasSheet size="a3-landscape" colorMode={colorMode}>
      <CanvasHeader
        title="SWOT 分析"
        enSubtitle="SWOT Analysis"
        justSaved={justSaved}
        metaFields={
          <>
            <div className="canvas-meta-field">
              <label htmlFor="swot-project">
                项目 <span className="en-sub">(Project)</span>
              </label>
              <input
                id="swot-project"
                type="text"
                className="canvas-meta-input"
                value={data.projectLabel}
                placeholder="输入分析主题"
                onChange={(e) => onChange({ ...data, projectLabel: e.target.value })}
              />
            </div>
            <div className="canvas-meta-field">
              <label htmlFor="swot-date">
                日期 <span className="en-sub">(Date)</span>
              </label>
              <input
                id="swot-date"
                type="date"
                className="canvas-meta-input"
                value={data.date}
                onChange={(e) => onChange({ ...data, date: e.target.value })}
              />
            </div>
          </>
        }
      />

      <div className="swot-grid">
        <section className="swot-card area-s">
          <div className="swot-card-header">
            <TrendingUp size={18} />
            <h2>
              优势 <span className="en-sub">(Strengths)</span>
            </h2>
          </div>
          <EditableBulletList
            items={data.strengths}
            placeholder="输入内部优势..."
            addLabel="新增优势"
            onChange={(strengths) => onChange({ ...data, strengths })}
          />
        </section>

        <section className="swot-card area-w">
          <div className="swot-card-header">
            <AlertCircle size={18} />
            <h2>
              劣势 <span className="en-sub">(Weaknesses)</span>
            </h2>
          </div>
          <EditableBulletList
            items={data.weaknesses}
            placeholder="输入内部短板..."
            addLabel="新增劣势"
            onChange={(weaknesses) => onChange({ ...data, weaknesses })}
          />
        </section>

        <section className="swot-card area-o">
          <div className="swot-card-header">
            <Lightbulb size={18} />
            <h2>
              机会 <span className="en-sub">(Opportunities)</span>
            </h2>
          </div>
          <EditableBulletList
            items={data.opportunities}
            placeholder="输入外部机会..."
            addLabel="新增机会"
            onChange={(opportunities) => onChange({ ...data, opportunities })}
          />
        </section>

        <section className="swot-card area-t">
          <div className="swot-card-header">
            <AlertTriangle size={18} />
            <h2>
              威胁 <span className="en-sub">(Threats)</span>
            </h2>
          </div>
          <EditableBulletList
            items={data.threats}
            placeholder="输入外部威胁..."
            addLabel="新增威胁"
            onChange={(threats) => onChange({ ...data, threats })}
          />
        </section>

        <div className="swot-center-circle">
          <span className="swot-center-label">核心结论 · Takeaway</span>
          <textarea
            className="swot-center-input"
            rows={4}
            aria-label="核心战略结论"
            value={data.conclusion}
            placeholder="提炼唯一战略结论"
            onChange={(e) => onChange({ ...data, conclusion: e.target.value })}
          />
        </div>
      </div>

      <CanvasFooter projectName={projectName} toolbarHidden={toolbarHidden} onToggleToolbar={onToggleToolbar} />
    </FixedCanvasSheet>
  );
}
