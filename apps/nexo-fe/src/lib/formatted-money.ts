/**
 * Converte reais → centavos. O formulário armazena valores em reais;
 * a API espera centavos (R$ 350.000 = 35000000).
 */
export function toCents(value?: number): number | undefined {
  if (value === undefined || value === null) return undefined;
  return Math.round(value * 100);
}

/** Converte centavos → reais para exibição no formulário. */
export function fromCents(
  value: number | null | undefined,
): number | undefined {
  if (value == null) return undefined;
  return value / 100;
}

/** Formata moeda a partir de reais */
export function currency(value?: number) {
  if (value === undefined || value === null) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/** Formata moeda a partir de centavos */
export function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
