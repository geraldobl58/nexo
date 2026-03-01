/**
 * VALUE OBJECT: COORDENADAS GEOGRÁFICAS
 *
 * Encapsula um par (latitude, longitude) com validação de intervalos.
 *
 * Regras do sistema geodésico WGS-84 (padrão do GPS e Google Maps):
 *  - Latitude:  de -90  a  90  (sul ↔ norte)
 *  - Longitude: de -180 a 180  (oeste ↔ leste)
 *
 * Brasil:
 *  - Latitude:  aprox. -33.75 (RS) a 5.27 (RR)
 *  - Longitude: aprox. -73.99 (AC) a -34.79 (PB)
 *
 * Exemplo de uso:
 *   const coords = GeoCoordinates.create(-22.9068, -43.1729); // Rio de Janeiro
 *   console.log(coords.latitude);  // -22.9068
 *   console.log(coords.toTuple()); // [-22.9068, -43.1729]
 */
export class GeoCoordinates {
  private readonly _latitude: number;
  private readonly _longitude: number;

  private constructor(latitude: number, longitude: number) {
    this._latitude = latitude;
    this._longitude = longitude;
  }

  /**
   * Fábrica estática. Valida os intervalos antes de criar o objeto.
   *
   * @param latitude  - Entre -90 e 90
   * @param longitude - Entre -180 e 180
   * @throws Error se qualquer valor estiver fora do intervalo válido
   */
  static create(latitude: number, longitude: number): GeoCoordinates {
    if (typeof latitude !== 'number' || isNaN(latitude)) {
      throw new Error('A latitude deve ser um número.');
    }
    if (typeof longitude !== 'number' || isNaN(longitude)) {
      throw new Error('A longitude deve ser um número.');
    }

    if (latitude < -90 || latitude > 90) {
      throw new Error(
        `Latitude inválida: ${latitude}. Deve estar entre -90 e 90.`,
      );
    }

    if (longitude < -180 || longitude > 180) {
      throw new Error(
        `Longitude inválida: ${longitude}. Deve estar entre -180 e 180.`,
      );
    }

    return new GeoCoordinates(latitude, longitude);
  }

  /** Latitude em graus decimais (positivo = norte, negativo = sul) */
  get latitude(): number {
    return this._latitude;
  }

  /** Longitude em graus decimais (positivo = leste, negativo = oeste) */
  get longitude(): number {
    return this._longitude;
  }

  /**
   * Retorna o par como tupla [lat, lng].
   * Útil para integrações com Google Maps, Mapbox, etc.
   */
  toTuple(): [number, number] {
    return [this._latitude, this._longitude];
  }

  /**
   * Retorna como objeto simples para serialização JSON.
   */
  toObject(): { latitude: number; longitude: number } {
    return { latitude: this._latitude, longitude: this._longitude };
  }

  /** Verifica igualdade de valor com outras coordenadas */
  equals(other: GeoCoordinates): boolean {
    return (
      this._latitude === other._latitude && this._longitude === other._longitude
    );
  }

  toString(): string {
    return `(${this._latitude}, ${this._longitude})`;
  }
}
