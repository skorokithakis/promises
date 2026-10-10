/**
 * The promise model, every derived rule, and the localStorage-backed store.
 *
 * This is the single module that owns promise data, so screens only render and
 * sync can later replace just this file. All rules are pure functions that take
 * an explicit `now` so they can be tested around day boundaries; store
 * mutators accept an optional `now` and default to the wall clock.
 */
import { useEffect, useState } from 'preact/hooks'

/** Days of ink a promise is made with. */
export const LIFESPAN_DAYS = 30

/** Versioned localStorage key; the whole dataset lives under this one key. */
export const STORAGE_KEY = 'promises:v1'

export interface PromiseRecord {
  id: string
  /** The text exactly as the user typed it. */
  text: string
  /** Creation instant, ISO 8601. */
  createdAt: string
  /** Instant the promise was kept, if it was, ISO 8601. */
  keptAt?: string
  /** Local calendar days ('YYYY-MM-DD') on which a candle was lit. */
  candleDays: string[]
  /** Number of times the broken-promise detail screen has been viewed. */
  opened: number
}

const DAY_MS = 86_400_000

// --- Local calendar helpers -------------------------------------------------

/** Format a Date as its local calendar day, e.g. `2026-10-10`. */
export function localDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Whole local calendar days from `since` to `now`, ignoring the time of day. */
export function fullLocalDaysSince(now: Date, since: Date): number {
  const to = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  const from = Date.UTC(since.getFullYear(), since.getMonth(), since.getDate())
  return Math.round((to - from) / DAY_MS)
}

/** Add whole local days, preserving the time of day (handles month ends/DST). */
export function addLocalDays(date: Date, days: number): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + days,
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds(),
  )
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function time(value: string | undefined): number {
  return value ? new Date(value).getTime() : 0
}

// --- Derived rules ----------------------------------------------------------

/**
 * Days of ink left: 30 minus the full local calendar days since `createdAt`.
 * A promise made today has 30, one made 29 days ago has 1, and at 30 it has 0.
 * Kept promises keep their raw value; use `inkFraction` for the visual amount.
 */
export function daysLeft(promise: PromiseRecord, now: Date): number {
  return LIFESPAN_DAYS - fullLocalDaysSince(now, new Date(promise.createdAt))
}

/** An unkept promise is broken once it has run out of ink. */
export function isBroken(promise: PromiseRecord, now: Date): boolean {
  return !promise.keptAt && daysLeft(promise, now) <= 0
}

/** The local date an unkept promise breaks: `createdAt` + 30 days. */
export function brokenDate(promise: PromiseRecord): Date {
  return addLocalDays(new Date(promise.createdAt), LIFESPAN_DAYS)
}

/** Ink remaining as a 0..1 fraction; 1 once kept. */
export function inkFraction(promise: PromiseRecord, now: Date): number {
  if (promise.keptAt) return 1
  return clamp(daysLeft(promise, now) / LIFESPAN_DAYS, 0, 1)
}

export interface Fade {
  alpha: number
  /** Blur in px. */
  blur: number
  /** Letter spacing in em. */
  letterSpacing: number
}

/**
 * Visual fade rules from `design/mobile-list.html`, driven by the ink
 * fraction. Screens format/round these as needed.
 */
export function fade(promise: PromiseRecord, now: Date): Fade {
  const ink = inkFraction(promise, now)
  return {
    alpha: 0.12 + 0.88 * ink ** 0.8,
    blur: promise.keptAt ? 0 : ink < 0.12 ? 1.1 : ink < 0.25 ? 0.6 : ink < 0.4 ? 0.25 : 0,
    letterSpacing: (1 - ink) * 0.035,
  }
}

/** Whether a kept promise was kept on the same local day as `now`. */
export function isKeptToday(promise: PromiseRecord, now: Date): boolean {
  return (
    promise.keptAt !== undefined &&
    localDateKey(new Date(promise.keptAt)) === localDateKey(now)
  )
}

/**
 * Whether a promise belongs in the open list. Kept promises stay there for the
 * rest of the local day they were kept, then only count; broken ones go to the
 * hall.
 */
