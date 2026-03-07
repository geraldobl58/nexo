import { Button } from "@mui/material";

import { Edit2Icon } from "lucide-react";

type SectionProps = {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
};

export const Section = ({ title, onEdit, children }: SectionProps) => {
  return (
    <div>
      <div className="flex items-center justify-between rounded-lg p-4 bg-primary/5">
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Edit2Icon fontSize="small" />}
          onClick={onEdit}
          className="!text-xs"
        >
          Editar
        </Button>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
};
