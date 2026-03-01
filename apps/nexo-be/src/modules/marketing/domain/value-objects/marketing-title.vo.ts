/**
 * VALUE OBJECT: TÍTULO DO ANÚNCIO
 *
 * O que é um Value Object (VO)?
 * É um objeto imutável que se define pelo SEU VALOR, não por um ID.
 * Se dois VOs têm o mesmo valor, são considerados iguais.
 *
 * Para que serve?
 * Centraliza regras de validação de um conceito do domínio.
 * Em vez de espalhar `if (title.length < 10)` por todo o código,
 * colocamos aqui uma vez, e o resto do sistema confia no tipo.
 *
 * Exemplo de uso no use-case:
 *   const title = ListingTitle.create(input.title); // valida e retorna
 *   listing.title = title.value;                    // usa o valor puro
 */
export class ListingTitle {
  /** Comprimento mínimo exigido para o título */
  static readonly MIN_LENGTH = 10;

  /** Comprimento máximo permitido para o título */
  static readonly MAX_LENGTH = 150;

  /**
   * O valor do título já validado e normalizado.
   * `private readonly` garante imutabilidade após a criação.
   */
  private readonly _value: string;

  /**
   * Construtor privado: só pode ser instanciado via `ListingTitle.create()`.
   * Isso garante que um ListingTitle sempre foi validado antes de existir.
   */
  private constructor(value: string) {
    this._value = value;
  }

  /**
   * Fábrica estática (Factory Method).
   *
   * Valida o título antes de criar o objeto.
   * Lança um Error descritivo se a validação falhar.
   *
   * @param raw - O título bruto enviado pelo usuário
   * @returns Instância válida de ListingTitle
   * @throws Error se o título não for válido
   */
  static create(raw: string): ListingTitle {
    // Remove espaços extras nas bordas
    const trimmed = raw?.trim() ?? '';

    if (trimmed.length < ListingTitle.MIN_LENGTH) {
      throw new Error(
        `Título muito curto. Mínimo: ${ListingTitle.MIN_LENGTH} caracteres.`,
      );
    }

    if (trimmed.length > ListingTitle.MAX_LENGTH) {
      throw new Error(
        `Título muito longo. Máximo: ${ListingTitle.MAX_LENGTH} caracteres.`,
      );
    }

    return new ListingTitle(trimmed);
  }

  /** Retorna o valor puro (string) para persistir no banco */
  get value(): string {
    return this._value;
  }

  /** Compara dois ListingTitle pelo valor (igualdade de VO) */
  equals(other: ListingTitle): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
