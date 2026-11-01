import { useEffect, useMemo, useState } from "react";
import { useGame } from "../context/GameContext";
import CharacterCard from "../components/CharacterCard";
import CharacterModalPony from "../components/CharacterModalPony";
import Pager from "../components/Pager";
import DataState from "../components/DataState";

const PER_PAGE = 20;

export default function CharactersPagePony() {
  const { chars, loading, error, retryCharacters, team, toggleTeam } = useGame();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("az");
  const [season, setSeason] = useState("all");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const updateScrollButton = () => setShowScrollTop(window.scrollY > 300);
    updateScrollButton();
    window.addEventListener("scroll", updateScrollButton, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollButton);
  }, []);

  const seasons = useMemo(
    () => [...new Set(chars.flatMap((character) => character.seasons || []))].sort((a, b) => a - b),
    [chars]
  );
  const list = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return chars
      .filter((character) => `${character.name} ${character.alias || ""}`.toLowerCase().includes(normalizedQuery))
      .filter((character) => season === "all" || (character.seasons || []).includes(Number(season)))
      .sort((a, b) => {
        if (sort === "star" && b.star !== a.star) return b.star - a.star;
        if (sort === "episodes" && (b.episodeCount || 0) !== (a.episodeCount || 0)) {
          return (b.episodeCount || 0) - (a.episodeCount || 0);
        }
        const order = a.name.localeCompare(b.name);
        return sort === "za" ? -order : order;
      });
  }, [chars, query, sort, season]);
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const currentPage = Math.min(page, pages);
  const updateFilter = (setter) => (event) => {
    setter(event.target.value);
    setPage(1);
  };
  const clearFilters = () => {
    setQuery("");
    setSeason("all");
    setPage(1);
  };
  const emptyMessage = query.trim() && season !== "all"
    ? `ไม่พบตัวละครที่ตรงกับ "${query.trim()}" ใน Season ${season}`
    : query.trim()
      ? `ไม่พบตัวละครที่ตรงกับ "${query.trim()}"`
      : `ไม่พบตัวละครใน Season ${season}`;

  return (
    <section className="pony-character-page">
      <div className="pony-controls" aria-label="ค้นหาและกรองตัวละคร">
        <label className="pony-search">
          <span>ค้นหาตัวละคร</span>
          <input value={query} onChange={updateFilter(setQuery)} placeholder="ค้นหาชื่อหรือฉายา..." aria-label="ค้นหา" />
        </label>
        <label>
          <span>ซีซัน</span>
          <select value={season} onChange={updateFilter(setSeason)} aria-label="ซีซัน">
            <option value="all">ทุกซีซัน</option>
            {seasons.map((item) => <option key={item} value={item}>Season {item}</option>)}
          </select>
        </label>
        <label>
          <span>เรียงลำดับ</span>
          <select value={sort} onChange={updateFilter(setSort)} aria-label="เรียง">
            <option value="az">A - Z</option>
            <option value="za">Z - A</option>
            <option value="episodes">ตอนที่ปรากฏมาก → น้อย</option>
            <option value="star">ดาวมาก → น้อย</option>
          </select>
        </label>
        {query && <button className="clear-search" onClick={() => { setQuery(""); setPage(1); }}>ล้างคำค้นหา</button>}
      </div>

      <div className="panel"><span className="mini">กดการ์ดเพื่อดูรายละเอียดและเพิ่มเข้าทีม</span></div>
      <DataState loading={loading} error={error} onRetry={retryCharacters}
        empty={!loading && !error && !chars.length} emptyMessage="ยังไม่มีข้อมูลตัวละครในระบบ" />
      {!loading && !error && chars.length > 0 && (
        <div className="grid">
          {list.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE).map((character) => (
            <CharacterCard key={character.id} c={character} inTeam={team.includes(character.id)}
              full={team.length >= 3} onOpen={setOpen} onToggle={toggleTeam} />
          ))}
          {!list.length && (
            <div className="empty-state">
              <span className="data-state-icon" aria-hidden="true">🦄</span>
              <p>{emptyMessage}</p>
              {(query || season !== "all") && <button onClick={clearFilters}>ล้างตัวกรอง</button>}
            </div>
          )}
        </div>
      )}
      {!loading && !error && chars.length > 0 && <Pager page={currentPage} pages={pages} onPage={setPage} />}
      {open && <CharacterModalPony character={open} onClose={() => setOpen(null)} />}

      <div className={`team-status${team.length === 3 ? " is-full" : ""}`} role="status" aria-live="polite">
        <div className="team-status-heading"><span>ทีมที่เลือก</span><strong>{team.length}<i>/3</i></strong></div>
        <div className="team-status-slots" aria-hidden="true">
          {[0, 1, 2].map((slot) => <span key={slot} className={slot < team.length ? "filled" : ""} />)}
        </div>
        <span className="team-status-hint">{team.length === 3 ? "ทีมเต็มแล้ว" : `เลือกได้อีก ${3 - team.length} ตัว`}</span>
      </div>
      {showScrollTop && (
        <button className="scroll-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="กลับไปด้านบน" title="กลับไปด้านบน">↑</button>
      )}
    </section>
  );
}
