export const TAU = Math.PI * 2;
export const HALF_PI = Math.PI / 2;
export const DEG = Math.PI / 180;

export const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

export const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);

export const easeInOutCubic = (x) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

export const smoothstep = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};




export const signedOffset = (i) =>
  i === 0 ? 0 : i % 2 === 1 ? (i + 1) / 2 : -i / 2;



export const chase = (dt, rate) => 1 - Math.pow(1 - rate, dt * 60);
