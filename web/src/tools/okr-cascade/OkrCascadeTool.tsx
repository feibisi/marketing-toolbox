import { Flag, Gauge, Plus, PlusCircle, Target, X } from 'lucide-react';
import { WorksheetDoc } from '../../components/containers/WorksheetDoc';
import { CanvasHeader } from '../../components/primitives/CanvasHeader';
import { CanvasFooter } from '../../components/primitives/CanvasFooter';
import { createUid } from '../../core/storage/localRepository';
import {
  clampConfidence,
  computeObjectiveConfidence,
  computeOverallConfidence,
  getConfidenceLevel,
} from './math';
import type { Objective, OkrCascadeData } from './schema';
import './okr-cascade.css';

interface OkrCascadeToolProps {
  data: OkrCascadeData;
  projectName: string;
  colorMode: boolean;
  justSaved?: boolean;
  toolbarHidden?: boolean;
  onToggleToolbar?: () => void;
  onChange: (next: OkrCascadeData) => void;
}

export function OkrCascadeTool({
  data,
  projectName,
  colorMode,
  justSaved,
  toolbarHidden,
  onToggleToolbar,
  onChange,
}: OkrCascadeToolProps) {
  const overall = computeOverallConfidence(data.objectives);
  const overallLevel = getConfidenceLevel(overall);

  const updateObjective = (objId: string, updater: (obj: Objective) => Objective) => {
    onChange({
      ...data,
      objectives: data.objectives.map((o) => (o.id === objId ? updater(o) : o)),
    });
  };

  const handleAddObjective = () => {
    const nextObj: Objective = {
      id: createUid('obj'),
      title: '新增战略目标...',
      keyResults: [{ id: createUid('kr'), title: '可量化关键结果与截止时间...', confidence: 5 }],
    };
    onChange({ ...data, objectives: [...data.objectives, nextObj] });
  };

  const handleRemoveObjective = (objId: string) => {
    onChange({ ...data, objectives: data.objectives.filter((o) => o.id !== objId) });
  };

  const handleAddKr = (objId: string) => {
    updateObjective(objId, (obj) => ({
      ...obj,
      keyResults: [...obj.keyResults, { id: createUid('kr'), title: '输入新的可衡量关键结果...', confidence: 5 }],
    }));
  };

  const handleRemoveKr = (objId: string, krId: string) => {
    updateObjective(objId, (obj) => ({
      ...obj,
      keyResults: obj.keyResults.filter((kr) => kr.id !== krId),
    }));
  };

  return (
    <WorksheetDoc size="a3-wide" colorMode={colorMode}>
      <CanvasHeader
        title="OKR 战略级联地图"
        enSubtitle="OKR Strategy Cascade Map"
        justSaved={justSaved}
        metaFields={
          <>
            <div className="canvas-meta-field">
              <label htmlFor="okr-cycle">
                周期 <span className="en-sub">(Cycle)</span>
              </label>
              <input
                id="okr-cycle"
                type="text"
                className="canvas-meta-input"
                value={data.cycle}
                placeholder="2026 Q4"
                onChange={(e) => onChange({ ...data, cycle: e.target.value })}
              />
            </div>
            <div className="canvas-meta-field">
              <label htmlFor="okr-owner">
                负责人 <span className="en-sub">(Owner)</span>
              </label>
              <input
                id="okr-owner"
                type="text"
                className="canvas-meta-input"
                value={data.owner}
                placeholder="负责人"
                onChange={(e) => onChange({ ...data, owner: e.target.value })}
              />
            </div>
          </>
        }
      />

      <div className="okr-cascade-body">
        <section className="okr-vision-box">
          <div className="okr-vision-head">
            <div className="okr-section-title">
              <Flag size={18} />
              <h2>
                愿景与年度主题 <span className="en-sub">(Vision &amp; Mission)</span>
              </h2>
            </div>
            <div className="okr-overall-score">
              <span className="okr-overall-label">综合信心指数</span>
              <span className={`okr-overall-value okr-score-${overallLevel}`}>
                {overall === null ? '--%' : `${overall}%`}
              </span>
            </div>
          </div>
          <textarea
            className="okr-vision-input"
            rows={2}
            aria-label="愿景与年度主题"
            value={data.vision}
            placeholder="在此输入公司或业务线的季度/年度战略主题..."
            onChange={(e) => onChange({ ...data, vision: e.target.value })}
          />
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <div className="okr-section-title">
            <Target size={18} />
            <h2>
              战略目标与关键结果 <span className="en-sub">(Objectives &amp; Key Results)</span>
            </h2>
          </div>

          <div className="okr-objectives-grid">
            {data.objectives.map((obj, idx) => {
              const objScore = computeObjectiveConfidence(obj);
              const objLevel = getConfidenceLevel(objScore);
              return (
                <article className="okr-objective-card" key={obj.id}>
                  <div className="okr-obj-header">
                    <span className="okr-obj-badge">O{idx + 1}</span>
                    <textarea
                      className="okr-obj-title"
                      rows={2}
                      aria-label={`目标 O${idx + 1}`}
                      value={obj.title}
                      onChange={(e) => updateObjective(obj.id, (o) => ({ ...o, title: e.target.value }))}
                    />
                    <span className={`okr-obj-score-pill okr-score-${objLevel}`}>
                      {objScore === null ? '--%' : `${objScore}%`}
                    </span>
                    <button
                      type="button"
                      className="okr-icon-btn no-print"
                      title="新增关键结果"
                      aria-label="新增关键结果"
                      onClick={() => handleAddKr(obj.id)}
                    >
                      <Plus size={15} />
                    </button>
                    <button
                      type="button"
                      className="okr-icon-btn no-print"
                      title="删除目标"
                      aria-label="删除目标"
                      onClick={() => handleRemoveObjective(obj.id)}
                    >
                      <X size={15} />
                    </button>
                  </div>

                  <div className="okr-kr-list">
                    {obj.keyResults.map((kr, krIdx) => (
                      <div className="okr-kr-row" key={kr.id}>
                        <span className="okr-kr-tag">KR{krIdx + 1}</span>
                        <input
                          type="text"
                          className="okr-kr-input"
                          aria-label={`目标 O${idx + 1} 关键结果 ${krIdx + 1}`}
                          value={kr.title}
                          onChange={(e) =>
                            updateObjective(obj.id, (o) => ({
                              ...o,
                              keyResults: o.keyResults.map((item) =>
                                item.id === kr.id ? { ...item, title: e.target.value } : item,
                              ),
                            }))
                          }
                        />
                        <label className="okr-kr-gauge" title="信心指数（0-10）">
                          <Gauge size={12} />
                          <input
                            type="number"
                            min={0}
                            max={10}
                            className="okr-score-num"
                            aria-label="信心分"
                            value={kr.confidence}
                            onChange={(e) => {
                              const nextVal = clampConfidence(Number(e.target.value));
                              updateObjective(obj.id, (o) => ({
                                ...o,
                                keyResults: o.keyResults.map((item) =>
                                  item.id === kr.id ? { ...item, confidence: nextVal } : item,
                                ),
                              }));
                            }}
                          />
                          <span>/10</span>
                        </label>
                        <button
                          type="button"
                          className="okr-icon-btn no-print"
                          title="删除关键结果"
                          aria-label="删除关键结果"
                          onClick={() => handleRemoveKr(obj.id, kr.id)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>

          <button type="button" className="okr-add-obj-btn no-print" onClick={handleAddObjective}>
            <PlusCircle size={16} />
            <span>新增战略目标 (Objective)</span>
          </button>
        </section>
      </div>

      <CanvasFooter projectName={projectName} toolbarHidden={toolbarHidden} onToggleToolbar={onToggleToolbar} />
    </WorksheetDoc>
  );
}
