import { TitleProps } from "../types/props";

const MovieDataFormRow: React.FC<TitleProps> = ({ children, title }) => (
  <div className="flex my-2">
    <div className="w-1/4">{title}</div>
    <div className="w-3/4">{children}</div>
  </div>
);

export default MovieDataFormRow;
