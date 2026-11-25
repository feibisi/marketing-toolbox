import type { RoiData } from './schema';

export type RoiRatingTier = 'poor' | 'average' | 'good' | 'excellent';

export interface RoiMetrics {
  totalCost: number;
  netProfit: number;
  roiPercent: number | null;
  returnPerUnit: number | null;
  roas: number | null;
  cac: number | null;
  arpu: number | null;
  incrementalRoiPercent: number | null;
  simulatedRevenue: number;
  simulatedCost: number;
  simulatedRoiPercent: number | null;
  roiDiffPercent: number | null;
  ratingPercent: number;
  ratingTier: RoiRatingTier;
  ratingLabel: string;
}

export function sanitizeAmount(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, value);
}

export function computeRoiMetrics(input: RoiData): RoiMetrics {
  const revenue = sanitizeAmount(input.revenue);
  const incrementalRevenue = sanitizeAmount(input.incrementalRevenue);
  const conversions = sanitizeAmount(input.conversions);
  const adSpend = sanitizeAmount(input.adSpend);
  const laborCost = sanitizeAmount(input.laborCost);
  const toolsCost = sanitizeAmount(input.toolsCost);
  const otherCost = sanitizeAmount(input.otherCost);

  const totalCost = adSpend + laborCost + toolsCost + otherCost;
  const netProfit = revenue - totalCost;
  const roiPercent = totalCost > 0 ? ((revenue - totalCost) / totalCost) * 100 : null;
  const incrementalRoiPercent = totalCost > 0 ? ((incrementalRevenue - totalCost) / totalCost) * 100 : null;
  const returnPerUnit = totalCost > 0 ? revenue / totalCost : null;
  const roas = adSpend > 0 ? revenue / adSpend : null;
  const cac = conversions > 0 ? totalCost / conversions : null;
  const arpu = conversions > 0 ? revenue / conversions : null;

  const cvrFactor = 1 + input.cvrLiftPercent / 100;
  const costFactor = Math.max(0.05, 1 - input.costOptPercent / 100);
  const simulatedRevenue = revenue * cvrFactor;
  const simulatedCost = totalCost * costFactor;
  const simulatedRoiPercent = simulatedCost > 0 ? ((simulatedRevenue - simulatedCost) / simulatedCost) * 100 : null;
  const roiDiffPercent =
    simulatedRoiPercent !== null && roiPercent !== null ? simulatedRoiPercent - roiPercent : null;

  let ratingTier: RoiRatingTier = 'poor';
  let ratingLabel = '亏损 - 需要深度排查获客与转化链路';
  let ratingPercent = 5;

  if (roiPercent === null) {
    ratingTier = 'poor';
    ratingLabel = '待录入成本数据以评估回报率';
    ratingPercent = 0;
  } else if (roiPercent <= 0) {
    ratingTier = 'poor';
    ratingLabel = '亏损 - 成本高于归因收入，需立即复盘漏斗';
    ratingPercent = 8;
  } else if (roiPercent < 100) {
    ratingTier = 'average';
    ratingLabel = '一般 - 正向回报但利润偏薄，建议优化投放与客单价';
    ratingPercent = Math.min(45, Math.max(18, (roiPercent / 400) * 100));
  } else if (roiPercent < 250) {
    ratingTier = 'good';
    ratingLabel = '良好 - 业务健康，可验证放大预算上限';
    ratingPercent = Math.min(78, (roiPercent / 400) * 100);
  } else {
    ratingTier = 'excellent';
    ratingLabel = '优秀 - 投资回报显著，具备复制放量价值';
    ratingPercent = Math.min(100, Math.max(80, (roiPercent / 400) * 100));
  }

  return {
    totalCost,
    netProfit,
    roiPercent,
    returnPerUnit,
    roas,
    cac,
    arpu,
    incrementalRoiPercent,
    simulatedRevenue,
    simulatedCost,
    simulatedRoiPercent,
    roiDiffPercent,
    ratingPercent,
    ratingTier,
    ratingLabel,
  };
}

export function formatMoney(amount: number | null, currency: string, fractionDigits = 0): string {
  if (amount === null || !Number.isFinite(amount)) return '--';
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount).toLocaleString('zh-CN', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
  return `${sign}${currency}${abs}`;
}
