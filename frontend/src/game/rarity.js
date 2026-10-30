// ระดับความแร์ (1-5 ดาว) และค่าสถานะ — ผลคงที่ต่อ id ตัวละคร
export const FIXED = { "Twilight Sparkle": 5, "Rainbow Dash": 5, "Pinkie Pie": 5, "Rarity": 5, "Applejack": 5, "Fluttershy": 5, "Starlight Glimmer": 5, "Princess Celestia": 5, "Princess Luna": 5, "Spike": 4, "Princess Cadance": 4, "Discord": 4 };
const WEIGHTS = [50, 30, 15, 5];          // โอกาสสุ่ม 1-4 ดาว เมื่อข้อมูลไม่พอ
const TOTAL = [70, 100, 135, 175, 225];   // แต้มสถานะรวมตามดาว
export const STAT_NAMES = ["HP", "ATK", "DEF", "SPD"];
export const STAT_KEYS = ["hp", "atk", "def", "spd"];

export const hash = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
export const rng = (a) => () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const pickW = (w, r) => { let x = r() * w.reduce((a, b) => a + b, 0); for (let i = 0; i < w.length; i++) if ((x -= w[i]) < 0) return i + 1; return w.length; };
const kindStr = (c) => (c.kind || []).join(" ").toLowerCase();

export function rate(c) {
  if (FIXED[c.name]) return { star: FIXED[c.name], src: "ทีมกำหนด" };
  const eps = c.episodeCount || 0, ss = (c.seasons || []).length;
  if (!eps && !ss) return { star: pickW(WEIGHTS, rng(hash("star" + c.id))), src: "สุ่ม (ข้อมูลไม่พอ)" };
  const s = Math.min(eps, 30) * 1.2 + ss * 4 + (c.occupation ? 4 : 0) + (c.residence ? 3 : 0) + (c.alias ? 2 : 0)
    + Math.min((c.image || []).length, 3) * 2 + (/alicorn|dragon|draconequus/.test(kindStr(c)) ? 8 : 0);
  return { star: s >= 55 ? 5 : s >= 40 ? 4 : s >= 25 ? 3 : s >= 12 ? 2 : 1, src: "คำนวณจากข้อมูล" };
}

// HP / ATK / DEF / SPD: แต้มรวมตามดาว แต่แบ่งไม่เท่ากัน มีจุดเด่น 1 ด้าน (f)
export function makeStats(c) {
  const r = rng(hash("st" + c.id)), k = kindStr(c);
  const w = [0.6 + r(), 0.6 + r(), 0.6 + r(), 0.6 + r()];
  const f = /pegasus/.test(k) ? 3 : /unicorn|alicorn/.test(k) ? 1 : /earth/.test(k) ? 2 : Math.floor(r() * 4);
  w[f] += 1;
  const sum = w.reduce((a, b) => a + b), tot = TOTAL[c.star - 1] * (0.85 + r() * 0.3);
  const [hp, atk, def, spd] = w.map((x) => Math.max(5, Math.round((tot * x) / sum)));
  return { hp: hp * 4, atk, def, spd, f };
}
