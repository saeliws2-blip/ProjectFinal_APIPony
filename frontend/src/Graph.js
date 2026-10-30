// Graph (adjacency list) — node = หน้าเว็บ, edge = ลิงก์/เมนูที่พาไปหน้าอื่น

export const pageGraph = {
  characters: ["team", "battle", "characterDetail"],
  team: ["characters", "battle"],
  battle: ["characters", "team"],
  characterDetail: ["characters", "team", "battle"]
};

// เส้นทางของแต่ละหน้า
export const pagePaths = {
  characters: "/",
  team: "/team",
  battle: "/battle"
};

export const routePaths = {
  ...pagePaths,
  characterDetail: "/characters/:id"
};

// ตรวจสอบว่าสามารถเดินทางจากหน้าหนึ่งไปอีกหน้าหนึ่งได้หรือไม่ ด้วย BFS
export function canReach(start, end, graph = pageGraph) {
  const queue = [start];
  const visited = new Set([start]);

  while (queue.length > 0) {
    const current = queue.shift();

    if (current === end) return true;

    for (const neighbor of graph[current] ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return false;
}

// ตรวจสอบหน้าที่ไปไม่ถึงจาก characters และหน้าที่ไม่มีทางกลับไป characters
export function checkGraph() {
  const pages = Object.keys(pageGraph);

  return {
    orphans: pages.filter((p) => !canReach("characters", p)),
    deadEnds: pages.filter((p) => !canReach(p, "characters"))
  };
}
