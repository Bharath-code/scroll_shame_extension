const PREFIX = 'day-';

export function todayKey(date: Date): string {
  return keyForDate(date);
}

export function keyForDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${PREFIX}${year}-${month}-${day}`;
}

export function parseKey(key: string): Date | null {
  if (!key.startsWith(PREFIX)) return null;
  
  const parts = key.replace(PREFIX, '').split('-').map(Number);
  if (parts.length !== 3) return null;
  
  const [year, month, day] = parts;
  
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  
  return new Date(year, month - 1, day);
}

export function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(keyForDate(d));
  }
  return days;
}

export function getDateRangeKeys(startDate: Date, endDate: Date): string[] {
  // Validate inputs
  if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
    return [];
  }
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return [];
  }

  const keys: string[] = [];
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  while (current <= end) {
    keys.push(keyForDate(new Date(current)));
    current.setDate(current.getDate() + 1);
  }
  return keys;
}