/**
 * TESTES: ListingTitle Value Object
 *
 * Por que testar Value Objects?
 * VOs centralizam validação. Se quebrarmos as regras aqui,
 * anúncios inválidos chegam ao banco. Esses testes são a "grade de proteção".
 *
 * Padrão dos testes: AAA (Arrange → Act → Assert)
 *  - Arrange: monta os dados de entrada
 *  - Act:     executa o código que está sendo testado
 *  - Assert:  verifica o resultado esperado
 */
import { ListingTitle } from './listing-title.vo';

describe('ListingTitle', () => {
  // ─── Criação válida ────────────────────────────────────────────────────────

  describe('create() — casos válidos', () => {
    it('deve criar um ListingTitle com string válida', () => {
      // Arrange
      const raw = 'Apartamento 3 quartos em São Paulo';

      // Act
      const title = ListingTitle.create(raw);

      // Assert
      expect(title).toBeDefined();
      expect(title.value).toBe(raw);
    });

    it('deve fazer trim de espaços nas bordas', () => {
      const title = ListingTitle.create('  Apartamento com varanda  ');
      expect(title.value).toBe('Apartamento com varanda');
    });

    it('deve aceitar título com exatamente 10 caracteres', () => {
      // "1234567890" = 10 chars = MIN_LENGTH
      const title = ListingTitle.create('1234567890');
      expect(title.value).toBe('1234567890');
    });

    it('deve aceitar título com exatamente 150 caracteres', () => {
      const maxTitle = 'A'.repeat(ListingTitle.MAX_LENGTH);
      const title = ListingTitle.create(maxTitle);
      expect(title.value).toHaveLength(150);
    });
  });

  // ─── Criação inválida ──────────────────────────────────────────────────────

  describe('create() — casos inválidos (devem lançar Error)', () => {
    it('deve lançar erro quando título for muito curto (< 10 chars)', () => {
      expect(() => ListingTitle.create('Curto')).toThrow(
        `Título muito curto. Mínimo: ${ListingTitle.MIN_LENGTH} caracteres.`,
      );
    });

    it('deve lançar erro quando título tiver só espaços em branco', () => {
      // Depois do trim vira string vazia (0 chars < 10)
      expect(() => ListingTitle.create('          ')).toThrow(/curto/i);
    });

    it('deve lançar erro quando título for muito longo (> 150 chars)', () => {
      const longTitle = 'B'.repeat(ListingTitle.MAX_LENGTH + 1);
      expect(() => ListingTitle.create(longTitle)).toThrow(
        `Título muito longo. Máximo: ${ListingTitle.MAX_LENGTH} caracteres.`,
      );
    });

    it('deve lançar erro quando título for string vazia', () => {
      expect(() => ListingTitle.create('')).toThrow(/curto/i);
    });
  });

  // ─── equals() ──────────────────────────────────────────────────────────────

  describe('equals()', () => {
    it('deve retornar true quando dois títulos têm o mesmo valor', () => {
      const a = ListingTitle.create('Casa com piscina em Campinas');
      const b = ListingTitle.create('Casa com piscina em Campinas');
      expect(a.equals(b)).toBe(true);
    });

    it('deve retornar false quando os títulos são diferentes', () => {
      const a = ListingTitle.create('Casa com piscina em Campinas');
      const b = ListingTitle.create('Apartamento studio em Curitiba');
      expect(a.equals(b)).toBe(false);
    });
  });

  // ─── toString() ────────────────────────────────────────────────────────────

  describe('toString()', () => {
    it('deve retornar o valor string', () => {
      const raw = 'Loft moderno em Belo Horizonte';
      const title = ListingTitle.create(raw);
      expect(title.toString()).toBe(raw);
    });
  });

  // ─── Constantes estáticas ──────────────────────────────────────────────────

  describe('constantes', () => {
    it('MIN_LENGTH deve ser 10', () => {
      expect(ListingTitle.MIN_LENGTH).toBe(10);
    });

    it('MAX_LENGTH deve ser 150', () => {
      expect(ListingTitle.MAX_LENGTH).toBe(150);
    });
  });
});
