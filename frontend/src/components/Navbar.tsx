import NavButton from "./NavButton";

const Navbar = () => {
  return (
    <div className="flex items-center justify-center">
      <NavButton text="Clip Editor" href="/" />
      <NavButton text="Admin" href="/admin" />
    </div>
  );
};

export default Navbar;
