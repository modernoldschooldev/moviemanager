import { TitleProps } from "../types/props";

const MovieSection: React.FC<TitleProps> = ({ children, title }) => (
  <section className="border-2 border-black p-2">
    <div className="border border-red-500 p-2 my-2">
      <h2 className="font-bold text-center text-2xl">{title}</h2>
    </div>
    <div className="border border-blue-500 my-2 p-2">{children}</div>
  </section>
);

export default MovieSection;
