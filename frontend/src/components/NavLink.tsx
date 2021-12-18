import { Link } from "react-router-dom";

interface Props {
  title: string;
  href: string;
}

const NavLink = ({ title, href }: Props) => {
  return (
    <Link
      className="bg-purple-700 hover:bg-purple-600 font-semibold inline-block mx-2 p-2 rounded-xl text-center text-white w-32"
      to={href}
    >
      {title}
    </Link>
  );
};

export default NavLink;
