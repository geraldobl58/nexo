/**
 * VALUE OBJECT: ENDEREÇO DO ANÚNCIO
 *
 * Agrupa e valida os dados de localização de um imóvel.
 *
 * Campos obrigatórios:
 *  - city     — cidade
 *  - state    — UF do Brasil (2 letras maiúsculas): SP, RJ, MG, etc.
 *  - district — bairro
 *
 * Campos opcionais (mas validados quando presentes):
 *  - zipcode  — CEP brasileiro: NNNNN-NNN ou NNNNNNNN (8 dígitos)
 *  - street, streetNumber, complement — endereço completo
 *
 * Por que agrupar num VO?
 * - Evita enviar "metade de um endereço" (state sem city, etc.)
 * - Centraliza a validação da UF e do CEP num único lugar
 * - Move perto dados que mudam juntos (se o endereço muda, tudo muda)
 */

/** UFs válidas do Brasil */
const VALID_BR_STATES = new Set([
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
]);

/** Expressão regular para CEP: "NNNNN-NNN" ou "NNNNNNNN" */
const CEP_REGEX = /^\d{5}-?\d{3}$/;

export interface ListingAddressProps {
  city: string;
  state: string;
  district: string;
  street?: string | null;
  streetNumber?: string | null;
  complement?: string | null;
  zipcode?: string | null;
}

export class ListingAddress {
  private readonly _city: string;
  private readonly _state: string;
  private readonly _district: string;
  private readonly _street: string | null;
  private readonly _streetNumber: string | null;
  private readonly _complement: string | null;
  private readonly _zipcode: string | null;

  private constructor(props: Required<ListingAddressProps>) {
    this._city = props.city;
    this._state = props.state;
    this._district = props.district;
    this._street = props.street;
    this._streetNumber = props.streetNumber;
    this._complement = props.complement;
    this._zipcode = props.zipcode;
  }

  /**
   * Fábrica estática. Valida todos os campos antes de criar o objeto.
   *
   * @throws Error se city, state ou district inválidos
   * @throws Error se zipcode tiver formato incorreto
   */
  static create(props: ListingAddressProps): ListingAddress {
    const city = props.city?.trim();
    const state = props.state?.trim().toUpperCase();
    const district = props.district?.trim();
    const zipcode = props.zipcode?.trim() ?? null;

    if (!city || city.length < 2) {
      throw new Error('Cidade inválida. Informe o nome completo da cidade.');
    }

    if (!state || !VALID_BR_STATES.has(state)) {
      throw new Error(
        `UF inválida: "${props.state}". ` +
          'Use uma das 27 siglas de estados brasileiros (ex: SP, RJ, MG).',
      );
    }

    if (!district || district.length < 2) {
      throw new Error('Bairro inválido. Informe o nome do bairro.');
    }

    if (zipcode && !CEP_REGEX.test(zipcode)) {
      throw new Error(
        `CEP inválido: "${zipcode}". ` +
          'Use o formato NNNNN-NNN ou NNNNNNNN (ex: 01310-100 ou 01310100).',
      );
    }

    return new ListingAddress({
      city,
      state,
      district,
      street: props.street?.trim() ?? null,
      streetNumber: props.streetNumber?.trim() ?? null,
      complement: props.complement?.trim() ?? null,
      zipcode,
    });
  }

  get city(): string {
    return this._city;
  }

  get state(): string {
    return this._state;
  }

  get district(): string {
    return this._district;
  }

  get street(): string | null {
    return this._street;
  }

  get streetNumber(): string | null {
    return this._streetNumber;
  }

  get complement(): string | null {
    return this._complement;
  }

  /** CEP normalizado (sem hífen): "01310100" */
  get zipcode(): string | null {
    return this._zipcode ? this._zipcode.replace('-', '') : null;
  }

  /** CEP formatado com hífen: "01310-100" */
  get zipcodeFormatted(): string | null {
    const z = this.zipcode;
    if (!z) return null;
    return `${z.slice(0, 5)}-${z.slice(5)}`;
  }

  /**
   * Retorna endereço completo em uma linha.
   * Exemplo: "Rua das Flores, 123 - Apto 42 - Leblon, Rio de Janeiro - RJ"
   */
  toFullAddress(): string {
    const parts: string[] = [];
    if (this._street) {
      const streetPart = this._streetNumber
        ? `${this._street}, ${this._streetNumber}`
        : this._street;
      parts.push(streetPart);
    }
    if (this._complement) parts.push(this._complement);
    parts.push(`${this._district}, ${this._city} - ${this._state}`);
    return parts.join(' - ');
  }

  /** Retorna apenas "Bairro, Cidade - UF" */
  toShortAddress(): string {
    return `${this._district}, ${this._city} - ${this._state}`;
  }

  /** Converte para objeto simples para persistência */
  toObject(): Required<ListingAddressProps> {
    return {
      city: this._city,
      state: this._state,
      district: this._district,
      street: this._street,
      streetNumber: this._streetNumber,
      complement: this._complement,
      zipcode: this.zipcode,
    };
  }

  /** Verifica igualdade completa de endereço */
  equals(other: ListingAddress): boolean {
    return (
      this._city === other._city &&
      this._state === other._state &&
      this._district === other._district &&
      this._street === other._street &&
      this._streetNumber === other._streetNumber &&
      this._complement === other._complement &&
      this.zipcode === other.zipcode
    );
  }

  toString(): string {
    return this.toFullAddress();
  }
}
