import { Link, useLocation } from "react-router-dom";
import { pageGraph, pagePaths } from "../Graph";
import { useGame } from "../context/GameContext";

// แท็บเลือกหน้า สร้างจาก Graph: แสดงทุก node เสมอ
// ใช้ edge ขาออกของหน้าปัจจุบันตัดสินว่ากดไปได้ไหม
export default function Nav() {
  const { pathname } = useLocation();
  const { team } = useGame();

  const isCharacterDetail = /^\/characters\/[^/]+\/?$/.test(pathname);
  const routeHere = isCharacterDetail ? "characterDetail" : Object.keys(pagePaths).find(
    (id) => pagePaths[id] === pathname
  ) || "characters";
  const here = isCharacterDetail ? "characters" : routeHere;

  const pageInfo = {
    characters: { icon: "🦄", title: "ตัวละคร" },
    team: { icon: "⭐", title: "ทีมของฉัน" },
    battle: { icon: "⚔️", title: "ต่อสู้" }
  };

  const guards = { fullTeam: team.length === 3 };
  const out = pageGraph[routeHere] ?? [];

  return (
    <nav className="nav" aria-label="เลือกหน้า">
      {Object.keys(pagePaths).map((id) => {
        const n = pageInfo[id];

        if (id === here) {
          return (
            <span key={id} className="tab on" aria-current="page">
              {n.icon} {n.title}
            </span>
          );
        }

        const requires = id === "battle" ? "fullTeam" : undefined;

        return out.includes(id) && (!requires || guards[requires]) ? (
          <Link key={id} to={pagePaths[id]} className="tab">
            {n.icon} {n.title}
          </Link>
        ) : (
          <span
            key={id}
            className="tab off"
            title="เลือกทีมให้ครบ 3 ตัวก่อน"
          >
            {n.icon} {n.title}
          </span>
        );
      })}
    </nav>
  );
}
