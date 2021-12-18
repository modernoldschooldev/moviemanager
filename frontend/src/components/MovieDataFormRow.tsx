interface Props {
  title: string;
  children: React.ReactNode;
}

const MovieDataFormRow = ({ title, children }: Props) => {
  return (
    <div className="flex my-2">
      <div className="w-1/4">{title}</div>
      <div className="w-3/4">{children}</div>
    </div>
  );
};

export default MovieDataFormRow;
