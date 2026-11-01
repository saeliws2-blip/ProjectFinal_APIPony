import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useGame } from "../context/GameContext";
import CharacterProfile from "./CharacterProfile";

export default function CharacterModalPony({ character, onClose }) {
  const { team, toggleTeam } = useGame();
  const inTeam = team.includes(character.id);
  const modalContent = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleModalScroll = (event) => {
    setShowScrollTop(event.currentTarget.scrollTop > 160);
  };

  return (
    <div className="modal" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={modalContent} onScroll={handleModalScroll} className={`box card r${character.star} pony-modal`} role="dialog" aria-modal="true" aria-label={character.name}>
        <div className="modal-sticky-header">
          <h2>{character.name}</h2>
          <button className="close" onClick={onClose} aria-label={`ปิดรายละเอียด ${character.name}`}>×</button>
        </div>
        <CharacterProfile character={character} />
        <div className="row pony-profile-actions">
          <button onClick={() => { toggleTeam(character.id); onClose(); }} disabled={!inTeam && team.length >= 3}>
            {inTeam ? "นำออกจากทีม" : "+ เพิ่มเข้าทีม"}
          </button>
          <Link className="button-link" to={`/characters/${character.id}`} onClick={onClose}>ดูรายละเอียดเต็ม</Link>
        </div>
        {showScrollTop && (
          <button
            className="pony-scroll-top"
            onClick={() => modalContent.current?.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="กลับขึ้นไปด้านบนของประวัติตัวละคร"
            title="กลับขึ้นด้านบน"
          >
            ↑
          </button>
        )}
      </div>
    </div>
  );
}
