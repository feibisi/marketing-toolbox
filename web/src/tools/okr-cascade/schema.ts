import { z } from 'zod';

export const KeyResultSchema = z.object({
  id: z.string(),
  title: z.string().default(''),
  confidence: z.number().min(0).max(10).default(5),
});

export const ObjectiveSchema = z.object({
  id: z.string(),
  title: z.string().default(''),
  keyResults: z.array(KeyResultSchema).default([]),
});

export const OkrCascadeDataSchema = z.object({
  cycle: z.string().default('2026 Q4'),
  owner: z.string().default(''),
  vision: z.string().default(''),
  objectives: z.array(ObjectiveSchema).default([]),
});

export type KeyResult = z.infer<typeof KeyResultSchema>;
export type Objective = z.infer<typeof ObjectiveSchema>;
export type OkrCascadeData = z.infer<typeof OkrCascadeDataSchema>;

export function createDefaultOkrData(owner = ''): OkrCascadeData {
  return {
    cycle: '2026 Q4',
    owner: owner || '增长负责人',
    vision: '以高客单转化结果为核心，构建莫蒂奇可复制的营销工作台与生态转化引擎。',
    objectives: [
      {
        id: 'obj-1',
        title: '跑通莫蒂奇拳头产品 v3 底座与真实业务样板',
        keyResults: [
          { id: 'kr-1', title: '完成 P0–P1 12 个核心画布与项目总报告并验收通过', confidence: 8 },
          { id: 'kr-2', title: '用真实数据完成文派与薇晓朵各 1 套完整转化诊断报告', confidence: 7 },
        ],
      },
      {
        id: 'obj-2',
        title: '提升核心产品着陆页与咨询线索转化率',
        keyResults: [
          { id: 'kr-3', title: '核心销售页咨询点击率相对基线提升 40%', confidence: 6 },
          { id: 'kr-4', title: '建立标准化报价单与 MQL 评分规则，成交周期缩短 25%', confidence: 6 },
        ],
      },
    ],
  };
}

export const OKR_SAMPLE_DATA: OkrCascadeData = {
  cycle: '2027 Q1',
  owner: 'feibisi / modiqi',
  vision: '通过“免费纸张级工作台 + 高客单转化交付 + 文派生态互补”，实现莫蒂奇首批稳定正向商业现金流。',
  objectives: [
    {
      id: 'obj-s1',
      title: '交付 Marketing Toolbox v3 全套 30 核心工具与在线服务',
      keyResults: [
        { id: 'kr-s1', title: '6 条工作流 × 30 核心工具 100% 通过桌面/移动/打印三态验收', confidence: 8 },
        { id: 'kr-s2', title: '上线云同步、只读客户分享短链与高清 PDF 报告导出', confidence: 7 },
        { id: 'kr-s3', title: '沉淀 3 套分行业（开源商业/B2B企服/出海品牌）示范数据包', confidence: 8 },
      ],
    },
    {
      id: 'obj-s2',
      title: '先帮文派生态与薇晓朵跑出可量化的转化增长案例',
      keyResults: [
        { id: 'kr-s4', title: '完成薇晓朵企业建站套餐与报价体系重构，客单价提升 30%', confidence: 7 },
        { id: 'kr-s5', title: '完成译笺与云桥授权落地页改版，试用转付费率提升至 8%+', confidence: 6 },
      ],
    },
    {
      id: 'obj-s3',
      title: '验证莫蒂奇外部付费转化诊断与重构服务',
      keyResults: [
        { id: 'kr-s6', title: '通过 modiqi.com 新版六大栏目与工作台获得 20 个有效诊断预约', confidence: 5 },
        { id: 'kr-s7', title: '签约 3 个付费诊断包并成功转化至少 1 个 ¥30K+ 重构项目', confidence: 6 },
      ],
    },
  ],
};

export function parseOkrData(raw: Record<string, unknown> | undefined, owner?: string): OkrCascadeData {
  if (!raw || Object.keys(raw).length === 0) {
    return createDefaultOkrData(owner);
  }
  const parsed = OkrCascadeDataSchema.safeParse(raw);
  return parsed.success ? parsed.data : createDefaultOkrData(owner);
}
