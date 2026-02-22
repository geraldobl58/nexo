export type CardInformationProps = {
  icon?: React.ReactNode | false;
  title: string;
  description: string;
  variant?: "default" | "highlight" | "subtle";
  size?: "sm" | "md" | "lg";
};

const variantClasses: Record<
  NonNullable<CardInformationProps["variant"]>,
  string
> = {
  default: "bg-primary/5",
  highlight: "bg-primary/15 border border-primary/20",
  subtle: "bg-muted/30",
};

const sizeClasses: Record<NonNullable<CardInformationProps["size"]>, string> = {
  sm: "p-4 space-y-2",
  md: "p-6 space-y-4",
  lg: "p-8 space-y-6",
};

const titleSizeClasses: Record<
  NonNullable<CardInformationProps["size"]>,
  string
> = {
  sm: "text-base font-bold",
  md: "text-lg font-bold",
  lg: "text-xl font-bold",
};

export const CardInformation = ({
  icon = false,
  title,
  description,
  variant = "default",
  size = "md",
}: CardInformationProps) => {
  return (
    <div
      className={`rounded-3xl flex flex-col ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      {icon && (
        <span className="bg-white rounded-2xl p-3 w-max shadow-lg border">
          {icon}
        </span>
      )}
      <h3 className={titleSizeClasses[size]}>{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};
