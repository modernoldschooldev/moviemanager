interface Props {
  children: React.ReactNode;
}

const Container = ({ children }: Props) => {
  return (
    <main className="container bg-white mx-auto my-4 p-4">{children}</main>
  );
};

export default Container;
