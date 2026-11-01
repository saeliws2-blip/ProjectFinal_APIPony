import { Routes, Route } from "react-router-dom";
import { pagePaths, routePaths } from "./Graph";
import Nav from "./components/Nav";
import CharactersPage from "./pages/CharactersPagePony";
import CharacterDetailPage from "./pages/CharacterDetailPagePony";
import TeamPage from "./pages/TeamPage";
import BattlePage from "./pages/BattlePagePony";
import HowToPlayPagePony from "./pages/HowToPlayPagePony";

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
          <Route path="/how-to-play" element={<HowToPlayPagePony />} />
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
