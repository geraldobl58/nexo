import {
  Checkbox,
  CheckboxProps,
  FormControlLabel,
  FormHelperText,
} from "@mui/material";
import { Controller, FieldValues, Path, Control } from "react-hook-form";

type CheckboxCustomProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  disabled?: boolean;
  size?: CheckboxProps["size"];
  color?: CheckboxProps["color"];
  labelPlacement?: "end" | "start" | "top" | "bottom";
  helperText?: string;
};

export function CheckboxCustom<T extends FieldValues>({
  control,
  name,
  label,
  disabled = false,
  size = "medium",
  color = "primary",
  labelPlacement = "end",
  helperText,
}: CheckboxCustomProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div>
          <FormControlLabel
            labelPlacement={labelPlacement}
            disabled={disabled}
            label={label ?? ""}
            control={
              <Checkbox
                {...field}
                checked={!!field.value}
                size={size}
                color={color}
              />
            }
          />
          {(fieldState.error?.message || helperText) && (
            <FormHelperText error={!!fieldState.error}>
              {fieldState.error?.message ?? helperText}
            </FormHelperText>
          )}
        </div>
      )}
    />
  );
}
