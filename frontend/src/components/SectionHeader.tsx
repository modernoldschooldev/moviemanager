interface Props {
  title: string;
}

const SectionHeader = ({ title }: Props) => {
  return (
    <div className="text-center my-2 border border-red-500">
      <h2>{title}</h2>
    </div>
  );
};

export default SectionHeader;
