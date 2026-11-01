import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useGame } from "../context/GameContext";
import Portrait from "../components/Portrait";
import BattlePage from "./BattlePage";

const CONFETTI_COLORS = ["#f28fbe", "#92c9e8", "#f0ce72", "#ad95e8", "#9bd5b0", "#fff"];
const CONFETTI = Array.from({ length: 36 }, (_, index) => ({
  left: `${(index * 37 + 5) % 100}%`,
  delay: `${-((index * 13) % 45) / 10}s`,
  duration: `${5 + (index % 6) * 0.7}s`,
  color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
  drift: `${((index * 17) % 150) - 75}px`,
  width: `${6 + (index % 4) * 2}px`,
  height: `${10 + (index % 5) * 2}px`,
}));

function BattleResultDecor({ result, teamCharacters }) {
  const confetti = result.outcome === "win" && createPortal(
    <div className="pony-confetti-layer" aria-hidden="true">
      {CONFETTI.map((piece, index) => (
        <span
          key={index}
          style={{
            left: piece.left,
            animationDelay: piece.delay,
            animationDuration: piece.duration,
            backgroundColor: piece.color,
            width: piece.width,
            height: piece.height,
            "--pony-confetti-drift": piece.drift,
          }}
        />
      ))}
    </div>,
    document.body
  );

  return (
    <>
      {confetti}
      {createPortal(
        <div className={`pony-battle-result is-${result.outcome}`}>
          {result.outcome === "win" ? (
            <>
              <p className="pony-battle-result-caption">🌟 ทีมโพนี่ของคุณร่วมมือกันได้ยอดเยี่ยม! 🌟</p>
              <div className="pony-winning-team" aria-label="ทีมที่ชนะการต่อสู้">
                {teamCharacters.map((character, index) => (
                  <div className="pony-winning-member" key={character.id}>
                    <span className="pony-winning-number">{index + 1}</span>
                    <Portrait c={character} />
                    <strong>{character.name}</strong>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="pony-battle-loss-note">💔 พ่ายแพ้ในรอบนี้ ลองจัดทีมแล้วกลับมาสู้ใหม่นะ</p>
          )}
        </div>,
        result.target
      )}
    </>
  );
}

export default function BattlePagePony() {
  const { team, byId } = useGame();
  const [result, setResult] = useState(null);
  const observedResult = useRef(null);
  const teamCharacters = useMemo(() => team.map(byId).filter(Boolean), [team, byId]);

  useEffect(() => {
    const syncResult = () => {
      const box = document.querySelector(".modal .battle-summary")?.closest(".box");
      if (!box) {
        if (observedResult.current) {
          observedResult.current = null;
          setResult(null);
        }
        return;
      }

      const heading = box.querySelector("h2")?.textContent || "";
      const outcome = heading.includes("ชนะ") ? "win" : heading.includes("แพ้") ? "lose" : null;
      if (!outcome) return;
      if (observedResult.current?.target === box && observedResult.current.outcome === outcome) return;

      const nextResult = { target: box, outcome };
      observedResult.current = nextResult;
      setResult(nextResult);
    };

    const observer = new MutationObserver(syncResult);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    syncResult();
    return () => {
      observer.disconnect();
      observedResult.current = null;
    };
  }, []);

  return (
    <>
      <BattlePage />
      {result && <BattleResultDecor result={result} teamCharacters={teamCharacters} />}
    </>
  );
}
