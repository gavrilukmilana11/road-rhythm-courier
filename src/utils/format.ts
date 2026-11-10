/** 1240 -> "1,240" - plain grouping, no currency symbol anywhere in this app */
export function groupNumber(value: number): string {
  const safe = Number.isFinite(value) ? Math.round(value) : 0;
  return String(safe).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** 7 -> "LANE 07" */
export function padLane(value: number): string {
  const safe = Math.max(0, Math.round(value));
  return safe < 10 ? '0' + safe : String(safe);
}

export function percent(part: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return Math.round((part / total) * 100);
}

/** 24611 seconds -> "06:50:11" */
export function clock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const two = (n: number) => (n < 10 ? '0' + n : String(n));
  return two(h) + ':' + two(m) + ':' + two(sec);
}

export function multLabel(mult: number): string {
  return mult.toFixed(1) + 'x';
}
