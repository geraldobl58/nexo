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
};

export function SelectControl<T extends FieldValues>({
  options,
  control,
  name,
  label,
  error,
}: SelectControlProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <FormControl fullWidth error={error}>
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
