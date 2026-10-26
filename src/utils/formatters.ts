const numberFormatter = new Intl.NumberFormat('id-ID');
const timeFormatter = new Intl.DateTimeFormat('id-ID', {
  hour: '2-digit',
  minute: '2-digit',
});
const dateTimeFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'long',
  timeStyle: 'medium',
});

type DateValue = string | number | Date | null | undefined;

function toValidDate(value: DateValue): Date | null {
  if (value === null || value === undefined || value === '') return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatTime(value: DateValue): string | null {
  const date = toValidDate(value);
  return date ? timeFormatter.format(date) : null;
}

export function formatDateTime(value: DateValue): string | null {
  const date = toValidDate(value);
  return date ? dateTimeFormatter.format(date) : null;
}

export function formatFixed(
  value: number | null | undefined,
  fractionDigits: number,
): string | null {
  return value === null || value === undefined ? null : value.toFixed(fractionDigits);
}

export function formatSpeedKph(value: number | null, fallback: string): string {
  const speed = formatFixed(value, 1);
  return speed === null ? fallback : `${speed} km/jam`;
}
