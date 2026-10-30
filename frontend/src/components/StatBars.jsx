import { STAT_KEYS, STAT_NAMES } from "../game/rarity";
export default function StatBars({ st }) {
  const max = Math.max(st.hp / 4, st.atk, st.def, st.spd);
  return STAT_KEYS.map((k, i) => (
    <div key={k} className={"bar" + (st.f === i ? " f" : "")}>
      <span>{STAT_NAMES[i]}</span>
      <i><b style={{ width: `${((k === "hp" ? st.hp / 4 : st[k]) / max) * 100}%` }} /></i>
      <span>{st[k]}</span>
    </div>
  ));
}
