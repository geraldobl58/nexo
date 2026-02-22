const sizeClasses = {
  sm: "text-base md:text-lg font-bold",
  md: "text-lg md:text-2xl font-bold",
  lg: "text-xl md:text-3xl font-bold",
  xl: "text-2xl md:text-4xl font-bold",
} as const;

const alignClasses = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

const descriptionSizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-lg",
} as const;

export type HeadingProps = {
  title: string;
  description?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  size?: "sm" | "md" | "lg" | "xl";
  align?: "left" | "center" | "right";
  badge?: string;
};

export const Heading = ({
  title,
  description,
  as: Tag = "h1",
  size = "md",
  align = "left",
  badge,
}: HeadingProps) => {
  return (
    <div className={alignClasses[align]}>
      {badge && (
        <span className="inline-block text-xs font-semibold text-primary bg-primary/10 rounded-full px-3 py-1 mb-2">
          {badge}
        </span>
      )}
      <Tag className={sizeClasses[size]}>{title}</Tag>
      {description && (
        <p
          className={`mt-2 text-muted-foreground ${descriptionSizeClasses[size]}`}
        >
          {description}
        </p>
      )}
    </div>
  );
};
