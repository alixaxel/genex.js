export function distinct<T = any[]>(data: T[]): T[] {
  return [...new Set(data.map((value) => JSON.stringify(value)))].map((value) => {
    return JSON.parse(value);
  });
}
