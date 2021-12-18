interface Props {
  title: string;
  children: React.ReactNode;
}

const ActorSelectorList = ({ title, children }: Props) => {
  return (
    <div className="m-2 w-1/2">
      <div>
        <h3 className="font-bold text-center text-lg">{title}</h3>
      </div>

      <div>{children}</div>
    </div>
  );
};

export default ActorSelectorList;
