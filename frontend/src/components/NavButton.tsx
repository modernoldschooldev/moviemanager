import { Link } from "react-router-dom";

interface Props {
  text: string;
  href: string;
}

const NavButton = ({ text, href }: Props) => {
  return (
    <Link
      to={href}
      className="inline-block p-2 mx-2 text-white bg-red-600 hover:bg-red-500 border border-blue-700"
    >
      {text}
    </Link>
  );
};

export default NavButton;
