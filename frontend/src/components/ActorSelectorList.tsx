import { NameTitleProps } from "../types/props";

const ActorSelectorList: React.FC<NameTitleProps> = ({
  children,
  name,
  title,
}) => (
  <div className="m-2 w-1/2">
    <div>
      <h3 className="font-bold text-center text-lg">
        <label htmlFor={name}>{title}</label>
      </h3>
    </div>

    <div>{children}</div>
  </div>
);

export default ActorSelectorList;
