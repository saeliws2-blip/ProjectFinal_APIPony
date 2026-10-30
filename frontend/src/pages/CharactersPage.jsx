import { useEffect, useMemo, useState } from "react";
import { useGame } from "../context/GameContext";
import CharacterCard from "../components/CharacterCard";
import CharacterModal from "../components/CharacterModal";
import Pager from "../components/Pager";
import DataState from "../components/DataState";

const PER = 20;

export default function CharactersPage() {
  const { chars, loading, error, retryCharacters, team, toggleTeam } = useGame();
  const [q, setQ] = useState("");
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

  const seasons = useMemo(() => [...new Set(chars.flatMap((c) => c.seasons || []))].sort((a, b) => a - b), [chars]);
  const list = useMemo(() => {
    const k = q.trim().toLowerCase();
    return chars
      .filter((c) => `${c.name} ${c.alias || ""}`.toLowerCase().includes(k))
      .filter((c) => season === "all" || (c.seasons || []).includes(Number(season)))
      .sort((a, b) => {
        if (sort === "star" && b.star !== a.star) return b.star - a.star;
        if (sort === "episodes" && (b.episodeCount || 0) !== (a.episodeCount || 0)) {
          return (b.episodeCount || 0) - (a.episodeCount || 0);
        }
        const o = a.name.localeCompare(b.name);
        return sort === "za" ? -o : o;
      });
  }, [chars, q, sort, season]);
  const pages = Math.max(1, Math.ceil(list.length / PER));
  const cur = Math.min(page, pages);

  const reset = (fn) => (e) => { fn(e.target.value); setPage(1); };
  const clearFilters = () => {
    setQ("");
    setSeason("all");
    setPage(1);
  };
  const emptyMessage = q.trim() && season !== "all"
    ? `ไม่พบตัวละครที่ตรงกับ "${q.trim()}" ใน Season ${season}`
    : q.trim()
      ? `ไม่พบตัวละครที่ตรงกับ "${q.trim()}"`
      : `ไม่พบตัวละครใน Season ${season}`;
  return (
    <section>
      <div className="panel">
        <span className="mini">กดการ์ดเพื่อดูรายละเอียดและเพิ่มเข้าทีม</span>
      </div>
      <div className="row">
        <input value={q} onChange={reset(setQ)} placeholder="ค้นหาชื่อหรือฉายา..." aria-label="ค้นหา" />
        {q && <button className="clear-search" onClick={() => { setQ(""); setPage(1); }}>ล้างคำค้นหา</button>}
        <select value={sort} onChange={reset(setSort)} aria-label="เรียง">
          <option value="az">A - Z</option><option value="za">Z - A</option><option value="episodes">ตอนที่ปรากฏมาก → น้อย</option><option value="star">ดาวมาก → น้อย</option>
        </select>
        <select value={season} onChange={reset(setSeason)} aria-label="ซีซัน">
          <option value="all">ทุกซีซัน</option>
          {seasons.map((s) => <option key={s} value={s}>Season {s}</option>)}
        </select>
      </div>
      <DataState loading={loading} error={error} onRetry={retryCharacters}
        empty={!loading && !error && !chars.length} emptyMessage="ยังไม่มีข้อมูลตัวละครในระบบ" />
      {!loading && !error && chars.length > 0 && (
        <div className="grid">
          {list.slice((cur - 1) * PER, cur * PER).map((c) => (
            <CharacterCard key={c.id} c={c} inTeam={team.includes(c.id)} full={team.length >= 3} onOpen={setOpen} onToggle={toggleTeam} />
          ))}
          {!list.length && (
            <div className="empty-state">
              <span className="data-state-icon" aria-hidden="true">🦄</span>
              <p>{emptyMessage}</p>
              {(q || season !== "all") && <button onClick={clearFilters}>ล้างตัวกรอง</button>}
            </div>
          )}
        </div>
      )}
      {!loading && !error && chars.length > 0 && <Pager page={cur} pages={pages} onPage={setPage} />}
      {open && <CharacterModal c={open} onClose={() => setOpen(null)} />}
      <div className={`team-status${team.length === 3 ? " is-full" : ""}`} role="status" aria-live="polite">
        <div className="team-status-heading">
          <span>ทีมที่เลือก</span>
          <strong>{team.length}<i>/3</i></strong>
        </div>
        <div className="team-status-slots" aria-hidden="true">
          {[0, 1, 2].map((slot) => <span key={slot} className={slot < team.length ? "filled" : ""} />)}
        </div>
        <span className="team-status-hint">{team.length === 3 ? "ทีมเต็มแล้ว" : `เลือกได้อีก ${3 - team.length} ตัว`}</span>
      </div>
      {showScrollTop && (
        <button className="scroll-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="กลับไปด้านบน" title="กลับไปด้านบน">
          ↑
        </button>
      )}
    </section>
  );
}
