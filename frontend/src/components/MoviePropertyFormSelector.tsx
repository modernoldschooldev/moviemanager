import { TitleProps } from "../types/props";

const MoviePropertyFormSelector: React.FC<TitleProps> = ({
  children,
  title,
}) => (
  <div className="border border-green-500 mx-2 p-3 text-center">
    <div>
      <h3 className="font-semibold text-lg">{title}</h3>
    </div>

    <div className="flex justify-center">{children}</div>
  </div>
);

export default MoviePropertyFormSelector;
