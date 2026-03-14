type ComoditiesProps = {
  icon: React.ReactNode;
  title?: string;
  label: string;
};

export const Comodities = ({ icon, title, label }: ComoditiesProps) => {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <div>
        <p className="text-sm text-muted-foreground font-semibold">{label}</p>
        {title && (
          <p className="text-xs text-muted-foreground font-normal">{title}</p>
        )}
      </div>
    </div>
  );
};
