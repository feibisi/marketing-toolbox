import { z } from 'zod';

export const RoiDataSchema = z.object({
  currency: z.string().default('¥'),
  campaignName: z.string().default(''),
  date: z.string().default(''),
  revenue: z.number().default(500000),
  conversions: z.number().default(1000),
  incrementalRevenue: z.number().default(150000),
  adSpend: z.number().default(80000),
  laborCost: z.number().default(20000),
  toolsCost: z.number().default(5000),
  otherCost: z.number().default(5000),
  cvrLiftPercent: z.number().min(-50).max(100).default(0),
  costOptPercent: z.number().min(-50).max(50).default(0),
  notes: z.array(z.string()).default(['']),
});

export type RoiData = z.infer<typeof RoiDataSchema>;

export function createDefaultRoiData(projectName = ''): RoiData {
  return {
    currency: '¥',
    campaignName: projectName || 'Q4 转化增长活动',
    date: new Date().toISOString().slice(0, 10),
    revenue: 500000,
    conversions: 1000,
    incrementalRevenue: 150000,
    adSpend: 80000,
    laborCost: 20000,
    toolsCost: 5000,
    otherCost: 5000,
    cvrLiftPercent: 0,
    costOptPercent: 0,
    notes: [
      'ROI 超过 250% 表明当前渠道与转化页回报显著',
      '优先核验归因收入统计口径，排除自然存量复购干扰',
      '可先用场景模拟滑块测试转化率提升 20% 后的放量边界',
    ],
  };
}

export const ROI_SAMPLE_DATA: RoiData = {
  currency: '¥',
  campaignName: '薇晓朵企服转化重构试投放',
  date: '2026-11-25',
  revenue: 280000,
  conversions: 28,
  incrementalRevenue: 160000,
  adSpend: 32000,
  laborCost: 18000,
  toolsCost: 3000,
  otherCost: 2000,
  cvrLiftPercent: 20,
  costOptPercent: 10,
  notes: [
    '客单价聚焦 ¥10,000 标准交付包，单客贡献 ARPU 明显高于散单',
    '若通过工作台优化落地页与报价单使转化率提升 20%、获客成本降 10%，预期 ROI 将进一步跃升',
    '下一步优先把真实财务实收数据记入右侧证据台账确认',
  ],
};

export function parseRoiData(raw: Record<string, unknown> | undefined, projectName?: string): RoiData {
  if (!raw || Object.keys(raw).length === 0) {
    return createDefaultRoiData(projectName);
  }
  const parsed = RoiDataSchema.safeParse(raw);
  return parsed.success ? parsed.data : createDefaultRoiData(projectName);
}
