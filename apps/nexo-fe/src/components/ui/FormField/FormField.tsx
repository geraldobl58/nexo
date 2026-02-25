"use client";

import { ReactNode } from "react";
import { Controller, Control, FieldValues, Path } from "react-hook-form";

import { TextField, TextFieldProps } from "@mui/material";

interface FormFieldProps<T extends FieldValues> extends Omit<
  TextFieldProps,
  "name" | "slotProps"
> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  type?: string;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
  size?: "small" | "medium";
  startAdornment?: ReactNode;
  slotProps?: {
    input?: Record<string, unknown>;
    htmlInput?: Record<string, unknown>;
  };
}

export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  helperText,
  required = false,
  type = "text",
  disabled = false,
  multiline = false,
  rows = 1,
  startAdornment,
  slotProps: customSlotProps,
  size = "medium",
  ...props
}: FormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          {...props}
          value={field.value ?? ""}
          onChange={(e) => {
            const raw = e.target.value;
            if (type === "number") {
              field.onChange(raw === "" ? undefined : Number(raw));
            } else {
              field.onChange(e);
            }
          }}
          fullWidth
          type={type}
          label={label}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          multiline={multiline}
          rows={rows}
          error={!!error}
          helperText={error?.message || helperText}
          size={size}
          slotProps={{
            ...customSlotProps,
            input: {
              startAdornment,
              ...(customSlotProps?.input || {}),
            },
            htmlInput: customSlotProps?.htmlInput,
          }}
          className="disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-300"
        />
      )}
    />
  );
}
