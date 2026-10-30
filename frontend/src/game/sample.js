// ข้อมูลสำรองเมื่อเรียก /characters ไม่ได้
import { rng } from "./rarity";
const NAMES = "Twilight Sparkle,Rainbow Dash,Pinkie Pie,Rarity,Applejack,Fluttershy,Spike,Starlight Glimmer,Princess Celestia,Princess Luna,Discord,Trixie,Sunset Shimmer,Big McIntosh,Apple Bloom,Sweetie Belle,Scootaloo,Cheerilee,Derpy,Doctor Whooves,Lyra Heartstrings,Bon Bon,Zecora,Maud Pie,Limestone Pie,Cozy Glow,Tirek,Queen Chrysalis,Sombra,Granny Smith,Mayor Mare,Octavia".split(",");
export const SAMPLE = NAMES.map((name, i) => {
  const r = rng(i + 7), seasons = [];
  for (let s = 1; s <= 9; s++) if (r() < 0.4) seasons.push(s);
  const none = i > 26;
  return { id: i + 1, name, sex: i % 3 ? "Female" : "Male", kind: [["Pegasus", "Unicorn", "Earth pony", "Alicorn"][i % 4]], occupation: i % 2 ? "Pony in Ponyville" : "", seasons: none ? [] : seasons, episodeCount: none ? 0 : seasons.length * Math.floor(r() * 6), image: [] };
});
