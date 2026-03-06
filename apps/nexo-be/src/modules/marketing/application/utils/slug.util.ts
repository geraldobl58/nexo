/**
 * UTILITÁRIO DE GERAÇÃO DE SLUG
 *
 * O que é um slug?
 * É a versão "amigável para URL" de um texto.
 * Ex: "Apartamento 3 quartos no Centro, São Paulo"
 *     → "apartamento-3-quartos-no-centro-sao-paulo"
 *
 * Por que precisamos de slug único?
 * O slug é usado na URL do anúncio:
 *   https://nexo.com.br/imoveis/apartamento-3-quartos-centro-sp-a1b2c3
 *
 * Cada anúncio deve ter uma URL única → slug único.
 * Para garantir unicidade adicionamos um sufixo aleatório de 6 caracteres.
 */

/**
 * Converte um texto qualquer em slug URL-friendly.
 *
 * O que faz:
 * 1. Converte para minúsculas
 * 2. Remove acentuação (NFD + replace de combining marks)
 * 3. Substitui espaços e underscores por hífens
 * 4. Remove caracteres que não sejam letras, números ou hífens
 * 5. Remove hífens duplicados
 * 6. Remove hífens no início e no fim
 *
 * @param text - Texto original (ex: título do anúncio)
 * @returns Slug sem acentos, espaços ou caracteres especiais
 *
 * @example
 * toSlug('Apartamento 3 quartos - Centro, São Paulo')
 * // → 'apartamento-3-quartos-centro-sao-paulo'
 */
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD') // separa letras dos acentos: "ã" → "a" + "~"
    .replace(/[\u0300-\u036f]/g, '') // remove os acentos separados
    .replace(/[_\s]+/g, '-') // espaços/underscores → hífen
    .replace(/[^a-z0-9-]/g, '') // remove tudo que não é letra, número ou hífen
    .replace(/-{2,}/g, '-') // hífens duplos → único
    .replace(/^-|-$/g, ''); // remove hífen do início/fim
}

/**
 * Gera um sufixo aleatório para garantir unicidade do slug.
 * Usa apenas letras minúsculas e números (legível e URL-safe).
 *
 * @param length - Comprimento do sufixo (padrão: 6)
 * @returns String aleatória. Ex: 'a1b2c3'
 */
export function randomSuffix(length = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

/**
 * Gera um slug único para um anúncio imobiliário.
 *
 * Combina título + cidade + sufixo aleatório para criar uma URL descritiva
 * e que (com altíssima probabilidade) não colide com outros slugs.
 *
 * O chamador ainda deve verificar `slugExists()` no banco para 100% de garantia.
 * Em caso de colisão (raríssima), o use-case deve tentar gerar novo slug.
 *
 * @param title - Título do anúncio
 * @param city  - Cidade do imóvel
 * @returns Slug candidato. Ex: 'apartamento-3-quartos-centro-sp-a1b2c3'
 *
 * @example
 * generateListingSlug('Apartamento 3 quartos', 'São Paulo')
 * // → 'apartamento-3-quartos-sao-paulo-x7k2m9'
 */
export function generateListingSlug(title: string, city: string): string {
  const slugTitle = toSlug(title);
  const slugCity = toSlug(city);
  const suffix = randomSuffix(6);
  return `${slugTitle}-${slugCity}-${suffix}`;
}
