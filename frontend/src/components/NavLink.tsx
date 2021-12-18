import { Link } from "react-router-dom";

interface Props {
  title: string;
  href: string;
}

const NavLink = ({ title, href }: Props) => {
  return (
    <Link
      className="bg-amber-400 hover:bg-amber-300 font-semibold inline-block mx-2 p-2 rounded-xl text-center text-stone-700 w-32"
      to={href}
    >
      {title}
    </Link>
  );
};

export default NavLink;
