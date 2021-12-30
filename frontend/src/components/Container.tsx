interface Props {
  children: React.ReactNode;
}

const Container = ({ children }: Props) => {
  return <div className="container mx-auto bg-white my-4 p-4">{children}</div>;
};

export default Container;
