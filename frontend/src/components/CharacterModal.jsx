import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Portrait from "./Portrait";
import Stars from "./Stars";
import StatBars from "./StatBars";
import { useGame } from "../context/GameContext";

export default function CharacterModal({ c, onClose }) {
  const { team, toggleTeam } = useGame();
  const modalContent = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  const handleModalScroll = (event) => {
    setShowScrollTop(event.currentTarget.scrollTop > 200);
  };
  const scrollModalToTop = () => {
    modalContent.current?.scrollTo({ top: 0, behavior: "smooth" });
  };
  const inTeam = team.includes(c.id);
  const row = (k, v) => <p><b>{k}:</b> {v || "ไม่มีข้อมูล"}</p>;
  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={modalContent} onScroll={handleModalScroll} className={`box card r${c.star}`} role="dialog" aria-modal="true" aria-label={c.name}>
        <div className="modal-sticky-header">
          <h2>{c.name}</h2>
          <button className="close" onClick={onClose} aria-label={`ปิดรายละเอียด ${c.name}`}>×</button>
        </div>
        <div style={{ textAlign: "center" }}>
          <Portrait c={c} />
          <Stars n={c.star} />
          <div className="mini">ระดับความแร์: {c.rate.src}</div>
        </div>
        <div style={{ margin: "14px 0" }}><StatBars st={c.st} /><div className="mini">แถบสีทองคือจุดเด่นของตัวนี้</div></div>
        <div className="info">
          {row("เพศ", c.sex)}{row("ประเภท", (c.kind || []).join(", "))}{row("อาชีพ", c.occupation)}
          {row("ตอนที่ปรากฏ", c.episodeCount ? c.episodeCount + " ตอน" : "")}
          {row("ซีซัน", (c.seasons || []).map((s) => "S" + s).join(", "))}
        </div>
        <section className="appearance-episodes" aria-label="รายชื่อตอนที่ปรากฏ">
          <h3>ตอนที่ปรากฏ ({c.episodeCount || 0} ตอน)</h3>
          {c.appearanceEpisodes?.length ? (
            <ul>
              {c.appearanceEpisodes.map((episode, index) => (
                <li key={`${episode.code}-${index}`}>
                  <b>{episode.code}</b>{episode.name ? `: ${episode.name}` : ""}
                </li>
              ))}
            </ul>
          ) : <p className="mini">ไม่มีข้อมูลรายชื่อตอน</p>}
        </section>
        <div className="row">
          <button onClick={() => { toggleTeam(c.id); onClose(); }} disabled={!inTeam && team.length >= 3}>{inTeam ? "นำออกจากทีม" : "+ เพิ่มเข้าทีม"}</button>
          <Link className="button-link" to={`/characters/${c.id}`} onClick={onClose}>ดูรายละเอียดเต็ม</Link>
        </div>
        {showScrollTop && (
          <button className="modal-scroll-top" onClick={scrollModalToTop} aria-label="กลับขึ้นด้านบนของประวัติตัวละคร" title="กลับขึ้นด้านบน">
            ↑
          </button>
        )}
      </div>
    </div>
  );
}
