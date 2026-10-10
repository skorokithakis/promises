import { describe, expect, it } from 'vitest'
import type { PromiseRecord } from './promises'
import { addLocalDays } from './promises'
import {
  brokenDates,
  countsLine,
  formatFullDate,
  formatSealDate,
  formatSealLabel,
  formatShortDate,
  hallFooter,
  hallLine,
  hallSubtitle,
  keptMeta,
  keptSummary,
  madeDetail,
  openMetaDesktop,
  openMetaMobile,
  timesLabel,
} from './format'

const at = (year: number, month: number, day: number, hour = 12) =>
  new Date(year, month, day, hour)

function make(input: {
  id?: string
  text?: string
  createdAt: Date
  keptAt?: Date
}): PromiseRecord {
  const record: PromiseRecord = {
    id: input.id ?? 'p1',
    text: input.text ?? 'Do the thing',
    createdAt: input.createdAt.toISOString(),
    candleDays: [],
    opened: 0,
  }
  if (input.keptAt) record.keptAt = input.keptAt.toISOString()
  return record
}

describe('date formatting', () => {
  const date = at(2026, 9, 10) // 10 October 2026

  it('formats the short and full list dates', () => {
    expect(formatShortDate(date)).toBe('10 Oct')
    expect(formatFullDate(date)).toBe('10 Oct 2026')
  })

  it('formats the kept seal date and its spoken label', () => {
    expect(formatSealDate(date)).toBe('10 · X · 2026')
    expect(formatSealLabel(date)).toBe('10 October 2026')
    // December is the twelfth month.
    expect(formatSealDate(at(2026, 11, 1))).toBe('1 · XII · 2026')
    // January is the first.
    expect(formatSealDate(at(2026, 0, 1))).toBe('1 · I · 2026')
  })
})

describe('countsLine', () => {
  it('omits the broken count when there are none', () => {
    expect(countsLine({ open: 2, kept: 1, broken: 0 })).toBe('2 open · 1 kept')
  })

  it('includes the broken count when there are any', () => {
    expect(countsLine({ open: 3, kept: 14, broken: 31 })).toBe('3 open · 14 kept · 31 broken')
  })
})

describe('hallLine', () => {
  it('uses the singular copy for the first broken promise', () => {
    expect(hallLine(1)).toBe('Your first broken promise rests in the hall')
  })

  it('uses the plural copy otherwise', () => {
    expect(hallLine(31)).toBe('31 broken promises rest in the hall')
  })
})

describe('promise meta lines', () => {
  it('shows only the promise date on mobile', () => {
    expect(openMetaMobile(make({ createdAt: at(2026, 9, 9) }))).toBe('Promised 9 Oct')
  })

  it('uses the shorter desktop wording', () => {
    expect(openMetaDesktop(make({ createdAt: at(2026, 9, 9) }), at(2026, 9, 10))).toBe(
      'Promised 9 Oct · 29 days left',
    )
  })

  it('marks kept promises as kept today', () => {
    expect(keptMeta(make({ createdAt: at(2026, 9, 1) }))).toBe('Promised 1 Oct · kept today')
  })
})

describe('keptSummary', () => {
  it('reports the days of ink to spare', () => {
    const promise = make({ createdAt: at(2026, 9, 1), keptAt: at(2026, 9, 10) })
    expect(keptSummary(promise)).toBe(
      'Promised 1 Oct. Kept 10 Oct, with 21 days of ink to spare.',
    )
  })

  it('keeps a promise made and kept on the same day fully inked', () => {
    const promise = make({ createdAt: at(2026, 9, 10), keptAt: at(2026, 9, 10) })
    expect(keptSummary(promise)).toBe(
      'Promised 10 Oct. Kept 10 Oct, with 30 days of ink to spare.',
    )
  })
})

describe('madeDetail', () => {
  it('shows the made date and the day the ink runs out', () => {
    const promise = make({ createdAt: at(2026, 9, 10) })
    expect(madeDetail(promise)).toBe(
      'Promised 10 Oct 2026 · the ink runs out 9 Nov 2026',
    )
  })

  it('agrees with addLocalDays for month boundaries', () => {
    const promise = make({ createdAt: at(2026, 0, 31) })
    expect(madeDetail(promise)).toContain(formatFullDate(addLocalDays(at(2026, 0, 31), 30)))
  })
})

describe('hallSubtitle', () => {
  it('spells numbers below 13 as words with a capital at the sentence start', () => {
    expect(hallSubtitle(3)).toBe(
      'Three things I said I would do. I thought I was better than I am.',
    )
    expect(hallSubtitle(12)).toBe(
      'Twelve things I said I would do. I thought I was better than I am.',
    )
  })

  it('uses the singular noun for exactly one broken promise', () => {
    expect(hallSubtitle(1)).toBe(
      'One thing I said I would do. I thought I was better than I am.',
    )
  })

  it('uses digits from 13 up', () => {
    expect(hallSubtitle(31)).toBe(
      '31 things I said I would do. I thought I was better than I am.',
    )
  })
})

describe('brokenDates', () => {
  it('pairs the short promised date with the full broken date', () => {
    const promise = make({ createdAt: at(2026, 8, 2) })
    expect(brokenDates(promise)).toBe('Promised 2 Sep · broken 2 Oct 2026')
  })
})

describe('timesLabel', () => {
  it('uses the singular for one viewing and the plural otherwise', () => {
    expect(timesLabel(1)).toBe('1 time')
    expect(timesLabel(6)).toBe('6 times')
    expect(timesLabel(0)).toBe('0 times')
  })
})

describe('hallFooter', () => {
  it('names the first broken promise and its full date', () => {
    expect(hallFooter(at(2026, 0, 14))).toBe(
      'The first broken promise was No. 1, on 14 January 2026.',
    )
  })
})
