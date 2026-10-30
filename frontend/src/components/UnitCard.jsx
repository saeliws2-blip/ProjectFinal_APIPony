import { useEffect, useState } from "react";
import Portrait from "./Portrait";
import Stars from "./Stars";
import { roleLabel } from "../game/battle";

// การ์ดนักสู้ในหน้าต่อสู้: HP + เกจพลังงาน (MP) เหมือน main.js
export default function UnitCard({ u, enemy, active, awaiting, onPick, attacking, struck, battleActive }) {
  const [departed, setDeparted] = useState(false);
  useEffect(() => {
    if (u.hp > 0) {
      setDeparted(false);
      return undefined;
    }
    const timer = window.setTimeout(() => setDeparted(true), 1050);
    return () => window.clearTimeout(timer);
  }, [u.hp]);
  if (departed) return null;

  return (
    <div className={`unit card r${u.star}${enemy ? " enemy" : ""}${active ? " active" : ""}${awaiting && u.hp > 0 ? " awaiting" : ""}${u.hp <= 0 ? " dead defeated" : ""}${attacking ? " attacking" : ""}${struck ? " struck" : ""}${battleActive && !attacking ? " subdued" : ""}`}
      onClick={enemy && awaiting && u.hp > 0 ? onPick : undefined}
      onKeyDown={(event) => {
        if (enemy && awaiting && u.hp > 0 && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onPick();
        }
      }}
      tabIndex={enemy && awaiting && u.hp > 0 ? 0 : undefined}
      role={enemy && awaiting && u.hp > 0 ? "button" : undefined}
      aria-label={enemy && awaiting ? `เลือกเป้าหมาย ${u.name}, HP ${u.hp} จาก ${u.maxHp}` : undefined}>
      <Portrait c={u} />
      <div>
        <div><strong>{u.name}</strong> <Stars n={u.star} /></div>
        <span className="unit-role">{roleLabel(u.role)}</span>
        <i className="hp"><b style={{ width: `${Math.max(0, (u.hp / u.maxHp) * 100)}%` }} /></i>
        {!enemy && <i className="en"><b style={{ width: `${u.energy}%` }} /></i>}
        <div className="mini">HP {u.hp}/{u.maxHp}{!enemy ? ` | MP ${u.energy}%` : ""}{u.g ? " | 🛡️ ป้องกัน" : ""}</div>
        {(u.status?.stun > 0 || u.status?.bleed > 0) && (
          <div className="unit-status">
            {u.status.stun > 0 && <span>💫 มึนงง</span>}
            {u.status.bleed > 0 && <span>🩸 บาดเจ็บ {u.status.bleed}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
