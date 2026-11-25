import { z } from 'zod';

export const EntityTypeSchema = z.enum([
  'company_profile',
  'offer',
  'icp_segment',
  'competitor',
  'messaging',
  'channel_plan',
  'funnel_metric',
  'sales_enablement',
]);

export type EntityType = z.infer<typeof EntityTypeSchema>;

export const EntityStatusSchema = z.enum(['draft', 'confirmed']);
export type EntityStatus = z.infer<typeof EntityStatusSchema>;

export const CanonicalEntitySchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  entityType: EntityTypeSchema,
  slug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().default(''),
  payload: z.record(z.string(), z.unknown()).default({}),
  sourceToolId: z.string().optional(),
  status: EntityStatusSchema.default('draft'),
  updatedAt: z.string(),
  version: z.number().int().min(1).default(1),
});

export type CanonicalEntity = z.infer<typeof CanonicalEntitySchema>;

export interface EntityTypeMeta {
  type: EntityType;
  label: string;
  enLabel: string;
  description: string;
}

export const ENTITY_TYPE_META: Record<EntityType, EntityTypeMeta> = {
  company_profile: {
    type: 'company_profile',
    label: '公司与品牌档案',
    enLabel: 'Company Profile',
    description: '核心优势、硬约束、战略愿景与商业阶段',
  },
  offer: {
    type: 'offer',
    label: '货盘与定价',
    enLabel: 'Offer & Pricing',
    description: '产品服务目录、定价阶梯与交付边界',
  },
  icp_segment: {
    type: 'icp_segment',
    label: '目标客群与决策人',
    enLabel: 'ICP & Decision Maker',
    description: '核心客群、预算特征、痛点与切换触发点',
  },
  competitor: {
    type: 'competitor',
    label: '竞品档案',
    enLabel: 'Competitor',
    description: '主要对手定位坐标、价格带与可验证优劣势',
  },
  messaging: {
    type: 'messaging',
    label: '核心卖点与证明',
    enLabel: 'Messaging & Proof',
    description: '定位陈述、三大卖点支柱、案例证明与禁词',
  },
  channel_plan: {
    type: 'channel_plan',
    label: '获客渠道与内容',
    enLabel: 'Channel & Content',
    description: '渠道分工、内容支柱、UTM 规范与排期',
  },
  funnel_metric: {
    type: 'funnel_metric',
    label: '漏斗与 ROI 指标',
    enLabel: 'Funnel & ROI Metrics',
    description: '收入、成本、转化率、ROI、ROAS、CAC 与 ARPU',
  },
  sales_enablement: {
    type: 'sales_enablement',
    label: '销售支持与报价规则',
    enLabel: 'Sales Enablement',
    description: 'MQL/SQL 评分标准、报价单结构与异议应答',
  },
};
