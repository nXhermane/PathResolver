/**
 * Classe utilitaire avec méthodes optimisées pour la vérification des types
 */
export class Utils {
  // Cache des regex compilés pour de meilleures performances
  public static readonly FUNCTION_REGEX = /([\w]+)\((([\w]+)(,[\w]+)*)?\)/;
  public static readonly ARRAY_REGEX = /([\w]+)\[(\w+)\]/;
  public static readonly IDENTIFIER_REGEX = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/
  /**
   * Vérifie si une fonction est asynchrone
   * @param fn : Function a verifier
   * @returns boolean
   */
  static isAsyncFunction(fn: Function): boolean {
    return fn.constructor.name === "AsyncFunction";
  }

  /**
   * Vérifie si un segment représente un appel de fonction
   * @param segment - segment a verifier String
   * @returns boolean
   */
  static isFunctionSegment(segment: string): boolean {
    return Utils.FUNCTION_REGEX.test(segment);
  }

  /**
   * Vérifie si un segment représente un accès à un tableau
   * @param segment - segment a verifier String
   * @returns boolean
   */
  static isArraySegment(segment: string): boolean {
    return Utils.ARRAY_REGEX.test(segment);
  }
  /**
   * Verifie si un segment est un identifier (lvalue)
   * @param segment - segment a verifier String
   * @returns boolean
   */
  static isIdentifierSegment(segment: string): boolean {
    return Utils.IDENTIFIER_REGEX.test(segment);
  }

  /**
   * Vérifications de type optimisées utilisant instanceof
   * @param value  : any
   * @returns boolean
   */
  static isObject(value: any): boolean {
    return value !== null && typeof value === "object";
  }

  static isFunction(value: any): boolean {
    return typeof value === "function";
  }

  static isArray(value: any): boolean {
    return Array.isArray(value);
  }

  static isMap(value: any): boolean {
    return value instanceof Map;
  }

  static isSet(value: any): boolean {
    return value instanceof Set;
  }
}
