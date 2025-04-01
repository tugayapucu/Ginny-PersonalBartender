import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Recipes from "./pages/Recipes";
import CocktailDetail from "./pages/CocktailDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/recipes" element={<Recipes />} /> 
        <Route path="/cocktails/:id" element={<CocktailDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
