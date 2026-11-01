import Portrait from "./Portrait";
import Stars from "./Stars";
import StatBars from "./StatBars";

function text(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  return typeof value === "string" ? value.trim() : "";
}

function Info({ label, value }) {
  const content = text(value);
  return content ? <p><b>{label}:</b> {content}</p> : null;
}

export default function CharacterProfile({ character }) {
  const episodes = Array.isArray(character.appearanceEpisodes) ? character.appearanceEpisodes : [];
  const episodeDetails = episodes.map((episode) => {
    const code = typeof episode.code === "string" ? episode.code : "";
    const codeParts = code.match(/^S(\d+)E(\d+)$/i);
    const season = Number(episode.season || codeParts?.[1]);
    const number = Number(episode.episode || codeParts?.[2]);
    return { ...episode, season, number };
  }).filter((episode) => Number.isInteger(episode.season) && episode.season > 0);
  const seasons = [...new Set([
    ...(Array.isArray(character.seasons) ? character.seasons.map(Number) : []),
    ...episodeDetails.map((episode) => episode.season),
  ])].filter((season) => Number.isInteger(season) && season > 0).sort((a, b) => a - b);
  const episodesBySeason = new Map(
    seasons.map((season) => [
      season,
      episodeDetails
        .filter((episode) => episode.season === season)
        .sort((a, b) => (a.number || Infinity) - (b.number || Infinity)),
    ])
  );

  return (
    <section className="pony-story-panel pony-profile-panel">
      <div className="pony-profile-heading">
        <Portrait c={character} />
        <div>
          <h3>{character.name}</h3>
          {character.alias && <p className="mini">หรือ {text(character.alias)}</p>}
          {character.rate && <><Stars n={character.star} /><p className="mini">ระดับความแร์: {character.rate.src}</p></>}
        </div>
      </div>
      <div className="info">
        <Info label="อาชีพ" value={character.occupation} />
        <Info label="ถิ่นที่อยู่" value={character.residence} />
        <Info label="ประเภท" value={character.kind} />
        <Info label="เพศ" value={character.sex} />
      </div>
      {character.st && (
        <div className="pony-stats">
          <h4>ค่าพลังตัวละคร</h4>
          <StatBars st={character.st} />
        </div>
      )}
      <section className="pony-appearances" aria-label="ซีซันและตอนที่ตัวละครปรากฏ">
        <div className="pony-appearance-heading">
          <span aria-hidden="true">✨</span>
          <div>
            <h4>การปรากฏตัว</h4>
            <p>ซีซันและตอนที่ {character.name} ร่วมผจญภัย</p>
          </div>
        </div>
        <div className="pony-appearance-counts">
          <span>🌙 {seasons.length} ซีซัน</span>
          <span>📺 {character.episodeCount ?? episodes.length} ตอน</span>
        </div>
        {seasons.length > 0 ? seasons.map((season) => {
          const seasonEpisodes = episodesBySeason.get(season) || [];
          return (
            <section className="pony-season-episodes" key={season} aria-label={`Season ${season}`}>
              <h5 className="pony-season-chip">✦ Season {season}</h5>
              {seasonEpisodes.length > 0 ? (
                <ul className="pony-episode-list" aria-label={`ตอนที่ปรากฏใน Season ${season}`}>
                  {seasonEpisodes.map((episode, index) => (
                    <li key={`${episode.code || `S${season}E${episode.number || index}`}-${index}`}>
                      <span className="pony-episode-marker" aria-hidden="true">✦</span>
                      <div>
                        <b>{episode.number ? `ปรากฏตอนที่ ${episode.number}` : episode.code || "ตอนที่ไม่ระบุ"}</b>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="pony-no-episodes">ไม่มีข้อมูลตอนของซีซันนี้</p>
              )}
            </section>
          );
        }) : (
          <p className="pony-no-episodes">ไม่มีข้อมูลซีซันที่ปรากฏ</p>
        )}
      </section>
      {character.url && (
        <p className="pony-wiki-link">
          <a href={character.url} target="_blank" rel="noreferrer">
            อ่านเพิ่มเติมจาก My Little Pony Wiki ↗
          </a>
        </p>
      )}
    </section>
  );
}
