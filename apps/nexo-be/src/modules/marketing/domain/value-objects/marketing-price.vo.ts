/**
 * VALUE OBJECT: PREÇO DO ANÚNCIO (EM CENTAVOS)
 *
 * Por que armazenar preço em centavos (inteiro)?
 * Evita erros de ponto flutuante:
 *   0.1 + 0.2 === 0.30000000000000004  ← JavaScript float hell
 *   1000 + 2000 === 3000               ← inteiro, sem surpresas
 *
 * Regras de negócio encapsuladas aqui:
 *  - Preço obrigatoriamente inteiro positivo (> 0)
 *  - Não pode ser fracionário (centavos já representam a menor unidade)
 *  - Limite técnico: Number.MAX_SAFE_INTEGER (~9 quadrilhões de centavos)
 *
 * Exemplos:
 *   R$ 1.200.000,00 → 120000000 centavos
 *   R$     3.500,00 →    350000 centavos
 */
export class ListingPrice {
  /** Preço mínimo aceito: R$ 0,01 (1 centavo) */
  static readonly MIN_CENTS = 1;

  private readonly _cents: number;

  private constructor(cents: number) {
    this._cents = cents;
  }

  /**
   * Fábrica estática. Valida e retorna um ListingPrice imutável.
   *
   * @param cents - Valor em centavos (inteiro positivo)
   * @throws Error se o valor for inválido
   */
  static create(cents: number): ListingPrice {
    if (!Number.isInteger(cents)) {
      throw new Error(
        'O preço deve ser um número inteiro em centavos. ' +
          `Recebido: ${cents}. Exemplo: R$ 350.000,00 = 35000000 centavos.`,
      );
    }

    if (cents < ListingPrice.MIN_CENTS) {
      throw new Error(
        `O preço deve ser maior que zero. Recebido: ${cents} centavos.`,
      );
    }

    if (!Number.isSafeInteger(cents)) {
      throw new Error(
        'O preço informado é muito alto e pode causar erros de precisão.',
      );
    }

    return new ListingPrice(cents);
  }

  /** Retorna o valor em centavos (inteiro) — use para persistência */
  get value(): number {
    return this._cents;
  }

  /**
   * Converte para reais (float).
   * Use apenas para exibição, nunca para cálculo.
   */
  toReais(): number {
    return this._cents / 100;
  }

  /**
   * Formata como moeda brasileira.
   * Exemplo: 120000000 → "R$ 1.200.000,00"
   */
  format(): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(this.toReais());
  }

  /** Verifica igualdade de valor com outro ListingPrice */
  equals(other: ListingPrice): boolean {
    return this._cents === other._cents;
  }

  toString(): string {
    return this.format();
  }
}