export function isVisibleInList(promise: PromiseRecord, now: Date): boolean {
  if (isBroken(promise, now)) return false
  if (promise.keptAt !== undefined) return isKeptToday(promise, now)
  return true
}

export interface Counts {
  open: number
  kept: number
  broken: number
}

/** Totals across all promises: open (still on the list), kept and broken. */
export function counts(promises: PromiseRecord[], now: Date): Counts {
  let open = 0
  let kept = 0
  let broken = 0
  for (const promise of promises) {
    if (promise.keptAt !== undefined) kept += 1
    else if (isBroken(promise, now)) broken += 1
    else open += 1
  }
  return { open, kept, broken }
}

// --- Numbering --------------------------------------------------------------

/** Kept promises, earliest keep first, ties broken by creation order. */
export function keptOrder(promises: PromiseRecord[]): PromiseRecord[] {
  return promises
    .filter((promise) => promise.keptAt !== undefined)
    .sort(
      (a, b) =>
        time(a.keptAt) - time(b.keptAt) || time(a.createdAt) - time(b.createdAt),
    )
}

/** Broken promises, earliest break first, ties broken by creation order. */
export function brokenOrder(promises: PromiseRecord[], now: Date): PromiseRecord[] {
  return promises
    .filter((promise) => isBroken(promise, now))
    .sort(
      (a, b) =>
        brokenDate(a).getTime() - brokenDate(b).getTime() ||
        time(a.createdAt) - time(b.createdAt),
    )
}

/** 1-based kept number, or undefined when the promise is not kept. */
export function keptNumber(promises: PromiseRecord[], id: string): number | undefined {
  const index = keptOrder(promises).findIndex((promise) => promise.id === id)
  return index === -1 ? undefined : index + 1
}

/** 1-based broken number, or undefined when the promise is not broken. */
export function brokenNumber(
  promises: PromiseRecord[],
  id: string,
  now: Date,
): number | undefined {
  const index = brokenOrder(promises, now).findIndex((promise) => promise.id === id)
  return index === -1 ? undefined : index + 1
}

// --- Candles ----------------------------------------------------------------

/** Whether a candle has already been lit for this promise on `now`'s day. */
export function litToday(promise: PromiseRecord, now: Date): boolean {
  return promise.candleDays.includes(localDateKey(now))
}

/** A candle can be lit on a broken promise at most once per local day. */
export function canLightCandle(promise: PromiseRecord, now: Date): boolean {
  return isBroken(promise, now) && !litToday(promise, now)
}

// --- Text helpers -----------------------------------------------------------

const SENTENCE_END = /[.!?\u2026][)\]"'\u2019\u201d]?$/

/** List form: the first letter upper-cased, the rest left as typed. */
export function listText(text: string): string {
  return text.slice(0, 1).toUpperCase() + text.slice(1)
}

/**
 * Sentence form: the first letter lower-cased, with a full stop appended when
 * the text does not already end in punctuation.
 */
export function sentenceText(text: string): string {
  if (text.length === 0) return text
  const sentence = text.slice(0, 1).toLowerCase() + text.slice(1)
  return SENTENCE_END.test(sentence.trimEnd()) ? sentence : `${sentence}.`
}

const NUMBER_WORDS = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
] as const

/** Numbers below 13 as words (zero..twelve); 13 and up as digits. */
export function numberWord(value: number): string {
  return NUMBER_WORDS[value] ?? String(value)
}

// --- Store ------------------------------------------------------------------

type Listener = () => void

const listeners = new Set<Listener>()

/** Register a listener called whenever the stored data may have changed. */
export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function emit(): void {
  for (const listener of [...listeners]) listener()
}

function storage(): Storage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage
  } catch {
    return undefined
  }
}

