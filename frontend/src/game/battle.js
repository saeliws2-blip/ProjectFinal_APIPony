// ต่อสู้แบบเดียวกับ main.js: ดาเมจคงที่, เกจพลังงาน (MP), โจมตีปกติ / สกิลพิเศษ / ป้องกัน, ออโต้
// ฝั่งเราเล่นทีละตัวตามลำดับ จากนั้นศัตรูสุ่มโจมตี 1 ครั้ง (ฟังก์ชันล้วน: คืน state ใหม่)
export function specialName(name, kind) {
  if (name.includes("Twilight")) return "Magic Beam Burst 💥";
  if (name.includes("Rainbow")) return "Sonic Rainboom 🌈";
  if (name.includes("Pinkie")) return "Party Cannon Blast 🎉";
  if (kind.includes("unicorn")) return "Arcane Flare ✨";
  if (kind.includes("pegasus")) return "Tornado Kick 🌪️";
  return "Mega Impact 🔨";
}
function roleFor(c) {
  const name = c.name.toLowerCase(), kind = (c.kind || []).join(" ").toLowerCase();
  if (name.includes("fluttershy")) return "support";
  if (/unicorn|alicorn/.test(kind)) return "mage";
  if (/pegasus/.test(kind)) return "swift";
  return "guardian";
}
export const roleLabel = (role) => ({
  support: "ฮีลเลอร์",
  mage: "จอมเวท",
  swift: "สายว่องไว",
  guardian: "ผู้พิทักษ์",
}[role] || "นักสู้");
// ใช้ ATK/HP จากสถานะตามดาวของการ์ด (HP ×2 ให้สู้ได้ ~8 ตีต่อตัว)
const mk = (c) => ({ id: c.id, name: c.name, star: c.star, image: c.image, atk: c.st.atk, maxHp: c.st.hp * 2, hp: c.st.hp * 2, energy: 0, g: false, role: roleFor(c), status: { stun: 0, bleed: 0 }, damageDealt: 0, healingDone: 0, spec: specialName(c.name, (c.kind || []).join(" ").toLowerCase()) });
const say = (B, s, k = "") => B.log.push({ k, s });
const alive = (a) => a.filter((u) => u.hp > 0);

