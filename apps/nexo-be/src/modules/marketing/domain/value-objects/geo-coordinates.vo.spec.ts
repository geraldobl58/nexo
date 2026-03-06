import { GeoCoordinates } from './geo-coordinates.vo';

describe('GeoCoordinates', () => {
  // ── create() ───────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('deve criar coordenadas válidas para o Rio de Janeiro', () => {
      const coords = GeoCoordinates.create(-22.9068, -43.1729);
      expect(coords.latitude).toBe(-22.9068);
      expect(coords.longitude).toBe(-43.1729);
    });

    it('deve aceitar os extremos exatos de latitude (-90 e 90)', () => {
      expect(() => GeoCoordinates.create(-90, 0)).not.toThrow();
      expect(() => GeoCoordinates.create(90, 0)).not.toThrow();
    });

    it('deve aceitar os extremos exatos de longitude (-180 e 180)', () => {
      expect(() => GeoCoordinates.create(0, -180)).not.toThrow();
      expect(() => GeoCoordinates.create(0, 180)).not.toThrow();
    });

    it('deve aceitar coordenadas zero (equador / meridiano de Greenwich)', () => {
      const coords = GeoCoordinates.create(0, 0);
      expect(coords.latitude).toBe(0);
      expect(coords.longitude).toBe(0);
    });

    it('deve lançar erro se latitude for menor que -90', () => {
      expect(() => GeoCoordinates.create(-90.1, 0)).toThrow(
        'Latitude inválida',
      );
    });

    it('deve lançar erro se latitude for maior que 90', () => {
      expect(() => GeoCoordinates.create(91, 0)).toThrow('Latitude inválida');
    });

    it('deve lançar erro se longitude for menor que -180', () => {
      expect(() => GeoCoordinates.create(0, -180.1)).toThrow(
        'Longitude inválida',
      );
    });

    it('deve lançar erro se longitude for maior que 180', () => {
      expect(() => GeoCoordinates.create(0, 181)).toThrow('Longitude inválida');
    });

    it('deve lançar erro se a latitude for NaN', () => {
      expect(() => GeoCoordinates.create(NaN, 0)).toThrow(
        'latitude deve ser um número',
      );
    });

    it('deve lançar erro se a longitude for NaN', () => {
      expect(() => GeoCoordinates.create(0, NaN)).toThrow(
        'longitude deve ser um número',
      );
    });
  });

  // ── toTuple() ──────────────────────────────────────────────────────────────

  describe('toTuple()', () => {
    it('deve retornar [latitude, longitude] como tupla', () => {
      const coords = GeoCoordinates.create(-23.5505, -46.6333); // São Paulo
      expect(coords.toTuple()).toEqual([-23.5505, -46.6333]);
    });
  });

  // ── toObject() ─────────────────────────────────────────────────────────────

  describe('toObject()', () => {
    it('deve retornar objeto com latitude e longitude', () => {
      const coords = GeoCoordinates.create(-15.7801, -47.9292); // Brasília
      expect(coords.toObject()).toEqual({
        latitude: -15.7801,
        longitude: -47.9292,
      });
    });
  });

  // ── equals() ──────────────────────────────────────────────────────────────

  describe('equals()', () => {
    it('deve retornar true para coordenadas idênticas', () => {
      const a = GeoCoordinates.create(-22.9068, -43.1729);
      const b = GeoCoordinates.create(-22.9068, -43.1729);
      expect(a.equals(b)).toBe(true);
    });

    it('deve retornar false se a latitude diferir', () => {
      const a = GeoCoordinates.create(-22.9068, -43.1729);
      const b = GeoCoordinates.create(-23.0, -43.1729);
      expect(a.equals(b)).toBe(false);
    });

    it('deve retornar false se a longitude diferir', () => {
      const a = GeoCoordinates.create(-22.9068, -43.1729);
      const b = GeoCoordinates.create(-22.9068, -44.0);
      expect(a.equals(b)).toBe(false);
    });
  });

  // ── toString() ─────────────────────────────────────────────────────────────

  describe('toString()', () => {
    it('deve retornar string no formato (lat, lng)', () => {
      const coords = GeoCoordinates.create(-22.9068, -43.1729);
      expect(coords.toString()).toBe('(-22.9068, -43.1729)');
    });
  });
});
