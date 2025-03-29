import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Recipes from "./pages/Recipes"; // new import here!

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/recipes" element={<Recipes />} /> {/* new route here */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
