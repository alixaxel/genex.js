export function difference<T = any>(a: T[], b: T[]) {
  return [a, b].reduce((a, b) => {
    return a.filter((c) => {
      return b.includes(c) !== true;
    });
  });
};
