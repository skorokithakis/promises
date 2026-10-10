import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { PromiseRecord } from './promises'
import {
  STORAGE_KEY,
  addPromise,
  brokenDate,
  brokenNumber,
  brokenOrder,
  counts,
  daysLeft,
  fade,
  getPromises,
  inkFraction,
  isBroken,
  isKeptToday,
  isVisibleInList,
  keepPromise,
  keptNumber,
  keptOrder,
  lightCandle,
  listText,
  litToday,
  localDateKey,
  numberWord,
  recordOpened,
  sentenceText,
  subscribe,
  undoKeep,
} from './promises'

/** A local Date, so tests are independent of the machine's time zone. */
const at = (year: number, month: number, day: number, hour = 12, minute = 0) =>
  new Date(year, month, day, hour, minute)

interface PromiseInput {
  id?: string
  text?: string
  createdAt: Date
  keptAt?: Date
}

function make(input: PromiseInput): PromiseRecord {
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

function makeStorage(overrides: Partial<Storage> = {}): Storage {
  const map = new Map<string, string>()
  return {
    get length() {
      return map.size
    },
    clear: () => {
      map.clear()
    },
    getItem: (key: string) => map.get(key) ?? null,
    key: (index: number) => [...map.keys()][index] ?? null,
    removeItem: (key: string) => {
      map.delete(key)
    },
    setItem: (key: string, value: string) => {
      map.set(key, value)
    },
    ...overrides,
  }
}

/** A working store pre-seeded with `records`, with methods optionally replaced. */
function storageWith(records: PromiseRecord[], overrides: Partial<Storage> = {}): Storage {
  const store = makeStorage()
  store.setItem(STORAGE_KEY, JSON.stringify(records))
  return Object.assign(store, overrides)
}

beforeEach(() => {
  globalThis.localStorage = makeStorage()
})

afterEach(() => {
  Reflect.deleteProperty(globalThis, 'localStorage')
  Reflect.deleteProperty(globalThis, 'alert')
})

describe('daysLeft', () => {
  it('starts at 30 on the day it was made', () => {
    expect(daysLeft(make({ createdAt: at(2026, 0, 15) }), at(2026, 0, 15))).toBe(30)
  })

  it('counts full local days and ignores the time of day', () => {
    expect(daysLeft(make({ createdAt: at(2026, 0, 15, 23, 59) }), at(2026, 0, 16, 0, 1))).toBe(29)
    expect(daysLeft(make({ createdAt: at(2026, 0, 15, 0, 1) }), at(2026, 0, 15, 23, 59))).toBe(30)
  })

  it('reaches 0 after 30 full days and then breaks', () => {
    const promise = make({ createdAt: at(2026, 0, 15) })
    expect(daysLeft(promise, at(2026, 1, 13))).toBe(1)
    expect(isBroken(promise, at(2026, 1, 13))).toBe(false)
    expect(daysLeft(promise, at(2026, 1, 14))).toBe(0)
    expect(isBroken(promise, at(2026, 1, 14))).toBe(true)
    expect(localDateKey(brokenDate(promise))).toBe('2026-02-14')
  })

  it('never breaks a kept promise and pins its ink to full', () => {
    const promise = make({ createdAt: at(2026, 0, 1), keptAt: at(2026, 0, 10) })
    expect(isBroken(promise, at(2026, 5, 1))).toBe(false)
    expect(inkFraction(promise, at(2026, 5, 1))).toBe(1)
  })
})

describe('fade', () => {
  it('is fully inked on the day it was made', () => {
    const promise = make({ createdAt: at(2026, 0, 10) })
    const style = fade(promise, at(2026, 0, 10))
    expect(style.alpha).toBeCloseTo(1)
    expect(style.blur).toBe(0)
    expect(style.letterSpacing).toBe(0)
  })

  it('is at its most faded near the end of the ink', () => {
    const promise = make({ createdAt: at(2026, 0, 10) })
    const style = fade(promise, at(2026, 1, 8))
    expect(style.alpha).toBeLessThan(0.2)
    expect(style.blur).toBe(1.1)
    expect(style.letterSpacing).toBeGreaterThan(0.03)
  })
})

describe('kept visibility', () => {
  const keptAt = at(2026, 0, 10, 9)

  it('stays visible on the day it was kept', () => {
    const promise = make({ createdAt: at(2026, 0, 1), keptAt })
    expect(isKeptToday(promise, at(2026, 0, 10, 23, 59))).toBe(true)
    expect(isVisibleInList(promise, at(2026, 0, 10, 23, 59))).toBe(true)
  })

  it('disappears after local midnight and only counts', () => {
    const promise = make({ createdAt: at(2026, 0, 1), keptAt })
    expect(isKeptToday(promise, at(2026, 0, 11, 0, 1))).toBe(false)
    expect(isVisibleInList(promise, at(2026, 0, 11, 0, 1))).toBe(false)
  })

  it('counts open, kept and broken independently', () => {
    const promises = [
      make({ id: 'open', createdAt: at(2026, 0, 10) }),
      make({ id: 'kept-today', createdAt: at(2026, 0, 1), keptAt: at(2026, 0, 10) }),
      make({ id: 'kept-earlier', createdAt: at(2026, 0, 1), keptAt: at(2026, 0, 9) }),
      make({ id: 'broken', createdAt: at(2025, 11, 1) }),
    ]
    expect(counts(promises, at(2026, 0, 10, 15))).toEqual({ open: 1, kept: 2, broken: 1 })
  })
})

describe('numbering', () => {
  it('numbers kept promises by keep order, ties by creation order', () => {
    const promises = [
      make({ id: 'a', createdAt: at(2026, 0, 1), keptAt: at(2026, 0, 5) }),
      make({ id: 'b', createdAt: at(2026, 0, 2), keptAt: at(2026, 0, 3) }),
      make({ id: 'c', createdAt: at(2026, 0, 1), keptAt: at(2026, 0, 3) }),
    ]
    expect(keptOrder(promises).map((promise) => promise.id)).toEqual(['c', 'b', 'a'])
    expect(keptNumber(promises, 'c')).toBe(1)
    expect(keptNumber(promises, 'b')).toBe(2)
    expect(keptNumber(promises, 'a')).toBe(3)
    expect(keptNumber(promises, 'missing')).toBeUndefined()
  })

  it('numbers broken promises by break date, ties by creation order', () => {
    const promises = [
      make({ id: 'old', createdAt: at(2025, 9, 1) }),
      make({ id: 'new', createdAt: at(2025, 10, 1) }),
      make({ id: 'tie-late', createdAt: at(2025, 9, 15, 9) }),
      make({ id: 'tie-early', createdAt: at(2025, 9, 15, 8) }),
      make({ id: 'first', createdAt: at(2025, 8, 1) }),
    ]
    expect(brokenOrder(promises, at(2026, 5, 1)).map((promise) => promise.id)).toEqual([
      'first',
      'old',
      'tie-early',
      'tie-late',
      'new',
    ])
    expect(brokenNumber(promises, 'first', at(2026, 5, 1))).toBe(1)
    expect(brokenNumber(promises, 'new', at(2026, 5, 1))).toBe(5)
    expect(brokenNumber(promises, 'missing', at(2026, 5, 1))).toBeUndefined()
  })
})

describe('candles', () => {
  it('reports whether a candle was already lit today', () => {
    const promise = make({ createdAt: at(2025, 10, 1) })
    promise.candleDays.push(localDateKey(at(2026, 0, 10)))
    expect(litToday(promise, at(2026, 0, 10, 22))).toBe(true)
    expect(litToday(promise, at(2026, 0, 11))).toBe(false)
  })

  it('lights at most once per local day and again the next day', () => {
    const promise = make({ id: 'broken', createdAt: at(2025, 10, 1) })
    localStorage.setItem(STORAGE_KEY, JSON.stringify([promise]))

    lightCandle('broken', at(2026, 0, 10, 9))
    lightCandle('broken', at(2026, 0, 10, 20))
    expect(getPromises()[0]?.candleDays).toEqual(['2026-01-10'])

    lightCandle('broken', at(2026, 0, 11, 9))
    expect(getPromises()[0]?.candleDays).toEqual(['2026-01-10', '2026-01-11'])
  })

  it('will not light a candle on a promise that is not broken', () => {
    const promise = make({ id: 'open', createdAt: at(2026, 0, 10) })
    localStorage.setItem(STORAGE_KEY, JSON.stringify([promise]))
    lightCandle('open', at(2026, 0, 10, 12))
    expect(getPromises()[0]?.candleDays).toEqual([])
  })
})

describe('text helpers', () => {
  it('upper-cases the first letter for the list form', () => {
    expect(listText('call Mum on Sunday')).toBe('Call Mum on Sunday')
    expect(listText('')).toBe('')
  })

  it('lower-cases the first letter and adds a full stop for the sentence form', () => {
    expect(sentenceText('Back up the photos from the summer')).toBe(
      'back up the photos from the summer.',
    )
    expect(sentenceText('Already done.')).toBe('already done.')
    expect(sentenceText('Really?')).toBe('really?')
    expect(sentenceText('Wait\u2026')).toBe('wait\u2026')
  })
})

describe('numberWord', () => {
  it('spells numbers below 13 and uses digits from 13 up', () => {
    expect(numberWord(0)).toBe('zero')
    expect(numberWord(1)).toBe('one')
    expect(numberWord(12)).toBe('twelve')
    expect(numberWord(13)).toBe('13')
    expect(numberWord(31)).toBe('31')
    expect(numberWord(100)).toBe('100')
  })
})

describe('store', () => {
  it('round-trips records through localStorage', () => {
    const created = addPromise('Call Mum', at(2026, 0, 10))
    expect(created).not.toBe(false)
    if (created === false) return
    expect(getPromises()).toHaveLength(1)
    expect(getPromises()[0]?.text).toBe('Call Mum')

    expect(keepPromise(created.id, at(2026, 0, 12))).toBe(true)
    expect(getPromises()[0]?.keptAt).toBe(at(2026, 0, 12).toISOString())

    undoKeep(created.id)
    expect(getPromises()[0]?.keptAt).toBeUndefined()

    recordOpened(created.id)
    recordOpened(created.id)
    expect(getPromises()[0]?.opened).toBe(2)
  })

  it('notifies subscribers on local writes', () => {
    let calls = 0
    const unsubscribe = subscribe(() => {
      calls += 1
    })

    addPromise('X', at(2026, 0, 10))
    expect(calls).toBe(1)

    unsubscribe()
    addPromise('Y', at(2026, 0, 10))
    expect(calls).toBe(1)
  })

  it('returns an empty list for corrupt storage', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    expect(getPromises()).toEqual([])
  })

  it('returns an empty list when reading storage throws', () => {
    globalThis.localStorage = storageWith([], {
      getItem: () => {
        throw new Error('storage denied')
      },
    })
    expect(getPromises()).toEqual([])
  })

  it('reports a failed add and returns false when storage is unavailable', () => {
    const alert = vi.fn()
    globalThis.alert = alert
    Reflect.deleteProperty(globalThis, 'localStorage')

    expect(addPromise('Call Mum', at(2026, 0, 10))).toBe(false)
    expect(alert).toHaveBeenCalledTimes(1)
    expect(alert).toHaveBeenCalledWith(expect.stringContaining('could not be saved'))
  })

  it('reports a failed write and returns false when setItem throws', () => {
    const alert = vi.fn()
    globalThis.alert = alert
    globalThis.localStorage = storageWith([make({ id: 'p1', createdAt: at(2026, 0, 1) })], {
      setItem: () => {
        throw new Error('quota exceeded')
      },
    })

    expect(keepPromise('p1', at(2026, 0, 2))).toBe(false)
    expect(getPromises()[0]?.keptAt).toBeUndefined()
    expect(alert).toHaveBeenCalledTimes(1)
    expect(alert).toHaveBeenCalledWith(expect.stringContaining('could not be saved'))
  })

  it('refuses to keep a promise that is already kept', () => {
    const created = addPromise('Call Mum', at(2026, 0, 10))
    if (created === false) throw new Error('setup failed')

    expect(keepPromise(created.id, at(2026, 0, 11))).toBe(true)
    const keptAt = getPromises()[0]?.keptAt

    expect(keepPromise(created.id, at(2026, 0, 12))).toBe(false)
    expect(getPromises()[0]?.keptAt).toBe(keptAt)
  })

  it('keeps just before day-30 local midnight but refuses just after', () => {
    const before = addPromise('Before', at(2026, 0, 15))
    const after = addPromise('After', at(2026, 0, 15))
    if (before === false || after === false) throw new Error('setup failed')

    expect(keepPromise(before.id, at(2026, 1, 13, 23, 59))).toBe(true)
    expect(getPromises().find((promise) => promise.id === before.id)?.keptAt).toBe(
      at(2026, 1, 13, 23, 59).toISOString(),
    )

    expect(keepPromise(after.id, at(2026, 1, 14, 0, 0))).toBe(false)
    expect(getPromises().find((promise) => promise.id === after.id)?.keptAt).toBeUndefined()
  })
})