export function createBattle(team, enemies) {
  return { T: team.map(mk), E: enemies.map(mk), turn: "player", idx: 0, round: 1, over: null, pending: null, auto: false, fx: null, log: [{ k: "", s: "🔔 การต่อสู้เริ่มต้นขึ้นแล้ว!" }] };
}
function strike(B, a, t, special) {
  B.fx = { id: B.log.length + 1, attackerId: a.id, targetIds: [t.id], kind: special ? "special" : "attack" };
  let dmg = special ? Math.round(a.atk * 1.8) : a.atk;
  const guarded = t.g;
  if (guarded) { dmg = Math.ceil(dmg / 2); t.g = false; }
  t.hp = Math.max(0, t.hp - dmg);
  a.damageDealt += dmg;
  a.energy = special ? 0 : Math.min(100, a.energy + 35);
  t.energy = Math.min(100, t.energy + 20);
  const how = special ? `ใช้สกิลพิเศษ [${a.spec}]` : "โจมตีปกติ";
  say(B, guarded ? `🛡️ ${t.name} ป้องกันการโจมตีของ ${a.name} (${how}) ลดเหลือ ${dmg} หน่วย!` : `⚔️ ${a.name} ${how} ใส่ ${t.name} ทำความเสียหาย ${dmg} หน่วย!`, special ? "sp" : "dmg");
  if (special && a.role === "mage" && t.hp > 0 && Math.random() < 0.3) {
    t.status.stun = 1;
    say(B, `💫 ${t.name} มึนงงและอาจพลาดเทิร์นถัดไป!`, "status");
  }
  if (special && a.role === "swift" && t.hp > 0) {
    t.status.bleed = 2;
    say(B, `🌪️ ${t.name} ติดสถานะบาดเจ็บต่อเนื่อง 2 เทิร์น`, "status");
  }
  if (special && a.role === "guardian") {
    const allies = B.T.includes(a) ? B.T : B.E;
    alive(allies).forEach((ally) => { ally.g = true; });
    say(B, `🛡️ ${a.name} สร้างเกราะป้องกันให้ทีม!`, "def");
  }
}
function supportSpecial(B, a, allies) {
  const target = alive(allies).reduce((weakest, ally) => !weakest || ally.hp / ally.maxHp < weakest.hp / weakest.maxHp ? ally : weakest, null);
  if (!target) return;
  B.fx = { id: B.log.length + 1, attackerId: a.id, targetIds: [target.id], kind: "heal" };
  const amount = Math.min(Math.ceil(target.maxHp * 0.3), target.maxHp - target.hp);
  target.hp += amount;
  a.energy = 0;
  a.healingDone += amount;
  say(B, amount ? `💖 ${a.name} ใช้ ${a.spec} ฟื้นฟู HP ให้ ${target.name} ${amount} หน่วย!` : `💖 ${a.name} ใช้ ${a.spec} — ทีมมี HP เต็มอยู่แล้ว!`, "heal");
}
function bleedTick(B, unit) {
  if (!unit.status.bleed) return;
  const damage = Math.max(1, Math.round(unit.atk * 0.22));
  unit.hp = Math.max(0, unit.hp - damage);
  unit.status.bleed -= 1;
  say(B, `🩸 ${unit.name} เสีย HP ${damage} จากบาดแผลต่อเนื่อง`, "status");
}
function finish(B) { // เช็คแพ้ชนะ ถ้ายังไม่จบให้เปลี่ยนเทิร์น
  const lose = !alive(B.T).length, win = !alive(B.E).length;
  if (win || lose) { B.over = win ? "win" : "lose"; B.pending = null; say(B, win ? "🎉 ยินดีด้วย! ทีมของคุณเป็นฝ่ายชนะ!" : "💀 พ่ายแพ้! ทีมศัตรูเป็นฝ่ายชนะ!", "end"); return B; }
  if (B.turn === "player") { B.pending = null; B.turn = "enemy"; }
  else { B.turn = "player"; B.round += 1; do { B.idx = (B.idx + 1) % B.T.length; } while (B.T[B.idx].hp <= 0); }
  return B;
}
export function chooseAction(B0, type) {
  const B = structuredClone(B0), a = B.T[B.idx];
  if (B.over || B.turn !== "player" || a.hp <= 0) return B0;
  bleedTick(B, a);
  if (a.hp <= 0) { say(B, `💫 ${a.name} ล้มลงจากบาดแผลก่อนจะได้ลงมือ`, "status"); return finish(B); }
  if (a.status.stun) { a.status.stun = 0; say(B, `💫 ${a.name} มึนงงจนพลาดเทิร์นนี้!`, "status"); return finish(B); }
  if (type === "defend") { a.g = true; say(B, `🛡️ ${a.name} ตั้งท่าป้องกัน จะได้รับความเสียหายลดลงครึ่งหนึ่งจากการโจมตีครั้งถัดไป`, "def"); return finish(B); }
  if (type === "special" && a.energy < 100) { say(B, `⚠️ ${a.name} ยังมีพลังงานไม่พอใช้สกิลพิเศษ`); return B; }
  if (type === "special" && a.role === "support") { supportSpecial(B, a, B.T); return finish(B); }
  B.pending = type;
  return B;
}
export function pickTarget(B0, i) {
  const B = structuredClone(B0), a = B.T[B.idx], t = B.E[i];
  if (B.over || B.turn !== "player" || !B.pending || !t || t.hp <= 0) return B0;
  strike(B, a, t, B.pending === "special");
  return finish(B);
}
export function enemyTurn(B0) {
  const B = structuredClone(B0);
  if (B.over || B.turn !== "enemy") return B0;
  const es = alive(B.E), ps = alive(B.T), guarding = ps.filter((p) => p.g);
  const a = es[Math.floor(Math.random() * es.length)], pool = guarding.length ? guarding : ps;
  bleedTick(B, a);
  if (a.hp <= 0) return finish(B);
  if (a.status.stun) { a.status.stun = 0; say(B, `💫 ${a.name} มึนงงจนพลาดเทิร์น!`, "status"); return finish(B); }
  if (a.energy >= 100 && a.role === "support") { supportSpecial(B, a, B.E); return finish(B); }
  const t = pool[Math.floor(Math.random() * pool.length)];
  strike(B, a, t, a.energy >= 100);
  return finish(B);
}
export function autoTurn(B0) {
  const B = structuredClone(B0), a = B.T[B.idx];
  if (!B.auto || B.over || B.turn !== "player" || a.hp <= 0) return B0;
  bleedTick(B, a);
  if (a.hp <= 0) return finish(B);
  if (a.status.stun) { a.status.stun = 0; say(B, `💫 ${a.name} มึนงงจนพลาดเทิร์นนี้!`, "status"); return finish(B); }
  if (a.energy >= 100 && a.role === "support") { supportSpecial(B, a, B.T); return finish(B); }
  const t = alive(B.E).reduce((m, e) => (!m || e.hp < m.hp ? e : m), null);
  strike(B, a, t, a.energy >= 100);
  return finish(B);
}
export function teamCombo(B0) {
  const B = structuredClone(B0), a = B.T[B.idx];
  if (B.over || B.turn !== "player" || a.hp <= 0 || a.energy < 100 || alive(B.T).length < 2) return B0;
  const partners = alive(B.T).filter((ally) => ally !== a);
  B.fx = { id: B.log.length + 1, attackerId: a.id, targetIds: alive(B.E).map((enemy) => enemy.id), kind: "combo" };
  a.energy = 0;
  say(B, `🌟 ${a.name} และ ${partners[0].name} ประสานพลัง!`, "combo");
  alive(B.E).forEach((target) => {
    let damage = Math.round(a.atk * 1.25);
    if (target.g) { damage = Math.ceil(damage / 2); target.g = false; }
    target.hp = Math.max(0, target.hp - damage);
    a.damageDealt += damage;
    say(B, `💥 ท่าประสานทีมโจมตี ${target.name} ทำความเสียหาย ${damage} หน่วย!`, "combo");
  });
  return finish(B);
}
export function toggleAuto(B0) {
  if (B0.over) return B0;
  return { ...B0, auto: !B0.auto, pending: B0.auto ? B0.pending : null };
}
