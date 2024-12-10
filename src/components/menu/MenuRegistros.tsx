import './menu-principal.css';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

export const MenuRegistros = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState<string>("");

  useEffect(() => {
    // Actualiza la opción seleccionada basada en la URL actual
    setSelectedKey(location.pathname.replace("/", ""));
  }, [location]);

  const handleNavigation = (key: string) => {
    console.log('Opción seleccionada:', key);
    setSelectedKey(key); // Marca la opción como seleccionada
    navigate(key);
  };

  return (
    <section className="w-100 h-100 p-3">
      <div className="container-menu-opt">
        <h2 className="text-center fw-bold mb-3">Proyectos Sociales Comunitarios</h2>
        <ul className="menu-opciones-custom">
          <li
            className={selectedKey === "informes" ? "selected" : ""}
            onClick={() => handleNavigation("informes")}
          >
            Informes
          </li>
          <li
            className={selectedKey === "perfiles" ? "selected" : ""}
            onClick={() => handleNavigation("perfiles")}
          >
            Perfiles
          </li>
          <li
            className={selectedKey === "planes" ? "selected" : ""}
            onClick={() => handleNavigation("planes")}
          >
            Planes
          </li>
          <li
            className={selectedKey === "presupuestos" ? "selected" : ""}
            onClick={() => handleNavigation("presupuestos")}
          >
            Presupuestos
          </li>
        </ul>
      </div>
      <div className="render-opt-selectec">
        <Outlet />
      </div>
    </section>
  );
};
