  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  export function step(state, bounds, elapsed) {
    const dt = clamp(elapsed, 0, 1 / 30);
    const next = { ...state, impact: false };
    next.vy += 1050 * dt;
    next.x += next.vx * dt;
    next.y += next.vy * dt;
    next.angle += next.vx * dt * .35;
    if (next.x < 0 || next.x > bounds.x) {
      next.x = clamp(next.x, 0, bounds.x);
      next.vx *= -.74;
    }
    if (next.y < 0) { next.y = 0; next.vy = Math.abs(next.vy) * .64; }
    if (next.y >= bounds.y) {
      next.y = bounds.y;
      next.impact = next.vy > 120;
      next.vy = next.vy > 38 ? -next.vy * .70 : 0;
      next.vx *= Math.pow(.89, dt * 60);
    }
    next.vx *= Math.pow(.998, dt * 60);
    next.sleeping = next.y >= bounds.y - 1 && Math.abs(next.vy) < 1 && Math.abs(next.vx) < 5;
    if (next.sleeping) { next.vx = 0; next.vy = 0; }
    return next;
  }
