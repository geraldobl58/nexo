import { ListingContact } from './marketing-contact.vo';

describe('ListingContact', () => {
  // ── create() com campos válidos ────────────────────────────────────────────

  describe('create()', () => {
    it('deve criar um contato vazio quando nenhum campo é fornecido', () => {
      const contact = ListingContact.create();
      expect(contact.name).toBeNull();
      expect(contact.email).toBeNull();
      expect(contact.phone).toBeNull();
      expect(contact.whatsapp).toBeNull();
    });

    it('deve criar um contato completo com todos os campos válidos', () => {
      const contact = ListingContact.create({
        name: 'João Silva',
        email: 'joao@example.com',
        phone: '11988776655',
        whatsapp: '11988776655',
      });
      expect(contact.name).toBe('João Silva');
      expect(contact.email).toBe('joao@example.com');
      expect(contact.phone).toBe('11988776655');
    });

    it('deve normalizar o email para letras minúsculas', () => {
      const contact = ListingContact.create({ email: 'JOAO@EXAMPLE.COM' });
      expect(contact.email).toBe('joao@example.com');
    });

    it('deve normalizar o telefone removendo formatação', () => {
      const contact = ListingContact.create({ phone: '(11) 98877-6655' });
      expect(contact.phone).toBe('11988776655');
    });

    it('deve normalizar o whatsapp removendo formatação (sem código de país)', () => {
      const contact = ListingContact.create({ whatsapp: '(11) 98877-6655' });
      expect(contact.whatsapp).toBe('11988776655');
    });

    // ── validações de email ─────────────────────────────────────────────────

    it('deve lançar erro para email sem @', () => {
      expect(() => ListingContact.create({ email: 'invalido.com' })).toThrow(
        'E-mail de contato inválido',
      );
    });

    it('deve lançar erro para email sem domínio', () => {
      expect(() => ListingContact.create({ email: 'joao@' })).toThrow(
        'E-mail de contato inválido',
      );
    });

    // ── validações de telefone ──────────────────────────────────────────────

    it('deve lançar erro para telefone com menos de 10 dígitos', () => {
      expect(
        () => ListingContact.create({ phone: '119887766' }), // 9 dígitos
      ).toThrow('Telefone de contato inválido');
    });

    it('deve lançar erro para telefone com mais de 11 dígitos', () => {
      expect(
        () => ListingContact.create({ phone: '119887766550' }), // 12 dígitos
      ).toThrow('Telefone de contato inválido');
    });

    it('deve lançar erro para whatsapp inválido', () => {
      expect(() => ListingContact.create({ whatsapp: '123' })).toThrow(
        'WhatsApp de contato inválido',
      );
    });
  });

  // ── empty() ───────────────────────────────────────────────────────────────

  describe('empty()', () => {
    it('deve criar instância com todos os campos nulos', () => {
      const contact = ListingContact.empty();
      expect(contact.hasAnyContact).toBe(false);
    });
  });

  // ── hasAnyContact ──────────────────────────────────────────────────────────

  describe('hasAnyContact', () => {
    it('deve retornar false quando não há nenhum dado de contato', () => {
      expect(ListingContact.create().hasAnyContact).toBe(false);
    });

    it('deve retornar true quando ao menos um campo está preenchido', () => {
      expect(ListingContact.create({ name: 'Maria' }).hasAnyContact).toBe(true);
      expect(ListingContact.create({ email: 'a@b.com' }).hasAnyContact).toBe(
        true,
      );
      expect(
        ListingContact.create({ phone: '11988776655' }).hasAnyContact,
      ).toBe(true);
    });
  });

  // ── phoneFormatted ─────────────────────────────────────────────────────────

  describe('phoneFormatted', () => {
    it('deve formatar celular com 11 dígitos como (XX) XXXXX-XXXX', () => {
      const contact = ListingContact.create({ phone: '11988776655' });
      expect(contact.phoneFormatted).toBe('(11) 98877-6655');
    });

    it('deve formatar fixo com 10 dígitos como (XX) XXXX-XXXX', () => {
      const contact = ListingContact.create({ phone: '1133445566' });
      expect(contact.phoneFormatted).toBe('(11) 3344-5566');
    });

    it('deve retornar null quando telefone não está preenchido', () => {
      const contact = ListingContact.create({ name: 'Maria' });
      expect(contact.phoneFormatted).toBeNull();
    });
  });

  // ── equals() ──────────────────────────────────────────────────────────────

  describe('equals()', () => {
    const props = {
      name: 'João',
      email: 'joao@example.com',
      phone: '11988776655',
      whatsapp: '11988776655',
    };

    it('deve retornar true para contatos idênticos', () => {
      expect(
        ListingContact.create(props).equals(ListingContact.create(props)),
      ).toBe(true);
    });

    it('deve retornar false para contatos com email diferente', () => {
      const a = ListingContact.create(props);
      const b = ListingContact.create({ ...props, email: 'outro@example.com' });
      expect(a.equals(b)).toBe(false);
    });
  });

  // ── toString() ────────────────────────────────────────────────────────────

  describe('toString()', () => {
    it('deve retornar "(sem contato)" quando vazio', () => {
      expect(ListingContact.create().toString()).toBe('(sem contato)');
    });

    it('deve retornar os campos preenchidos separados por " | "', () => {
      const contact = ListingContact.create({
        name: 'João',
        email: 'joao@example.com',
        phone: '11988776655',
      });
      expect(contact.toString()).toBe(
        'João | joao@example.com | (11) 98877-6655',
      );
    });
  });
});
