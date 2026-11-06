import { Link } from "react-router-dom";
import { pagePaths } from "../Graph";

function Mascot({ x, color }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <path d="M24 24 20 9l12 9M42 20l8-13 1 19" fill={color} stroke="#765489" strokeWidth="2" strokeLinejoin="round" />
      <ellipse cx="36" cy="35" rx="19" ry="17" fill="#fff" stroke="#765489" strokeWidth="2" />
      <path d="M19 30c2-13 20-20 31-7l-6-2-4 7-4-7-7 7-4-4z" fill={color} />
      <circle cx="42" cy="34" r="2" fill="#49364f" />
      <ellipse cx="47" cy="40" rx="6" ry="4" fill="#f3c6df" />
      <path d="M23 27c-7 0-9 10-4 17 2 3 6 6 9 7" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" />
      <path d="M27 50v7m17-7v7" stroke="#765489" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

function Illustration({ type }) {
  if (type === "team") {
    return (
      <svg viewBox="0 0 180 100" role="img" aria-label="ภาพประกอบทีมม้าโพนี่สามตัว">
        <path d="M28 82h124" stroke="#d7b4df" strokeWidth="3" strokeLinecap="round" />
        <Mascot x={16} color="#f0a9ce" />
        <Mascot x={62} color="#9bd1e7" />
        <Mascot x={108} color="#f2d27f" />
        <path d="m88 12 3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1z" fill="#e8ba5b" />
      </svg>
    );
  }

  if (type === "battle") {
    return (
      <svg viewBox="0 0 180 100" role="img" aria-label="ภาพประกอบการต่อสู้แฟนตาซี">
        <path d="M14 76h152" stroke="#d7b4df" strokeWidth="3" strokeLinecap="round" />
        <Mascot x={8} color="#f0a9ce" />
        <path d="m111 24 35 35m-35 0 35-35" stroke="#9b83d4" strokeWidth="7" strokeLinecap="round" />
        <path d="m102 18 10 5-7 7zm48 36 7 10-12-5zM150 18l-10 5 7 7zm-48 36-7 10 12-5z" fill="#e8ba5b" />
        <path d="M91 15v7m-3-3h6M157 39v7m-3-3h6" stroke="#e8ba5b" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 180 100" role="img" aria-label="ภาพประกอบการเลือกตัวละคร">
      <rect x="48" y="7" width="82" height="86" rx="12" fill="#fff" stroke="#d9bce1" strokeWidth="2" />
      <rect x="54" y="13" width="70" height="74" rx="9" fill="#fff4fb" />
      <Mascot x={57} color="#efa4ca" />
      <circle cx="129" cy="74" r="17" fill="#9b83d4" stroke="#fff" strokeWidth="3" />
      <path d="M129 66v16m-8-8h16" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <path d="m33 23 3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1z" fill="#e8ba5b" />
    </svg>
  );
}

const steps = [
  {
    type: "choose",
    number: "01",
    title: "เลือกตัวละคร 3 ตัว",
    description: "กดปุ่ม “เพิ่มเข้าทีม” ใต้การ์ดตัวละครที่ชอบ เลือกได้สูงสุด 3 ตัว",
  },
  {
    type: "team",
    number: "02",
    title: "ตรวจทีมของคุณ",
    description: "เปิดหน้า “ทีมของฉัน” เพื่อดูตัวละครที่เลือก เมื่อครบ 3 ตัวก็พร้อมแล้ว",
  },
  {
    type: "battle",
    number: "03",
    title: "เริ่มการต่อสู้",
    description: "ไปหน้า “ต่อสู้” เลือกคำสั่งโจมตี แล้วเอาชนะทีมคู่ต่อสู้ให้ได้!",
  },
];

export default function PlayGuide() {
  return (
    <section className="pony-play-guide" aria-labelledby="pony-guide-title">
      <div className="pony-guide-heading">
        <span className="pony-guide-badge" aria-hidden="true">✦</span>
        <div>
          <p className="pony-guide-eyebrow">เริ่มออกผจญภัย</p>
          <h2 id="pony-guide-title">เล่นยังไง? ง่ายนิดเดียว</h2>
          <p>เตรียมทีมโพนี่ของคุณให้พร้อม แล้วไปลุยกันเลย</p>
        </div>
      </div>
      <div className="pony-guide-steps">
        {steps.map((step) => (
          <article className="pony-guide-step" key={step.number}>
            <span className="pony-guide-number">{step.number}</span>
            <div className={`pony-guide-art pony-guide-art-${step.type}`}>
              <Illustration type={step.type} />
            </div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </article>
        ))}
      </div>
      <div className="pony-guide-links">
        <Link className="button-link" to={pagePaths.characters}>ไปเลือกตัวละคร 🦄</Link>
      </div>
    </section>
  );
}
