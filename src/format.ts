/**
 * Copy and date formatting for the light screens.
 *
 * All functions are pure so they can be unit-tested without a DOM: screens call
 * them with an explicit record/`now` and render the returned strings.
 */
import { brokenDate, daysLeft, numberWord } from './promises'
import type { Counts, PromiseRecord } from './promises'

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

const MONTHS_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

/** Roman numerals for the twelve months, used on the kept seal. */
const ROMAN_MONTHS = [
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
  'XI',
  'XII',
] as const

/** `9 Oct` */
export function formatShortDate(date: Date): string {
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()] ?? ''}`
}

/** `10 Oct 2026` */
export function formatFullDate(date: Date): string {
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()] ?? ''} ${date.getFullYear()}`
}

/** `10 · X · 2026`, the kept seal's date line. */
export function formatSealDate(date: Date): string {
  return `${date.getDate()} · ${ROMAN_MONTHS[date.getMonth()] ?? ''} · ${date.getFullYear()}`
}

/** Spoken form of the seal date, e.g. `10 October 2026`. */
export function formatSealLabel(date: Date): string {
  return `${date.getDate()} ${MONTHS_LONG[date.getMonth()] ?? ''} ${date.getFullYear()}`
}

function pluralDays(value: number): string {
  return value === 1 ? '1 day' : `${value} days`
}

/** `3 open · 14 kept · 31 broken`, dropping the broken count when there are none. */
export function countsLine(counts: Counts): string {
  const line = `${counts.open} open · ${counts.kept} kept`
  return counts.broken > 0 ? `${line} · ${counts.broken} broken` : line
}

/** Mobile hall link copy, singular when exactly one promise has broken. */
export function hallLine(broken: number): string {
  return broken === 1
    ? 'Your first broken promise rests in the hall'
    : `${broken} broken promises rest in the hall`
}

/** Open promise meta on small screens: `Promised 9 Oct`. No countdown, on purpose. */
export function openMetaMobile(promise: PromiseRecord): string {
  return `Promised ${formatShortDate(new Date(promise.createdAt))}`
}

/** Open promise meta on wide screens: `Promised 9 Oct · 29 days left`. */
export function openMetaDesktop(promise: PromiseRecord, now: Date): string {
  return `Promised ${formatShortDate(new Date(promise.createdAt))} · ${pluralDays(
    daysLeft(promise, now),
  )} left`
}

/** Kept promise meta shown in the list: `Promised 1 Oct · kept today`. */
export function keptMeta(promise: PromiseRecord): string {
  return `Promised ${formatShortDate(new Date(promise.createdAt))} · kept today`
}

/** Kept screen detail: `Promised 1 Oct. Kept 10 Oct, with 21 days of ink to spare.` */
export function keptSummary(promise: PromiseRecord): string {
  const createdAt = new Date(promise.createdAt)
  const keptAt = new Date(promise.keptAt ?? promise.createdAt)
  return `Promised ${formatShortDate(createdAt)}. Kept ${formatShortDate(
    keptAt,
  )}, with ${pluralDays(daysLeft(promise, keptAt))} of ink to spare.`
}

/** Made screen detail: `Promised 10 Oct 2026 · the ink runs out 9 Nov 2026`. */
export function madeDetail(promise: PromiseRecord): string {
  return `Promised ${formatFullDate(new Date(promise.createdAt))} · the ink runs out ${formatFullDate(
    brokenDate(promise),
  )}`
}

/** Hall subtitle: `<N> things I said I would do. I thought I was better than I am.` */
export function hallSubtitle(broken: number): string {
  const word = numberWord(broken)
  const capitalised = word.slice(0, 1).toUpperCase() + word.slice(1)
  const noun = broken === 1 ? 'thing' : 'things'
  return `${capitalised} ${noun} I said I would do. I thought I was better than I am.`
}

/** Hall plaque meta: `Promised 2 Sep · broken 2 Oct 2026`. */
export function brokenDates(promise: PromiseRecord): string {
  return `Promised ${formatShortDate(new Date(promise.createdAt))} · broken ${formatFullDate(
    brokenDate(promise),
  )}`
}

/** Broken detail count: `1 time` / `6 times`. */
export function timesLabel(count: number): string {
  return count === 1 ? '1 time' : `${count} times`
}

/** Desktop hall footer: `The first broken promise was No. 1, on 14 January 2026.` */
export function hallFooter(firstBrokenAt: Date): string {
  return `The first broken promise was No. 1, on ${formatSealLabel(firstBrokenAt)}.`
}
