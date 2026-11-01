import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useGame } from "../context/GameContext";
import DataState from "../components/DataState";
import CharacterProfile from "../components/CharacterProfile";
import { pagePaths } from "../Graph";

export default function CharacterDetailPagePony() {
  const { id } = useParams();
  const { chars, loading, error, retryCharacters } = useGame();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const character = chars.find((item) => String(item.id) === id);

  useEffect(() => {
    const updateScrollButton = () => setShowScrollTop(window.scrollY > 300);
    updateScrollButton();
    window.addEventListener("scroll", updateScrollButton, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollButton);
  }, []);

  if (loading || error || !character) {
    const notFound = !loading && !error && chars.length > 0;
    return (
      <section>
        <DataState loading={loading} error={error} onRetry={retryCharacters}
          empty={notFound} emptyMessage="ไม่พบข้อมูลตัวละครนี้" />
        {!loading && <Link className="button-link" to={pagePaths.characters}>กลับไปหน้าตัวละคร</Link>}
      </section>
    );
  }

  return (
    <section className="panel character-detail pony-character-detail">
      <Link to={pagePaths.characters}>← กลับไปหน้าตัวละคร</Link>
      <CharacterProfile character={character} />
      {showScrollTop && (
        <button className="pony-scroll-top pony-page-scroll-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="กลับขึ้นไปด้านบนของประวัติตัวละคร" title="กลับขึ้นด้านบน">
          ↑
        </button>
      )}
    </section>
  );
}
