export default function Pager({ page, pages, onPage }) {
  const nums = [];
  for (let i = 1; i <= pages; i++) if (i === 1 || i === pages || Math.abs(i - page) <= 2) nums.push(i);
  return (
    <div className="pager">
      <button disabled={page <= 1} onClick={() => onPage(page - 1)}>‹</button>
      {nums.map((n, i) => (
        <span key={n}>
          {i > 0 && n - nums[i - 1] > 1 && "… "}
          <button className={n === page ? "on" : ""} onClick={() => onPage(n)}>{n}</button>
        </span>
      ))}
      <button disabled={page >= pages} onClick={() => onPage(page + 1)}>›</button>
    </div>
  );
}
