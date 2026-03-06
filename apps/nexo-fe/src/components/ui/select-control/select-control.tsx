import {
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
} from "@mui/material";
import { Controller, FieldValues, Path, Control } from "react-hook-form";

type SelectOption = {
  value: string;
  label: string;
};

type SelectControlProps<T extends FieldValues> = {
  options: SelectOption[];
  control: Control<T>;
  name: Path<T>;
  label?: string;
  error?: boolean;
  size?: "small" | "medium";
};

export function SelectControl<T extends FieldValues>({
  options,
  control,
  name,
  label,
  error,
  size = "medium",
}: SelectControlProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <FormControl fullWidth error={error} size={size}>
          {label && <InputLabel>{label}</InputLabel>}
          <Select
            {...field}
            displayEmpty
            input={<OutlinedInput label={label} />}
          >
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    />
  );
}
