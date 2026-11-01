import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { makeStats, rate } from "../game/rarity";

const Ctx = createContext(null);
export const useGame = () => useContext(Ctx);

const ls = {
  get(k, d) { try { return JSON.parse(localStorage.getItem("pony_" + k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem("pony_" + k, JSON.stringify(v)); } catch { /* ignore */ } },
};

function getSavedTeam() {
  const saved = ls.get("team", []);
  if (!Array.isArray(saved)) return [];
  return [...new Set(saved.map(Number).filter((id) => Number.isInteger(id) && id > 0))].slice(0, 3);
}

export function GameProvider({ children }) {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [team, setTeam] = useState(getSavedTeam);
  const [enemyIds, setEnemyIds] = useState(() => ls.get("enemies", []));
  const requestId = useRef(0);

  const loadCharacters = useCallback(async (retry = false) => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(retry ? "/characters/reload" : "/characters", {
        method: retry ? "POST" : "GET",
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || `โหลดข้อมูลไม่สำเร็จ (${response.status})`);
      }
      if (!Array.isArray(result.data)) throw new Error("รูปแบบข้อมูลจากเซิร์ฟเวอร์ไม่ถูกต้อง");

      const cache = ls.get("rarity", {}); // บันทึกระดับดาวไว้ ไม่เปลี่ยนทุกครั้งที่โหลด
      const list = result.data.map((c) => {
        const rt = cache[c.id] || rate(c);
        cache[c.id] = rt;
        const x = { ...c, rate: rt, star: rt.star };
        return { ...x, st: makeStats(x) };
      });
      ls.set("rarity", cache);
      if (currentRequest === requestId.current) setAll(list);
    } catch (loadError) {
      console.error("โหลดข้อมูลตัวละครไม่สำเร็จ:", loadError);
      if (currentRequest === requestId.current) {
        setError(loadError instanceof Error ? loadError.message : "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      }
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => { void loadCharacters(); }, [loadCharacters]);
  useEffect(() => { ls.set("team", team); }, [team]);
  useEffect(() => {
    if (all.length) {
      setTeam((current) => current.filter((id) => all.some((character) => character.id === id)));
    }
  }, [all]);

  const chars = all;
  const byId = useCallback((id) => all.find((c) => c.id === id), [all]);

  const toggleTeam = (id) => setTeam((t) => (t.includes(id) ? t.filter((x) => x !== id) : t.length < 3 ? [...t, id] : t));
  const removeFromTeam = (id) => setTeam((t) => t.filter((x) => x !== id));
  const clearTeam = () => setTeam([]);
  // ศัตรู 3 ตัว สุ่มจากตัวละครทั้งหมด ไม่ซ้ำทีม และเก็บไว้ไม่เปลี่ยนเมื่อรีเฟรช
  const ensureEnemies = (reroll = false) => {
    let cur = reroll ? [] : enemyIds.filter((id) => !team.includes(id) && chars.some((c) => c.id === id));
    const pool = chars.filter((c) => !team.includes(c.id) && !cur.includes(c.id));
    while (cur.length < 3 && pool.length) cur = [...cur, pool.splice(Math.floor(Math.random() * pool.length), 1)[0].id];
    setEnemyIds(cur); ls.set("enemies", cur);
    return cur;
  };

  const value = { chars, loading, error, retryCharacters: () => loadCharacters(true), byId, team, toggleTeam, removeFromTeam, clearTeam, enemyIds, ensureEnemies };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
