/**
 * 将对象数组转为 CSV 字符串，支持 Excel UTF-8（带 BOM）
 */
function escapeCsvCell(value: unknown): string {
  if (value == null) return '';
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCSV<T extends Record<string, unknown>>(
  rows: T[],
  columns: { key: string; header: string }[]
): string {
  const BOM = '\uFEFF';
  const headerRow = columns.map((c) => escapeCsvCell(c.header)).join(',');
  const dataRows = rows.map((row) =>
    columns.map((c) => escapeCsvCell((row as Record<string, unknown>)[c.key])).join(',')
  );
  return BOM + [headerRow, ...dataRows].join('\r\n');
}
