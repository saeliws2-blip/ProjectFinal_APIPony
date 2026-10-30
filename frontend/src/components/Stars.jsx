export default function Stars({ n }) {
  return <span className="stars" aria-label={`${n} ดาว`}>{"★".repeat(n)}{"☆".repeat(5 - n)}</span>;
}
