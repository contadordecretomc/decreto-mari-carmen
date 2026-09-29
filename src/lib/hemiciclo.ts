// Parliament-arch layout: concentric rows whose seat counts grow with the
// radius, then every seat sorted by angle so each group fills a wedge.

export interface Seat {
  x: number;
  y: number;
}

export const WIDTH = 1000;
export const HEIGHT = 520;
const CX = WIDTH / 2;
const CY = HEIGHT - 20;
const R = 470;
const ROWS = 12;
const INNER = 0.38;

export const SEAT_R = ((R * (1 - INNER)) / (ROWS - 1)) * 0.4;

export function seatLayout(total: number): Seat[] {
  const radii = Array.from({ length: ROWS }, (_, i) => INNER + ((1 - INNER) * i) / (ROWS - 1));
  const sum = radii.reduce((a, b) => a + b, 0);
  const counts = radii.map((r) => Math.floor((total * r) / sum));
  // Hand the rounding remainder to the outer (longest) rows.
  for (let i = ROWS - 1, left = total - counts.reduce((a, b) => a + b, 0); left > 0; i = (i - 1 + ROWS) % ROWS, left--) {
    counts[i]++;
  }

  const seats: (Seat & { angle: number; r: number })[] = [];
  radii.forEach((r, row) => {
    const n = counts[row];
    for (let j = 0; j < n; j++) {
      const angle = Math.PI * (1 - j / (n - 1));
      seats.push({ x: CX + R * r * Math.cos(angle), y: CY - R * r * Math.sin(angle), angle, r });
    }
  });
  seats.sort((a, b) => b.angle - a.angle || a.r - b.r);
  return seats.map(({ x, y }) => ({ x, y }));
}
