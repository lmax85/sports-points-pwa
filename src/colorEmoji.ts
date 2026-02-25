const EMOJI_MAP: [string, string, number, number, number][] = [
  ['🔵', '#1a73e8', 26, 115, 232],
  ['🔴', '#d93025', 217, 48, 37],
  ['🟣', '#e91e8c', 233, 30, 140],
  ['🟢', '#1e8e3e', 30, 142, 62],
  ['🟡', '#f9ab00', 249, 171, 0],
  ['⚪', '#ffffff', 255, 255, 255],
  ['🟠', '#ff6d00', 255, 109, 0],
  ['⚫', '#000000', 0, 0, 0],
  ['🟤', '#795548', 121, 85, 72],
];

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

export function colorToEmoji(hex: string): string {
  // Exact match on known preset hex values
  const exact = EMOJI_MAP.find(([, h]) => h.toLowerCase() === hex.toLowerCase());
  if (exact) return exact[0];

  // Closest by RGB distance
  const [r, g, b] = hexToRgb(hex);
  let best = EMOJI_MAP[0][0];
  let bestDist = Infinity;
  for (const [emoji, , er, eg, eb] of EMOJI_MAP) {
    const d = (r - er) ** 2 + (g - eg) ** 2 + (b - eb) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = emoji;
    }
  }
  return best;
}
