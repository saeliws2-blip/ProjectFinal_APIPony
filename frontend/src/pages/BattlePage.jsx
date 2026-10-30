import { useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "../context/GameContext";
import UnitCard from "../components/UnitCard";
import { autoTurn, chooseAction, createBattle, enemyTurn, pickTarget, roleLabel, teamCombo, toggleAuto } from "../game/battle";
import { createBattleMusic } from "../game/battleMusic";
import DataState from "../components/DataState";

export default function BattlePage() {
  const { team, byId, enemyIds, ensureEnemies, chars, loading, error, retryCharacters } = useGame();
  const [B, setB] = useState(null);
  const [closed, setClosed] = useState(false); // ปิดหน้าต่างสรุปผล
  const [showLog, setShowLog] = useState(false);
  const [resultReady, setResultReady] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [musicNotice, setMusicNotice] = useState("");
  const [visibleFx, setVisibleFx] = useState(null);
  const logRef = useRef(null);
  const musicRef = useRef(null);
  const ready = team.length === 3;

  useEffect(() => { if (ready && chars.length) ensureEnemies(); }, [ready, chars.length]); // eslint-disable-line
  const preview = useMemo(() => {
    const es = enemyIds.map(byId).filter(Boolean);
    return ready && es.length === 3 ? createBattle(team.map(byId), es) : null;
  }, [ready, team, enemyIds, byId]);
  const S = B || preview;

  useEffect(() => { // ศัตรูเล่นเอง / โหมดออโต้
    if (!B || B.over) return;
    const t = B.turn === "enemy" ? setTimeout(() => setB(enemyTurn(B)), 1000) : B.auto ? setTimeout(() => setB(autoTurn(B)), 700) : null;
    return () => clearTimeout(t);
  }, [B]);
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [B?.log.length]);
  useEffect(() => {
    if (!B?.fx) {
      setVisibleFx(null);
      return undefined;
    }
    setVisibleFx(B.fx);
    const timer = window.setTimeout(() => setVisibleFx(null), 900);
    return () => window.clearTimeout(timer);
  }, [B?.fx?.id]);
  useEffect(() => {
    if (!B?.over) {
      setResultReady(false);
      return undefined;
    }
    const timer = window.setTimeout(() => setResultReady(true), 1100);
    return () => window.clearTimeout(timer);
  }, [B?.over]);
  useEffect(() => {
    if (B?.over) stopBattleMusic();
  }, [B?.over]);
  useEffect(() => () => stopBattleMusic(), []);

  function stopBattleMusic() {
    if (!musicRef.current) return;
    musicRef.current.stop();
    musicRef.current = null;
  }
  function startBattleMusic() {
    stopBattleMusic();
    if (!musicEnabled) return;
    try {
      const music = createBattleMusic();
      if (!music) {
        setMusicNotice("เบราว์เซอร์นี้ไม่รองรับเสียงดนตรี");
        return;
      }
      musicRef.current = music;
      setMusicNotice("");
    } catch (error) {
      console.error("เปิดดนตรีต่อสู้ไม่สำเร็จ:", error);
      setMusicNotice("เปิดเสียงไม่ได้ — ตรวจสอบการตั้งค่าเสียงของเบราว์เซอร์");
    }
  }

  if (loading || error || !chars.length) {
    return <DataState loading={loading} error={error} onRetry={retryCharacters}
      empty={!loading && !error && !chars.length} emptyMessage="ยังเริ่มต่อสู้ไม่ได้ เพราะไม่มีข้อมูลตัวละคร" />;
  }
  if (!ready) return <p className="panel">ต้องเลือกทีมให้ครบ 3 ตัวก่อน (เลือกแท็บ “ตัวละคร” เพื่อเพิ่มตัวละคร)</p>;
  if (!S) return <p>กำลังเตรียมศัตรู...</p>;

  const start = () => { setClosed(false); setResultReady(false); setB(createBattle(team.map(byId), enemyIds.map(byId))); startBattleMusic(); };
  const reroll = () => { stopBattleMusic(); setB(null); ensureEnemies(true); };
  const toggleMusicEnabled = () => {
    if (musicEnabled) {
      stopBattleMusic();
      setMusicEnabled(false);
    } else {
      setMusicEnabled(true);
      if (B && !B.over) {
        try {
          const music = createBattleMusic();
          if (!music) setMusicNotice("เบราว์เซอร์นี้ไม่รองรับเสียงดนตรี");
          else { musicRef.current = music; setMusicNotice(""); }
        } catch (error) {
          console.error("เปิดดนตรีต่อสู้ไม่สำเร็จ:", error);
          setMusicNotice("เปิดเสียงไม่ได้ — ตรวจสอบการตั้งค่าเสียงของเบราว์เซอร์");
        }
      }
    }
  };
  const a = B && B.T[B.idx];
  const myTurn = B && !B.over && B.turn === "player" && !B.auto;
  const comboReady = myTurn && a.energy >= 100 && B.T.filter((unit) => unit.hp > 0).length >= 2;
  const topFighter = B?.over ? [...B.T].sort((x, y) => y.damageDealt - x.damageDealt)[0] : null;
  const arenaAction = B?.log.slice().reverse().find((entry) => ["dmg", "sp", "combo"].includes(entry.k))?.k || "idle";
  const prompt = !B ? "กด “เริ่มต่อสู้” เพื่อเริ่ม"
    : B.over ? "การต่อสู้จบแล้ว"
    : B.auto && B.turn === "player" ? "กำลังเล่นอัตโนมัติ..."
    : B.turn !== "player" ? "ถึงเทิร์นของทีมศัตรู..."
    : B.pending ? `เลือกตัวละครฝั่งศัตรูที่ต้องการ${B.pending === "basic" ? "โจมตี" : "ใช้สกิลใส่"}`
    : `ถึงตาของ ${a.name} — เลือกโจมตีปกติ สกิลพิเศษ หรือป้องกัน`;

  return (
    <section>
      <div className={`battle-scene ${B ? "in-battle" : "preview"}`}>
        <div className="scene-sky" aria-hidden="true"><span>☀</span><i>☁</i><b>☁</b></div>
        <div className="scene-heading">
          <span>{B ? `รอบที่ ${B.round}` : "สนามประลอง Pony"}</span>
          <strong>{B?.turn === "enemy" ? "เทิร์นศัตรู" : B?.over ? "จบการต่อสู้" : B ? "เทิร์นของคุณ" : "เตรียมทีมให้พร้อม"}</strong>
        </div>
        <div className={`battle-arena${visibleFx ? " has-action" : ""} ${arenaAction}`}>
          <div className="arena-side allies">
            <h4>✨ ทีมของคุณ</h4>
            {S.T.map((u, i) => <UnitCard key={u.id} u={u} active={B && !B.over && B.turn === "player" && B.idx === i}
              attacking={visibleFx?.attackerId === u.id} struck={visibleFx?.targetIds.includes(u.id)} battleActive={!!visibleFx} />)}
          </div>
          <div className="arena-vs" aria-hidden="true"><span>VS</span></div>
          <div className="arena-side enemies">
            <h4>🌑 คู่ต่อสู้</h4>
            {S.E.map((u, i) => <UnitCard key={u.id} u={u} enemy awaiting={B && !B.over && !!B.pending}
              attacking={visibleFx?.attackerId === u.id} struck={visibleFx?.targetIds.includes(u.id)} battleActive={!!visibleFx} onPick={() => B && setB(pickTarget(B, i))} />)}
          </div>
        </div>
        <div className="scene-ground" aria-hidden="true" />
        <div className="row center scene-actions">
          <button className="ghost" onClick={reroll}>🎲 สุ่มศัตรูใหม่</button>
          <button onClick={start}>{B ? "เริ่มใหม่" : "เริ่มต่อสู้"}</button>
          <button className="ghost music-toggle" onClick={toggleMusicEnabled} aria-pressed={musicEnabled} disabled={!B || B.over}>
            {musicEnabled ? "🔊 ปิดดนตรี" : "🔇 เปิดดนตรี"}
          </button>
        </div>
        {musicNotice && <p className="music-notice" role="status">{musicNotice}</p>}
      </div>

      <div id="cmd">
        <p className="yt" role="status">{prompt}</p>
        {B?.pending && <p className="target-hint">🎯 แตะการ์ดศัตรูที่ต้องการโจมตี</p>}
        <div className="cmds">
          <button className={B?.pending === "basic" ? "sel" : ""} disabled={!myTurn} onClick={() => setB(chooseAction(B, "basic"))}>⚔ โจมตีปกติ<small>โจมตี 1 ตัว · เพิ่ม MP 35%</small></button>
          <button className={B?.pending === "special" ? "sel" : ""} disabled={!myTurn || a.energy < 100} title={a && a.energy < 100 ? `MP ยังไม่เต็ม (${a.energy}/100)` : ""} onClick={() => setB(chooseAction(B, "special"))}>✨ สกิลพิเศษ<small>{a ? `${roleLabel(a.role)} · ${a.spec}` : "ต้องมี MP 100%"}</small></button>
          <button disabled={!myTurn} onClick={() => setB(chooseAction(B, "defend"))}>🛡 ป้องกัน<small>ลดดาเมจครั้งถัดไป 50%</small></button>
          <button className="combo-button" disabled={!comboReady} title={!a || a.energy < 100 ? `ต้องมี MP 100% (ปัจจุบัน ${a?.energy || 0}%)` : "ประสานพลังโจมตีศัตรูทั้งหมด"} onClick={() => setB(teamCombo(B))}>🌟 ท่าประสานทีม<small>โจมตีศัตรูทั้งหมด · ใช้ MP เต็ม</small></button>
          <button className={B?.auto ? "on" : "ghost"} disabled={!B || B.over} onClick={() => setB(toggleAuto(B))}>⚡ ออโต้: {B?.auto ? "ON" : "OFF"}<small>กดเพื่อสลับ</small></button>
        </div>
      </div>

      {B && (
        <div className="panel">
          <button className="log-toggle ghost" aria-expanded={showLog} onClick={() => setShowLog((visible) => !visible)}>
            {showLog ? "ซ่อน" : "ดู"} บันทึกการต่อสู้ ({B.log.length})
          </button>
          {showLog && <div className="log" ref={logRef}>{B.log.map((l, i) => <div key={i} className={`l ${l.k}`}>{l.s}</div>)}</div>}
        </div>
      )}

      {B && B.over && resultReady && !closed && (
        <div className="modal">
          <div className={`box card r${B.over === "win" ? 5 : 1}`} style={{ textAlign: "center" }}>
            <h2>{B.over === "win" ? "🎉 ชนะการต่อสู้!" : "💀 แพ้การต่อสู้"}</h2>
            <p>{B.over === "win" ? "ทีมของคุณเอาชนะทีมศัตรูได้สำเร็จ!" : "ทีมของคุณพ่ายแพ้ในการต่อสู้ ลองจัดทีมใหม่แล้วกลับมาอีกครั้ง!"}</p>
            <div className="battle-summary">
              <span>ใช้เวลา <b>{B.round}</b> รอบ</span>
              <span>ทำดาเมจสูงสุด <b>{topFighter?.name || "-"}</b> ({topFighter?.damageDealt || 0})</span>
              {topFighter?.healingDone > 0 && <span>ฟื้นฟู HP <b>{topFighter.name}</b> ({topFighter.healingDone})</span>}
            </div>
            <div className="row center"><button onClick={start}>สู้อีกครั้ง</button><button className="ghost" onClick={() => setClosed(true)}>ปิด</button></div>
          </div>
        </div>
      )}
    </section>
  );
}