function parseRecord(value: unknown): PromiseRecord | undefined {
  if (typeof value !== 'object' || value === null) return undefined
  const raw = value as Record<string, unknown>
  if (
    typeof raw.id !== 'string' ||
    typeof raw.text !== 'string' ||
    typeof raw.createdAt !== 'string'
  ) {
    return undefined
  }
  const record: PromiseRecord = {
    id: raw.id,
    text: raw.text,
    createdAt: raw.createdAt,
    candleDays: Array.isArray(raw.candleDays)
      ? raw.candleDays.filter((day): day is string => typeof day === 'string')
      : [],
    opened: typeof raw.opened === 'number' ? raw.opened : 0,
  }
  if (typeof raw.keptAt === 'string') record.keptAt = raw.keptAt
  return record
}

/**
 * All stored promises, or an empty list when storage is unavailable, a read
 * throws, or the stored value is missing/corrupt.
 */
export function getPromises(): PromiseRecord[] {
  const store = storage()
  if (!store) return []
  try {
    const raw = store.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map(parseRecord)
      .filter((record): record is PromiseRecord => record !== undefined)
  } catch {
    return []
  }
}

const SAVE_FAILURE_MESSAGE = 'This promise could not be saved on this device.'

function alertSaveFailure(): void {
  if (typeof globalThis.alert === 'function') globalThis.alert(SAVE_FAILURE_MESSAGE)
}

/**
 * Persist records, notifying listeners on success. Returns false (and alerts
 * once) when storage is unavailable or the write throws, so callers can avoid
 * acting as if the change was saved.
 */
function write(records: PromiseRecord[]): boolean {
  const store = storage()
  if (!store) {
    alertSaveFailure()
    return false
  }
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch {
    alertSaveFailure()
    return false
  }
  emit()
  return true
}

function newId(): string {
  const cryptoApi = globalThis.crypto
  if (cryptoApi && typeof cryptoApi.randomUUID === 'function') {
    return cryptoApi.randomUUID()
  }
  return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/**
 * Create and persist a new promise. Returns the stored record, or false when
 * the save failed and the caller should not treat it as created.
 */
export function addPromise(text: string, now: Date = new Date()): PromiseRecord | false {
  const record: PromiseRecord = {
    id: newId(),
    text,
    createdAt: now.toISOString(),
    candleDays: [],
    opened: 0,
  }
  return write([...getPromises(), record]) ? record : false
}

/**
 * Mark a promise as kept, returning whether it was saved. Refuses (false) when
 * the promise is missing, already kept, or has already broken by `now`.
 */
export function keepPromise(id: string, now: Date = new Date()): boolean {
  const records = getPromises()
  const target = records.find((promise) => promise.id === id)
  if (!target || target.keptAt !== undefined || isBroken(target, now)) return false
  return write(
    records.map((promise) =>
      promise.id === id ? { ...promise, keptAt: now.toISOString() } : promise,
    ),
  )
}

/** Undo keep by clearing `keptAt`. */
export function undoKeep(id: string): void {
  write(
    getPromises().map((promise) => {
      if (promise.id !== id || promise.keptAt === undefined) return promise
      return {
        id: promise.id,
        text: promise.text,
        createdAt: promise.createdAt,
        candleDays: promise.candleDays,
        opened: promise.opened,
      }
    }),
  )
}

/** Light a candle on a broken promise, at most once per local day. */
export function lightCandle(id: string, now: Date = new Date()): void {
  const records = getPromises()
  const target = records.find((promise) => promise.id === id)
  if (!target || !canLightCandle(target, now)) return
  const day = localDateKey(now)
  write(
    records.map((promise) =>
      promise.id === id ? { ...promise, candleDays: [...promise.candleDays, day] } : promise,
    ),
  )
}

/** Record that the broken-promise detail screen was viewed. */
export function recordOpened(id: string): void {
  write(
    getPromises().map((promise) =>
      promise.id === id ? { ...promise, opened: promise.opened + 1 } : promise,
    ),
  )
}

/**
 * The current promise records, re-rendering on local changes and on cross-tab
 * `storage` events. Derived rules still take an explicit `now`, so screens
 * pass `new Date()` (or their own clock) at render time.
 */
export function usePromises(): PromiseRecord[] {
  const [promises, setPromises] = useState<PromiseRecord[]>(() => getPromises())
  useEffect(() => subscribe(() => setPromises(getPromises())), [])
  return promises
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY || event.key === null) emit()
  })
}
