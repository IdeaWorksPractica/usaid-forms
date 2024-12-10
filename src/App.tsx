import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from "./components/usaid-nav/Navbar";
import { Perfiles } from './components/perfiles/Perfiles';
import { Planes } from './components/planes/Planes';
import { Informes } from './components/informes/Informes';
import { MenuRegistros } from "./components/menu/MenuRegistros";
import {Presupuestos} from './components/presupuestos/Presupuestos';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="main-container">
        <Routes>
          {/* Ruta principal que usa MenuRegistros como Layout */}
          <Route path="/" element={<MenuRegistros />}>
            {/* Ruta índice: se muestra por defecto Informes */}
            <Route index element={<Informes />} />
            <Route path="informes" element={<Informes />} />
            <Route path="perfiles" element={<Perfiles />} />
            <Route path="planes" element={<Planes />} />
            <Route path="presupuestos" element={<Presupuestos />} />
          </Route>
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
