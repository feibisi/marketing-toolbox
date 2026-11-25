import { z } from 'zod';

export const SwotDataSchema = z.object({
  projectLabel: z.string().default(''),
  date: z.string().default(''),
  strengths: z.array(z.string()).default(['']),
  weaknesses: z.array(z.string()).default(['']),
  opportunities: z.array(z.string()).default(['']),
  threats: z.array(z.string()).default(['']),
  conclusion: z.string().default(''),
});

export type SwotData = z.infer<typeof SwotDataSchema>;

export function createDefaultSwotData(projectName = ''): SwotData {
  return {
    projectLabel: projectName || '我的战略分析',
    date: new Date().toISOString().slice(0, 10),
    strengths: [
      '我们做得最好的核心能力或产品壁垒是什么？',
      '有哪些竞争对手短期难以复制的资源或渠道？',
      '老客户最认可我们的理由是什么？',
    ],
    weaknesses: [
      '转化链路或交付流程中目前最大的短板是什么？',
      '我们在人力、品牌知名度或预算上有哪些硬约束？',
    ],
    opportunities: [
      '目标客户正在面临什么迫切的新变化或痛点？',
      '如何把现有优势快速打包成高客单产品或服务？',
    ],
    threats: [
      '竞争对手正在通过什么打法争夺同一批客户？',
      'AI 或行业变化可能让哪些旧收入模式失效？',
    ],
    conclusion: '聚焦高客单转化结果交付，用真实案例破冰',
  };
}

export const SWOT_SAMPLE_DATA: SwotData = {
  projectLabel: '莫蒂奇 2026 Q4 业务转型',
  date: '2026-11-25',
  strengths: [
    '兼具营销增长判断力与全栈技术/WordPress 生态落地能力',
    '人 + AI 协同将传统 2 周咨询交付压缩至 3–5 天，成本结构显著领先',
    '自有文派与薇晓朵生态天然提供真实试验田与企业决策者流量',
  ],
  weaknesses: [
    '莫蒂奇在外部商业市场知名度起步为零，缺公开标杆案例',
    '核心操盘精力有限，无法承接低客单、重人力的代运营模式',
  ],
  opportunities: [
    '中小企业与开源商业团队普遍有流量却缺转化漏斗和清晰报价体系',
    'AI 时代纯工具软件贬值，客户更愿意为可核验的转化结果和业务资产付费',
  ],
  threats: [
    '通用 AI 对话框与廉价模板站拉低客户对普通营销文档的付费意愿',
    '若过度沉迷打磨工具而延迟商业成交，会消耗宝贵现金流窗口',
  ],
  conclusion: '以纸张级工作台免费引流，靠自有生态真实案例切入 ¥30K–80K 转化重构服务',
};

export function parseSwotData(raw: Record<string, unknown> | undefined, fallbackProjectName?: string): SwotData {
  if (!raw || Object.keys(raw).length === 0) {
    return createDefaultSwotData(fallbackProjectName);
  }
  const parsed = SwotDataSchema.safeParse(raw);
  return parsed.success ? parsed.data : createDefaultSwotData(fallbackProjectName);
}
