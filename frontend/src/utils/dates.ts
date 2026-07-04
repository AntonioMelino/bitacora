/**
 * When a "start" date changes, the paired "end" date should land on the
 * same month/year so its date picker doesn't open on today's date.
 * Only overwrites the end date when it's empty or no longer valid
 * (before the new start), preserving any end date the user already chose.
 */
export function alignEndDate(newStartDate: string, currentEndDate: string): string {
  if (!currentEndDate || currentEndDate < newStartDate) {
    return newStartDate
  }
  return currentEndDate
}
