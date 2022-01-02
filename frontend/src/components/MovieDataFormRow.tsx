import { MovieDataFormRowProps } from "../types/props";

const MovieDataFormRow: React.FC<MovieDataFormRowProps> = ({
  children,
  name,
  title,
}) => (
  <div className="flex my-2">
    <div className="w-1/4">
      <label htmlFor={name}>{title}</label>
    </div>
    <div className="w-3/4">{children}</div>
  </div>
);

export default MovieDataFormRow;
