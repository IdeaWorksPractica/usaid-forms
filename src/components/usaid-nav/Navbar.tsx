import "./navbar.css";
import imgLogo from "/logo.png";
import lema from "/lema.png";
export const Navbar = () => {
  return (
    <nav className="usaid-navbar">
      <div className="color-bar-container">
        <div className="bg-ligth-blue"></div>
        <div className="bg-medium-blue"></div>
        <div className="bg-usaid-red"></div>
      </div>
      <section className="section-container-logo">
        <img className="logo-nav" src={imgLogo} alt="" />
        <img className="logo-nav" src={lema} alt="" />
      </section>
    </nav>
  );
};
