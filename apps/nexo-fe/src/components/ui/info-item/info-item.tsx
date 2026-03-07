export const InfoItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) => {
  return (
    <div className="flex flex-col items-center gap-1 p-3 bg-gray-50 rounded-lg">
      <span className="text-primary">{icon}</span>
      <span className="text-lg font-bold text-gray-800">{value}</span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
};
