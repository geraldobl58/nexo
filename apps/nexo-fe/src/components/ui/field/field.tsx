type FieldProps = {
  label: string;
  value?: string | number | null;
};

export const Field = ({ label, value }: FieldProps) => {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex flex-col space-y-2 gap-0.5">
      <span className="text-xs uppercase tracking-wide text-muted-foreground font-bold mt-4">
        {label}
      </span>
      <span className="text-xs text-foreground">{value}</span>
    </div>
  );
};
