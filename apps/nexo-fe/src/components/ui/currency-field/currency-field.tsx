"use client";

import { forwardRef } from "react";
import { NumericFormat, NumericFormatProps } from "react-number-format";
import { Controller, Control, FieldValues, Path } from "react-hook-form";
import { TextField } from "@mui/material";

// ---------------------------------------------------------------------------
// Custom input adapter para o MUI TextField
// ---------------------------------------------------------------------------

interface NumericAdapterProps {
  onChange: (event: {
    target: { name: string; value: number | undefined };
  }) => void;
  name: string;
}

const NumericAdapter = forwardRef<HTMLInputElement, NumericAdapterProps>(
  function NumericAdapter({ onChange, name, ...other }, ref) {
    return (
      <NumericFormat
        {...(other as NumericFormatProps)}
        getInputRef={ref}
        thousandSeparator="."
        decimalSeparator=","
        prefix="R$ "
        decimalScale={2}
        fixedDecimalScale
        onValueChange={(values) => {
          onChange({
            target: {
              name,
              value: values.floatValue,
            },
          });
        }}
      />
    );
  },
);

// ---------------------------------------------------------------------------
// CurrencyField
// ---------------------------------------------------------------------------

interface CurrencyFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  error?: boolean;
  disabled?: boolean;
  size?: "small" | "medium";
}

export function CurrencyField<T extends FieldValues>({
  control,
  name,
  label,
  error,
  disabled = false,
  size = "medium",
}: CurrencyFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          fullWidth
          label={label}
          disabled={disabled}
          size={size}
          error={!!fieldState.error || error}
          helperText={fieldState.error?.message}
          slotProps={{
            input: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              inputComponent: NumericAdapter as any,
            },
          }}
        />
      )}
    />
  );
}
