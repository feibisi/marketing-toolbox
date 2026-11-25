import { describe, expect, it } from 'vitest';
import {
  clampConfidence,
  computeObjectiveConfidence,
  computeOverallConfidence,
  getConfidenceLevel,
} from '../src/tools/okr-cascade/math';

describe('OKR confidence math', () => {
  it('clamps confidence values to [0, 10]', () => {
    expect(clampConfidence(-3)).toBe(0);
    expect(clampConfidence(14)).toBe(10);
    expect(clampConfidence(7.6)).toBe(8);
    expect(clampConfidence(Number.NaN)).toBe(0);
  });

  it('computes objective and overall confidence accurately', () => {
    const obj1 = {
      id: 'o1',
      title: '目标一',
      keyResults: [
        { id: 'k1', title: 'KR1', confidence: 8 },
        { id: 'k2', title: 'KR2', confidence: 6 },
      ],
    };
    const obj2 = {
      id: 'o2',
      title: '目标二',
      keyResults: [{ id: 'k3', title: 'KR3', confidence: 4 }],
    };

    expect(computeObjectiveConfidence(obj1)).toBe(70);
    expect(computeObjectiveConfidence(obj2)).toBe(40);
    expect(computeOverallConfidence([obj1, obj2])).toBe(55);
  });

  it('handles empty objectives and KRs safely', () => {
    expect(computeObjectiveConfidence({ id: 'e', title: '', keyResults: [] })).toBeNull();
    expect(computeOverallConfidence([])).toBeNull();
    expect(getConfidenceLevel(null)).toBe('empty');
    expect(getConfidenceLevel(75)).toBe('high');
    expect(getConfidenceLevel(50)).toBe('medium');
    expect(getConfidenceLevel(20)).toBe('low');
  });
});
