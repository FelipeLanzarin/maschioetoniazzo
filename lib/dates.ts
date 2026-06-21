/**
 * Returns UTC midnight of today's LOCAL date.
 * Using local date (not UTC) so 22h Brazil time still counts as "today Brazil",
 * not "tomorrow UTC".
 */
export function startOfToday(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
}
