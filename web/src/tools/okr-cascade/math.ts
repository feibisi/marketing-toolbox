import type { Objective } from './schema';

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'empty';

export function clampConfidence(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(10, Math.round(value)));
}

export function computeObjectiveConfidence(objective: Objective): number | null {
  if (objective.keyResults.length === 0) return null;
  const total = objective.keyResults.reduce((sum, kr) => sum + clampConfidence(kr.confidence), 0);
  return Math.round((total / (objective.keyResults.length * 10)) * 100);
}

export function computeOverallConfidence(objectives: Objective[]): number | null {
  const scores = objectives
    .map((obj) => computeObjectiveConfidence(obj))
    .filter((score): score is number => score !== null);
  if (scores.length === 0) return null;
  const total = scores.reduce((sum, s) => sum + s, 0);
  return Math.round(total / scores.length);
}

export function getConfidenceLevel(percent: number | null): ConfidenceLevel {
  if (percent === null) return 'empty';
  if (percent >= 70) return 'high';
  if (percent >= 40) return 'medium';
  return 'low';
}
