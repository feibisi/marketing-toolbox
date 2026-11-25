import { useMemo } from 'react';
import { getToolById } from '../core/catalog/workflows';
import type { EvidenceKind, EvidenceStatus, ProjectBundle, WorkbenchTheme } from '../core/schema/project';
import type { EntityType } from '../core/schema/entities';
import { WorkbenchShell } from '../components/shell/WorkbenchShell';
import {
  createDefaultSwotData,
  parseSwotData,
  SWOT_SAMPLE_DATA,
  type SwotData,
} from '../tools/swot-analysis/schema';
import { SwotAnalysisTool } from '../tools/swot-analysis/SwotAnalysisTool';
import {
  createDefaultOkrData,
  OKR_SAMPLE_DATA,
  parseOkrData,
  type OkrCascadeData,
} from '../tools/okr-cascade/schema';
import { OkrCascadeTool } from '../tools/okr-cascade/OkrCascadeTool';
import { computeOverallConfidence } from '../tools/okr-cascade/math';
import {
  createDefaultRoiData,
  parseRoiData,
  ROI_SAMPLE_DATA,
  type RoiData,
} from '../tools/roi-calculator/schema';
import { computeRoiMetrics, formatMoney } from '../tools/roi-calculator/math';
import { RoiCalculatorTool } from '../tools/roi-calculator/RoiCalculatorTool';

interface ToolPageProps {
  toolId: string;
  projects: ProjectBundle[];
  activeBundle: ProjectBundle;
  theme: WorkbenchTheme;
  zoomed: boolean;
  colorMode: boolean;
  drawerOpen: boolean;
  onGoHome: () => void;
  onSelectProject: (projectId: string) => void;
  onCreateProject: () => void;
  onToggleDrawer: () => void;
  onToggleZoom: () => void;
  onToggleColorMode: () => void;
  onCycleTheme: () => void;
  onSaveToolData: (
    toolId: string,
    data: Record<string, unknown>,
    entitySync?: { entityType: EntityType; slug: string; title: string; summary: string; payload: Record<string, unknown> },
  ) => void;
  onExportJson: () => void;
  onImportJson: (raw: string) => void;
  onAddEvidence: (input: { toolId: string; fieldPath: string; statement: string; kind: EvidenceKind; source: string }) => void;
  onUpdateEvidenceStatus: (evidenceId: string, status: EvidenceStatus, kind?: EvidenceKind) => void;
  onDeleteEvidence: (evidenceId: string) => void;
}

