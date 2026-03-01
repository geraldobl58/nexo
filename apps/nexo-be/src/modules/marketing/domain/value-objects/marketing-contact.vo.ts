/**
 * VALUE OBJECT: CONTATO DO ANÚNCIO
 *
 * Agrupa os dados de contato específicos de um anúncio imobiliário.
 * Esses dados podem ser diferentes do contato padrão do anunciante
 * (ex: um corretor diferente para cada imóvel).
 *
 * Todos os campos são opcionais, mas quando presentes são validados:
 *  - email: formato RFC 5322 simplificado
 *  - phone/whatsapp: apenas dígitos, 10 ou 11 números brasileiros
 *
 * Por que um VO?
 * - Garante que qualquer email ou telefone salvo já foi validado
 * - Move a lógica de validação para fora dos use-cases
 * - Facilita reutilização (ex: outro módulo precisa validar telefone BR)
 */

/** Regex de e-mail simplificado (cobre 99%+ dos casos reais) */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Telefone brasileiro: opcionalmente +55, DDD (2 dígitos), número (8 ou 9 dígitos).
 * Aceita com ou sem formatação: (11) 99999-9999, 11999999999, +5511999999999
 */
const PHONE_DIGITS_REGEX = /^\d{10,11}$/;

/** Remove todos os caracteres não-numéricos do telefone */
function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, '');
}

export interface ListingContactProps {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
}

export class ListingContact {
  private readonly _name: string | null;
  private readonly _email: string | null;
  private readonly _phone: string | null;
  private readonly _whatsapp: string | null;

  private constructor(props: Required<ListingContactProps>) {
    this._name = props.name;
    this._email = props.email;
    this._phone = props.phone;
    this._whatsapp = props.whatsapp;
  }

  /**
   * Fábrica estática.
   * Todos os campos são opcionais, mas validados quando presentes.
   *
   * @throws Error se email tiver formato inválido
   * @throws Error se phone ou whatsapp não tiverem 10 ou 11 dígitos
   */
  static create(props: ListingContactProps = {}): ListingContact {
    const name = props.name?.trim() ?? null;
    const email = props.email?.trim().toLowerCase() ?? null;
    const phone = props.phone ? normalizePhone(props.phone) : null;
    const whatsapp = props.whatsapp ? normalizePhone(props.whatsapp) : null;

    if (email && !EMAIL_REGEX.test(email)) {
      throw new Error(
        `E-mail de contato inválido: "${props.email}". ` +
          'Use o formato usuario@dominio.com.',
      );
    }

    if (phone && !PHONE_DIGITS_REGEX.test(phone)) {
      throw new Error(
        `Telefone de contato inválido: "${props.phone}". ` +
          'Informe DDD + número (10 ou 11 dígitos). Ex: 11999887766.',
      );
    }

    if (whatsapp && !PHONE_DIGITS_REGEX.test(whatsapp)) {
      throw new Error(
        `WhatsApp de contato inválido: "${props.whatsapp}". ` +
          'Informe DDD + número (10 ou 11 dígitos). Ex: 11999887766.',
      );
    }

    return new ListingContact({ name, email, phone, whatsapp });
  }

  /** Cria uma instância vazia (sem dados de contato) */
  static empty(): ListingContact {
    return new ListingContact({
      name: null,
      email: null,
      phone: null,
      whatsapp: null,
    });
  }

  get name(): string | null {
    return this._name;
  }

  get email(): string | null {
    return this._email;
  }

  /** Telefone somente com dígitos (ex: "11999887766") */
  get phone(): string | null {
    return this._phone;
  }

  /** WhatsApp somente com dígitos (ex: "11999887766") */
  get whatsapp(): string | null {
    return this._whatsapp;
  }

  /** Telefone formatado: "(11) 99988-7766" ou "(11) 9988-7766" */
  get phoneFormatted(): string | null {
    return this._phone ? ListingContact.formatBRPhone(this._phone) : null;
  }

  /** WhatsApp formatado: "(11) 99988-7766" */
  get whatsappFormatted(): string | null {
    return this._whatsapp ? ListingContact.formatBRPhone(this._whatsapp) : null;
  }

  /** Retorna true se pelo menos um campo de contato está preenchido */
  get hasAnyContact(): boolean {
    return !!(this._name || this._email || this._phone || this._whatsapp);
  }

  /** Converte para objeto simples para persistência */
  toObject(): Required<ListingContactProps> {
    return {
      name: this._name,
      email: this._email,
      phone: this._phone,
      whatsapp: this._whatsapp,
    };
  }

  /** Verifica igualdade completa dos dados de contato */
  equals(other: ListingContact): boolean {
    return (
      this._name === other._name &&
      this._email === other._email &&
      this._phone === other._phone &&
      this._whatsapp === other._whatsapp
    );
  }

  toString(): string {
    const parts: string[] = [];
    if (this._name) parts.push(this._name);
    if (this._email) parts.push(this._email);
    if (this._phone) parts.push(this.phoneFormatted!);
    return parts.join(' | ') || '(sem contato)';
  }

  /** Formata número brasileiro: 10 dígitos → (XX) XXXX-XXXX, 11 → (XX) XXXXX-XXXX */
  private static formatBRPhone(digits: string): string {
    if (digits.length === 11) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
}
