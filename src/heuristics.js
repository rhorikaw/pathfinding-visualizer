export function manhattan(start, finish) {
  return Math.abs(start.row - finish.row) + Math.abs(start.col - finish.col);
}

export function euclidian(start, finish) {
  return Math.sqrt(
    (start.row - finish.row) ** 2 + (start.col - finish.col) ** 2
  );
}

export function chebyshev(start, finish) {}

export function octile(start, finish) {}
