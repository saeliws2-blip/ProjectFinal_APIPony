import { useState } from "react";
export default function Portrait({ c }) {
  const [bad, setBad] = useState(false);
  const src = c.image && c.image[0];
  return <div className="img">{src && !bad ? <img src={src} alt="" onError={() => setBad(true)} /> : "🦄"}</div>;
}
