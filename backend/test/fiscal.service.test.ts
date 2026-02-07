import { describe, expect, it } from 'vitest';
import { FiscalService } from '../src/modules/fiscal/fiscal.service.js';

describe('FiscalService.simulateScenario', () => {
  it('should calculate projected revenue and delta correctly', () => {
    const service = new FiscalService();

    const result = service.simulateScenario({
      baseRevenue: 1_000_000_000,
      icmsRate: 18,
      fcpRate: 2,
      deltaIcms: 1,
      deltaFcp: 0,
    });

    expect(result.currentEffectiveRate).toBe(20);
    expect(result.projectedEffectiveRate).toBe(21);
    expect(result.variationPercent).toBe(5);
    expect(result.projectedRevenue).toBe(1_050_000_000);
    expect(result.deltaRevenue).toBe(50_000_000);
  });
});
