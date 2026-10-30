import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Portrait from "../components/Portrait";
import DataState from "../components/DataState";
import { pagePaths } from "../Graph";

const asLines = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  return typeof value === "string" ? value.split(/\r?\n/).filter(Boolean) : [];
};

export default function CharacterDetailPage() {
  const { id } = useParams();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadCharacter() {
      setCharacter(null);
      setError("");

      if (!/^\d+$/.test(id || "")) {
        setError("รหัสตัวละครไม่ถูกต้อง");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const retrying = attempt > 0;
        const response = await fetch(retrying ? "/characters/reload" : `/characters/${encodeURIComponent(id)}`, {
          method: retrying ? "POST" : "GET",
        });
        const data = await response.json().catch(() => ({}));
        if (response.status === 404) {
          if (!cancelled) setError("ไม่พบข้อมูลตัวละครนี้");
          return;
        }
        if (!response.ok) {
          throw new Error(data.error || `โหลดข้อมูลไม่สำเร็จ (${response.status})`);
        }
        const characterData = retrying && Array.isArray(data.data)
          ? data.data.find((item) => Number(item.id) === Number(id))
          : data;
        if (!characterData) {
          if (!cancelled) setError("ไม่พบข้อมูลตัวละครนี้");
          return;
        }
        if (typeof characterData !== "object" || !characterData.id || !characterData.name) {
          throw new Error("รูปแบบข้อมูลตัวละครไม่ถูกต้อง");
        }
        if (!cancelled) setCharacter(characterData);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "โหลดข้อมูลตัวละครไม่สำเร็จ");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadCharacter();
    return () => { cancelled = true; };
  }, [id, attempt]);

  if (loading || error || !character) {
    const notFound = error === "ไม่พบข้อมูลตัวละครนี้";
    return (
      <section>
        <DataState loading={loading} error={notFound ? "" : error}
          onRetry={() => setAttempt((current) => current + 1)}
          empty={notFound || (!loading && !error && !character)} emptyMessage="ไม่พบข้อมูลตัวละครนี้" />
        {(notFound || !loading) && <Link className="button-link" to={pagePaths.characters}>กลับไปหน้าตัวละคร</Link>}
      </section>
    );
  }

  const lines = (label, values) => values.length > 0 && (
    <div className="detail-field">
      <strong>{label}</strong>
      <ul>{values.map((value, index) => <li key={`${label}-${index}`}>{value}</li>)}</ul>
    </div>
  );
  const kinds = asLines(character.kind);
  const residence = asLines(character.residence);
  const occupation = asLines(character.occupation);
  const seasons = asLines(character.seasons).map((season) => `Season ${season}`);
  const images = asLines(character.image);

  return (
    <section className="panel character-detail">
      <Link to={pagePaths.characters}>← กลับไปหน้าตัวละคร</Link>
      <div className="detail-heading">
        <Portrait c={{ ...character, image: images }} />
        <div>
          <h2>{character.name}</h2>
          {character.alias && <p className="mini">หรือ {character.alias}</p>}
          <p className="mini">รหัสตัวละคร: {character.id}</p>
        </div>
      </div>
      <div className="detail-fields">
        {lines("เพศ", asLines(character.sex))}
        {lines("ประเภท", kinds)}
        {lines("ถิ่นที่อยู่", residence)}
        {lines("อาชีพ", occupation)}
        {lines("ซีซันที่ปรากฏ", seasons)}
        {character.episodeCount != null && lines("จำนวนตอนที่ปรากฏ", [character.episodeCount])}
      </div>
      {character.url && (
        <p className="row">
          <a href={character.url} target="_blank" rel="noreferrer">อ่านเพิ่มเติมจาก My Little Pony Wiki</a>
        </p>
      )}
    </section>
  );
}
