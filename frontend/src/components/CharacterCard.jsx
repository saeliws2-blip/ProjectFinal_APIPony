import Portrait from "./Portrait";
import Stars from "./Stars";

// สีการ์ดขึ้นกับระดับความแร์ (class r1..r5 ใน styles.css)
export default function CharacterCard({ c, inTeam, full, onOpen, onToggle }) {
  return (
    <div className={`card r${c.star}`} data-id={c.id} tabIndex={0}
      onClick={() => onOpen(c)} onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onOpen(c);
        }
      }}>
      {inTeam && <span className="intm">✔ ในทีม</span>}
      <Portrait c={c} />
      <h3>{c.name}</h3>
      <Stars n={c.star} />
      <div className="mini">ATK {c.st.atk} · DEF {c.st.def} · SPD {c.st.spd}</div>
      <button className={`addbtn${inTeam ? " ghost" : ""}`} disabled={!inTeam && full}
        onClick={(e) => { e.stopPropagation(); onToggle(c.id); }}>
        {inTeam ? "− นำออกจากทีม" : "+ เพิ่มเข้าทีม"}
      </button>
    </div>
  );
}
