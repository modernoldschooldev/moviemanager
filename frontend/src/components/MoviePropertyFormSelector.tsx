interface Props {
  title: string;
  children: React.ReactNode;
}

const MoviePropertyFormSelector = ({ title, children }: Props) => {
  return (
    <div className="border border-green-500 mx-2 p-3 text-center">
      <div>
        <h3 className="font-semibold text-lg">{title}</h3>
      </div>

      <div className="flex justify-center">{children}</div>
    </div>
  );
};

export default MoviePropertyFormSelector;
