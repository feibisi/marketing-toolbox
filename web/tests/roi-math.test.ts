import { describe, expect, it } from 'vitest';
import { computeRoiMetrics, formatMoney } from '../src/tools/roi-calculator/math';
import { createDefaultRoiData } from '../src/tools/roi-calculator/schema';

describe('ROI calculator math engine', () => {
  it('computes standard ROI, ROAS, CAC, ARPU accurately', () => {
    const input = createDefaultRoiData();
    const metrics = computeRoiMetrics(input);

    expect(metrics.totalCost).toBe(110000);
    expect(metrics.netProfit).toBe(390000);
    expect(metrics.roiPercent).toBeCloseTo(354.545, 2);
    expect(metrics.roas).toBeCloseTo(6.25, 2);
    expect(metrics.cac).toBeCloseTo(110, 2);
    expect(metrics.arpu).toBeCloseTo(500, 2);
    expect(metrics.ratingTier).toBe('excellent');
  });

  it('handles zero cost, zero adSpend, and zero conversions without NaN or Infinity', () => {
    const metrics = computeRoiMetrics({
      ...createDefaultRoiData(),
      revenue: 10000,
      conversions: 0,
      adSpend: 0,
      laborCost: 0,
      toolsCost: 0,
      otherCost: 0,
    });

    expect(metrics.totalCost).toBe(0);
    expect(metrics.roiPercent).toBeNull();
    expect(metrics.roas).toBeNull();
    expect(metrics.cac).toBeNull();
    expect(metrics.arpu).toBeNull();
    expect(formatMoney(metrics.cac, '¥')).toBe('--');
  });

  it('computes negative profit and scenario simulation diff accurately', () => {
    const metrics = computeRoiMetrics({
      ...createDefaultRoiData(),
      revenue: 50000,
      adSpend: 80000,
      laborCost: 20000,
      toolsCost: 0,
      otherCost: 0,
      cvrLiftPercent: 50,
      costOptPercent: 20,
    });

    expect(metrics.netProfit).toBe(-50000);
    expect(metrics.roiPercent).toBeCloseTo(-50, 2);
    expect(metrics.ratingTier).toBe('poor');
    // Simulated revenue = 75,000; simulated cost = 80,000 => -6.25%
    expect(metrics.simulatedRoiPercent).toBeCloseTo(-6.25, 2);
    expect(metrics.roiDiffPercent).toBeCloseTo(43.75, 2);
    expect(formatMoney(metrics.netProfit, '¥')).toBe('-¥50,000');
  });
});
