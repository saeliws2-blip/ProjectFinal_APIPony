import { useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext";
import { pagePaths } from "../Graph";
import Portrait from "../components/Portrait";
import Stars from "../components/Stars";
import StatBars from "../components/StatBars";
import DataState from "../components/DataState";

export default function TeamPage() {
  const { team, byId, removeFromTeam, clearTeam, chars, loading, error, retryCharacters } = useGame();
  const navigate = useNavigate();

  if (loading || error || !chars.length) {
    return <DataState loading={loading} error={error} onRetry={retryCharacters}
      empty={!loading && !error && !chars.length} emptyMessage="ยังโหลดทีมไม่ได้ เพราะไม่มีข้อมูลตัวละคร" />;
  }

  return (
    <section>
      <h2 style={{ textAlign: "center" }}>⭐ ทีมของฉัน ({team.length}/3)</h2>
      <div className="team">
        {[0, 1, 2].map((i) => {
          const c = byId(team[i]);
          return c ? (
            <div key={c.id} className={`slot card r${c.star}`}>
              <Portrait c={c} />
              <strong>{c.name}</strong>
              <Stars n={c.star} />
              <div style={{ width: "100%" }}><StatBars st={c.st} /></div>
              <button className="ghost" onClick={() => removeFromTeam(c.id)}>นำออก</button>
            </div>
          ) : (
            <div key={i} className="slot empty">ยังว่าง — เลือกแท็บ “ตัวละคร” เพื่อเพิ่ม</div>
          );
        })}
      </div>
      <div className="row center">
        <button disabled={team.length !== 3} onClick={() => navigate(pagePaths.battle)}>⚔ เลือกไปต่อสู้</button>
        <button className="red" disabled={!team.length} onClick={clearTeam}>🗑 ลบตัวละครทั้งหมด</button>
      </div>
      {team.length !== 3 && <p className="note" style={{ textAlign: "center" }}>เลือกให้ครบ 3 ตัวก่อนจึงจะไปต่อสู้ได้</p>}
    </section>
  );
}
