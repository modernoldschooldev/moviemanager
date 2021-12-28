import NavLink from "./NavLink";

const NavBar = () => (
  <nav className="flex justify-center my-4 mx-8">
    <NavLink title="Main" href="/" />
    <NavLink title="Admin" href="/admin" />
  </nav>
);

export default NavBar;
