import { Routes, Route } from "react-router-dom";
import { pagePaths, routePaths } from "./Graph";
import Nav from "./components/Nav";
import CharactersPage from "./pages/CharactersPage";
import CharacterDetailPage from "./pages/CharacterDetailPage";
import TeamPage from "./pages/TeamPage";
import BattlePage from "./pages/BattlePage";

const PAGE_COMPONENTS = {
  characters: CharactersPage,
  team: TeamPage,
  battle: BattlePage
};

function App() {
  return (
    <>
      <header>
        <h1>🦄 Pony Cards</h1>
        <p>สะสมการ์ดตัวละคร เลือก 3 ตัวไปสู้กับศัตรู</p>
      </header>
      <div className="wrap">
        <Nav />
        <Routes>
          <Route path={pagePaths.characters} element={<CharactersPage />} />
          <Route path={pagePaths.team} element={<TeamPage />} />
          <Route path={pagePaths.battle} element={<BattlePage />} />
          <Route path={routePaths.characterDetail} element={<CharacterDetailPage />} />
          <Route path="*" element={<CharactersPage />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
