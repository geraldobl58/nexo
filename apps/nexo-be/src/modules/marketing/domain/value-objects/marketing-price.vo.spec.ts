import { ListingPrice } from './marketing-price.vo';

describe('ListingPrice', () => {
  // ── create() ───────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('deve criar um ListingPrice válido a partir de centavos positivos', () => {
      const price = ListingPrice.create(120000000); // R$ 1.200.000,00
      expect(price.value).toBe(120000000);
    });

    it('deve aceitar o valor mínimo (1 centavo)', () => {
      const price = ListingPrice.create(1);
      expect(price.value).toBe(1);
    });

    it('deve lançar erro se o valor for zero', () => {
      expect(() => ListingPrice.create(0)).toThrow(
        'O preço deve ser maior que zero',
      );
    });

    it('deve lançar erro se o valor for negativo', () => {
      expect(() => ListingPrice.create(-100)).toThrow(
        'O preço deve ser maior que zero',
      );
    });

    it('deve lançar erro se o valor não for inteiro', () => {
      expect(() => ListingPrice.create(350.5)).toThrow(
        'O preço deve ser um número inteiro em centavos',
      );
    });

    it('deve lançar erro se o valor não for seguro (overflow)', () => {
      expect(() => ListingPrice.create(Number.MAX_SAFE_INTEGER + 1)).toThrow(
        'muito alto',
      );
    });
  });

  // ── toReais() ──────────────────────────────────────────────────────────────

  describe('toReais()', () => {
    it('deve converter centavos para reais', () => {
      expect(ListingPrice.create(35000000).toReais()).toBe(350000);
      expect(ListingPrice.create(100).toReais()).toBe(1);
      expect(ListingPrice.create(1).toReais()).toBeCloseTo(0.01);
    });
  });

  // ── format() ──────────────────────────────────────────────────────────────

  describe('format()', () => {
    it('deve formatar como moeda brasileira', () => {
      const price = ListingPrice.create(120000000);
      // "R$ 1.200.000,00" (a formatação exata depende do locale do Node)
      expect(price.format()).toMatch(/1\.200\.000/);
      expect(price.format()).toMatch(/R\$/);
    });
  });

  // ── equals() ──────────────────────────────────────────────────────────────

  describe('equals()', () => {
    it('deve retornar true para preços iguais', () => {
      const a = ListingPrice.create(50000000);
      const b = ListingPrice.create(50000000);
      expect(a.equals(b)).toBe(true);
    });

    it('deve retornar false para preços diferentes', () => {
      const a = ListingPrice.create(50000000);
      const b = ListingPrice.create(60000000);
      expect(a.equals(b)).toBe(false);
    });
  });

  // ── toString() ────────────────────────────────────────────────────────────

  describe('toString()', () => {
    it('deve retornar o preço formatado', () => {
      const price = ListingPrice.create(35000000);
      expect(price.toString()).toMatch(/350\.000/);
    });
  });
});
