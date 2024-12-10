import './menu-principal.css';
import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';

export const MenuRegistros = () => {
  const navigate = useNavigate();

  const onClick: MenuProps['onClick'] = (e) => {
    console.log('Opción seleccionada:', e.key);
    // Navega a la ruta hija según la opción seleccionada
    navigate(e.key);
  };

  return (
    <section className="w-100 h-100 p-3">
      <div className='container-menu-opt'>
        <h2 className="text-center fw-bold mb-3"> Proyectos Sociales Comunitarios</h2>
        <Menu
          className='menu-opciones-antd'
          mode="horizontal"
          onClick={onClick}
        >
          <Menu.Item key="informes">
            Informes
          </Menu.Item>
          <Menu.Item key="perfiles">
            Perfiles
          </Menu.Item>
          <Menu.Item key="planes">
            Planes
          </Menu.Item>
        </Menu>
      </div>
      <div className='render-opt-selectec'>
        {/* El Outlet renderizará el componente de la ruta hija seleccionada.
           Si la ruta principal tiene una ruta índice que muestra Informes, se mostrará por defecto al cargar esta página. */}
        <Outlet />
      </div>
    </section>
  );
};
