export function toLocalInputValue(utcIso: string): string {
  const d = new Date(utcIso)
  const offset = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - offset).toISOString().slice(0, 16)
}

export function toUtcIso(localInputValue: string): string {
  return new Date(localInputValue).toISOString()
}