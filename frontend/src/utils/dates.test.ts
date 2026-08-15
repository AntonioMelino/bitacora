import { describe, expect, it } from 'vitest'
import { alignEndDate } from './dates'

describe('alignEndDate', () => {
  it('returns the start date when the end date is empty', () => {
    expect(alignEndDate('2026-03-10', '')).toBe('2026-03-10')
  })

  it('returns the start date when the end date is before the new start date', () => {
    expect(alignEndDate('2026-03-10', '2026-03-05')).toBe('2026-03-10')
  })

  it('preserves the end date when it is after the start date', () => {
    expect(alignEndDate('2026-03-10', '2026-03-20')).toBe('2026-03-20')
  })

  it('preserves the end date when it exactly equals the start date', () => {
    expect(alignEndDate('2026-03-10', '2026-03-10')).toBe('2026-03-10')
  })

  it('handles a year boundary correctly via lexicographic comparison', () => {
    expect(alignEndDate('2026-01-01', '2025-12-31')).toBe('2026-01-01')
    expect(alignEndDate('2025-12-31', '2026-01-01')).toBe('2026-01-01')
  })
})
