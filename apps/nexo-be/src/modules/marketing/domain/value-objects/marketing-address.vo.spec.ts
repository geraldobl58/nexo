import { ListingAddress } from './marketing-address.vo';

describe('ListingAddress', () => {
  const validProps = {
    city: 'Rio de Janeiro',
    state: 'RJ',
    district: 'Leblon',
    street: 'Rua das Flores',
    streetNumber: '123',
    complement: 'Apto 42',
    zipcode: '22430-060',
  };

  // ── create() ───────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('deve criar um endereço válido com todos os campos', () => {
      const address = ListingAddress.create(validProps);
      expect(address.city).toBe('Rio de Janeiro');
      expect(address.state).toBe('RJ');
      expect(address.district).toBe('Leblon');
      expect(address.street).toBe('Rua das Flores');
      expect(address.streetNumber).toBe('123');
      expect(address.complement).toBe('Apto 42');
    });

    it('deve criar um endereço válido apenas com campos obrigatórios', () => {
      const address = ListingAddress.create({
        city: 'São Paulo',
        state: 'SP',
        district: 'Jardins',
      });
      expect(address.city).toBe('São Paulo');
      expect(address.street).toBeNull();
      expect(address.zipcode).toBeNull();
    });

    it('deve normalizar a UF para maiúsculas', () => {
      const address = ListingAddress.create({ ...validProps, state: 'rj' });
      expect(address.state).toBe('RJ');
    });

    it('deve aceitar todas as 27 UFs brasileiras', () => {
      const ufs = [
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
      ];
      ufs.forEach((uf) => {
        expect(() =>
          ListingAddress.create({
            city: 'Fortaleza',
            state: uf,
            district: 'Centro',
          }),
        ).not.toThrow();
      });
    });

    it('deve aceitar CEP sem hífen', () => {
      const address = ListingAddress.create({
        ...validProps,
        zipcode: '22430060',
      });
      expect(address.zipcode).toBe('22430060');
    });

    it('deve lançar erro para cidade vazia', () => {
      expect(() => ListingAddress.create({ ...validProps, city: '' })).toThrow(
        'Cidade inválida',
      );
    });

    it('deve lançar erro para UF inválida', () => {
      expect(() =>
        ListingAddress.create({ ...validProps, state: 'XX' }),
      ).toThrow('UF inválida');
    });

    it('deve lançar erro para bairro vazio', () => {
      expect(() =>
        ListingAddress.create({ ...validProps, district: '' }),
      ).toThrow('Bairro inválido');
    });

    it('deve lançar erro para CEP com formato inválido', () => {
      expect(() =>
        ListingAddress.create({ ...validProps, zipcode: '1234' }),
      ).toThrow('CEP inválido');
    });

    it('deve lançar erro para CEP com letras', () => {
      expect(() =>
        ListingAddress.create({ ...validProps, zipcode: 'ABCDE-123' }),
      ).toThrow('CEP inválido');
    });
  });

  // ── zipcode (normalizado) ──────────────────────────────────────────────────

  describe('zipcode', () => {
    it('deve retornar CEP sem hífen', () => {
      const address = ListingAddress.create({
        ...validProps,
        zipcode: '22430-060',
      });
      expect(address.zipcode).toBe('22430060');
    });

    it('deve retornar zipcodeFormatted com hífen', () => {
      const address = ListingAddress.create({
        ...validProps,
        zipcode: '22430060',
      });
      expect(address.zipcodeFormatted).toBe('22430-060');
    });

    it('deve retornar null quando CEP não for informado', () => {
      const address = ListingAddress.create({
        city: 'São Paulo',
        state: 'SP',
        district: 'Jardins',
      });
      expect(address.zipcode).toBeNull();
      expect(address.zipcodeFormatted).toBeNull();
    });
  });

  // ── toFullAddress() ────────────────────────────────────────────────────────

  describe('toFullAddress()', () => {
    it('deve montar o endereço completo corretamente', () => {
      const address = ListingAddress.create(validProps);
      expect(address.toFullAddress()).toBe(
        'Rua das Flores, 123 - Apto 42 - Leblon, Rio de Janeiro - RJ',
      );
    });

    it('deve omitir campos nulos no endereço completo', () => {
      const address = ListingAddress.create({
        city: 'Curitiba',
        state: 'PR',
        district: 'Batel',
      });
      expect(address.toFullAddress()).toBe('Batel, Curitiba - PR');
    });
  });

  // ── toShortAddress() ───────────────────────────────────────────────────────

  describe('toShortAddress()', () => {
    it('deve retornar "Bairro, Cidade - UF"', () => {
      const address = ListingAddress.create(validProps);
      expect(address.toShortAddress()).toBe('Leblon, Rio de Janeiro - RJ');
    });
  });

  // ── equals() ──────────────────────────────────────────────────────────────

  describe('equals()', () => {
    it('deve retornar true para endereços idênticos', () => {
      const a = ListingAddress.create(validProps);
      const b = ListingAddress.create(validProps);
      expect(a.equals(b)).toBe(true);
    });

    it('deve retornar false para endereços com cidade diferente', () => {
      const a = ListingAddress.create(validProps);
      const b = ListingAddress.create({ ...validProps, city: 'Niterói' });
      expect(a.equals(b)).toBe(false);
    });
  });

  // ── toObject() ─────────────────────────────────────────────────────────────

  describe('toObject()', () => {
    it('deve retornar objeto com todos os campos para persistência', () => {
      const address = ListingAddress.create(validProps);
      const obj = address.toObject();
      expect(obj.city).toBe('Rio de Janeiro');
      expect(obj.state).toBe('RJ');
      expect(obj.zipcode).toBe('22430060'); // sem hífen
    });
  });
});