export function ToolPage(props: ToolPageProps) {
  const { toolId, activeBundle, colorMode, onSaveToolData } = props;
  const tool = getToolById(toolId);
  const rawDocData = activeBundle.documents[toolId]?.data;

  const swotData = useMemo(
    () => parseSwotData(rawDocData, activeBundle.project.name),
    [rawDocData, activeBundle.project.name],
  );
  const okrData = useMemo(
    () => parseOkrData(rawDocData, activeBundle.project.owner),
    [rawDocData, activeBundle.project.owner],
  );
  const roiData = useMemo(
    () => parseRoiData(rawDocData, activeBundle.project.name),
    [rawDocData, activeBundle.project.name],
  );

  if (!tool) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <p>未找到该工具：{toolId}</p>
        <button type="button" className="topbar-btn" onClick={props.onGoHome}>
          返回首页
        </button>
      </div>
    );
  }

  const saveSwot = (next: SwotData) => {
    onSaveToolData('swot-analysis', next as unknown as Record<string, unknown>, {
      entityType: 'company_profile',
      slug: 'company-core',
      title: `${activeBundle.project.brand || activeBundle.project.name} · 战略基线`,
      summary: next.conclusion || next.strengths[0] || 'SWOT 分析已更新',
      payload: {
        coreAdvantage: next.strengths.filter(Boolean),
        hardConstraints: next.weaknesses.filter(Boolean),
        strategicConclusion: next.conclusion,
      },
    });
  };

  const saveOkr = (next: OkrCascadeData) => {
    const overall = computeOverallConfidence(next.objectives);
    onSaveToolData('okr-cascade', next as unknown as Record<string, unknown>, {
      entityType: 'company_profile',
      slug: 'company-core',
      title: `${activeBundle.project.brand || activeBundle.project.name} · ${next.cycle} 战略愿景`,
      summary: `${next.vision.slice(0, 72)}（综合信心 ${overall === null ? '--' : `${overall}%`}）`,
      payload: {
        cycle: next.cycle,
        vision: next.vision,
        objectiveCount: next.objectives.length,
        overallConfidence: overall,
      },
    });
  };

  const saveRoi = (next: RoiData) => {
    const m = computeRoiMetrics(next);
    const sym = next.currency || '¥';
    onSaveToolData('roi-calculator', next as unknown as Record<string, unknown>, {
      entityType: 'funnel_metric',
      slug: 'campaign-roi',
      title: `${next.campaignName || '活动 ROI'} · 财务与转化指标`,
      summary: `ROI ${m.roiPercent === null ? '--' : `${m.roiPercent.toFixed(1)}%`} · 净利 ${formatMoney(
        m.netProfit,
        sym,
      )} · ROAS ${m.roas === null ? '--' : `${m.roas.toFixed(2)}x`} · CAC ${formatMoney(m.cac, sym, 2)}`,
      payload: {
        revenue: next.revenue,
        totalCost: m.totalCost,
        conversions: next.conversions,
        roiPercent: m.roiPercent,
        roas: m.roas,
        cac: m.cac,
        arpu: m.arpu,
      },
    });
  };

  const handleLoadSample = () => {
    if (toolId === 'swot-analysis') saveSwot(SWOT_SAMPLE_DATA);
    if (toolId === 'okr-cascade') saveOkr(OKR_SAMPLE_DATA);
    if (toolId === 'roi-calculator') saveRoi(ROI_SAMPLE_DATA);
  };

  const handleResetTool = () => {
    if (toolId === 'swot-analysis') saveSwot(createDefaultSwotData(activeBundle.project.name));
    if (toolId === 'okr-cascade') saveOkr(createDefaultOkrData(activeBundle.project.owner));
    if (toolId === 'roi-calculator') saveRoi(createDefaultRoiData(activeBundle.project.name));
  };

  return (
    <WorkbenchShell
      tool={tool}
      projects={props.projects}
      activeBundle={activeBundle}
      theme={props.theme}
      zoomed={props.zoomed}
      colorMode={colorMode}
      drawerOpen={props.drawerOpen}
      onGoHome={props.onGoHome}
      onSelectProject={props.onSelectProject}
      onCreateProject={props.onCreateProject}
      onToggleDrawer={props.onToggleDrawer}
      onToggleZoom={props.onToggleZoom}
      onToggleColorMode={props.onToggleColorMode}
      onCycleTheme={props.onCycleTheme}
      onLoadSample={handleLoadSample}
      onPrint={() => window.print()}
      onExportJson={props.onExportJson}
      onImportJson={props.onImportJson}
      onResetTool={handleResetTool}
      onAddEvidence={props.onAddEvidence}
      onUpdateEvidenceStatus={props.onUpdateEvidenceStatus}
      onDeleteEvidence={props.onDeleteEvidence}
    >
      {toolId === 'swot-analysis' ? (
        <SwotAnalysisTool
          data={swotData}
          projectName={activeBundle.project.name}
          colorMode={colorMode}
          onChange={saveSwot}
        />
      ) : null}

      {toolId === 'okr-cascade' ? (
        <OkrCascadeTool
          data={okrData}
          projectName={activeBundle.project.name}
          colorMode={colorMode}
          onChange={saveOkr}
        />
      ) : null}

      {toolId === 'roi-calculator' ? (
        <RoiCalculatorTool
          data={roiData}
          projectName={activeBundle.project.name}
          colorMode={colorMode}
          onChange={saveRoi}
        />
      ) : null}
    </WorkbenchShell>
  );
}
