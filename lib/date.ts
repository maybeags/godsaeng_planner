// KST(한국 표준시) 공용 유틸. 앱 전체가 KST 기준 wall-clock 으로 동작.
// 트릭: `Date.now() + 9h` 로 만든 Date 의 UTC 필드가 KST wall time 과 같아짐.

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

export function kstNow(): Date {
  return new Date(Date.now() + KST_OFFSET_MS);
}

export function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDaysUtc(d: Date, days: number): Date {
  const next = new Date(d);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function startOfDayUtc(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

/** 오늘 KST 의 YYYY-MM-DD */
export function todayIsoDate(): string {
  return toIsoDate(kstNow());
}

/** "방금 전" / "N분 전" / "N시간 전" / "N일 전" / "M/D" */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const diff = Math.max(0, now.getTime() - t);
  const sec = Math.floor(diff / 1000);
  if (sec < 30) return "방금 전";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}일 전`;
  const kst = new Date(t + 9 * 60 * 60 * 1000);
  return `${kst.getUTCMonth() + 1}/${kst.getUTCDate()}`;
}

export type MonthGridCell = {
  iso: string;
  d: number;
  dow: number; // 0=Sun ... 6=Sat
  isCurrent: boolean; // 인자로 받은 월에 속한 날인지
};

/** 6주(42일) × 7일 그리드. 1일 요일 기준으로 앞은 전 달, 뒤는 다음 달로 채움. */
export function buildMonthGrid(year: number, month: number): MonthGridCell[] {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const firstDow = first.getUTCDay();
  const start = new Date(Date.UTC(year, month - 1, 1 - firstDow));

  const cells: MonthGridCell[] = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + i);
    const y = date.getUTCFullYear();
    const m = date.getUTCMonth() + 1;
    const d = date.getUTCDate();
    const iso = `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({
      iso,
      d,
      dow: date.getUTCDay(),
      isCurrent: m === month,
    });
  }
  return cells;
}
