import { Utils } from "./Utils";
import { PathResolverOptions, Token } from "./types";

/**
 * Classe principale pour la résolution de chemins d'accès
 * avec optimisations de performance
 */
export class PathResolver {
  private context: any;
  private readonly options: Required<PathResolverOptions>;
  private tokenCache: Map<string, Token[]>;

  private static readonly DEFAULT_OPTIONS: Required<PathResolverOptions> = {
    useCache: true,
    maxCacheSize: 1000,
  };

  constructor(context: any, options?: PathResolverOptions) {
    this.context = context;
    this.options = { ...PathResolver.DEFAULT_OPTIONS, ...options };
    this.tokenCache = new Map();
  }

  /**
   * Convertit un chemin en tokens avec support de cache
   */
  private tokenise(path: string): Token[] {
    // Vérifie le cache d'abord si activé
    if (this.options.useCache) {
      const cached = this.tokenCache.get(path);
      if (cached) return cached;
    }

    const tokens = path.split(".").map((segment) => {
      if (Utils.isArraySegment(segment)) {
        return this.parseArrayOrMapAndSet(segment);
      } else if (Utils.isFunctionSegment(segment)) {
        return this.parseFunction(segment);
      } else if (Utils.isIdentifierSegment(segment))
        return { segment, type: "property" as const };
      else throw new Error("Invalid segment format");
    });

    // Mise en cache du résultat
    if (this.options.useCache) {
      if (this.tokenCache.size >= this.options.maxCacheSize) {
        // Supprime la première entrée si le cache est plein
        const firstKey = this.tokenCache.keys().next().value;
        this.tokenCache.delete(firstKey as string);
      }
      this.tokenCache.set(path, tokens);
    }

    return tokens;
  }

  /**
   * Résout un chemin d'accès de manière asynchrone
   * @param path - string
   * @example
   * ```ts
   * const path = "path.to.property"
   * const path = "path.to.array[0]"
   * const path = "path.to.mapOrset[key]" // for Map , resolver return a provide key value but for Set he check if the provid key exist on Set
   * const path = "path.to.function(77)"
   * ```
   */
  async resolve(path: string): Promise<any> {
    if (!path) throw new Error("Path cannot be empty");

    const tokens = this.tokenise(path);
    return this._resolve(tokens, this.context, 0);
  }

  /**
   * Résout un chemin d'accès de manière synchrone
   * @param  {string}
   * @example
   * ```ts
   * const path = "path.to.property"
   * const path = "path.to.array[0]"
   * const path = "path.to.mapOrset[key]" // for Map , resolver return a provide key value but for Set he check if the provid key exist on Set
   * const path = "path.to.function(77)"
   * ```
   * @throws {Error} Si le chemin contient des fonctions asynchrones ou si le chemin est invalide ou la valeur de retour est {undefined}
   */
  resolveSync(path: string): any {
    if (!path) throw new Error("Path cannot be empty");

    const tokens = this.tokenise(path);
    let result = this.context;

    for (const token of tokens) {
      if (!Utils.isObject(result)) {
        throw new Error(
          `Cannot access property "${token.segment}" of ${result}`
        );
      }

      switch (token.type) {
        case "array":
          if (!Utils.isArray(result[token.segment])) {
            throw new Error(`Property "${token.segment}" is not an array`);
          }
          result = result[token.segment][token.arrayIndex as number];
          if (result === undefined) throw new Error("Invalid Array Index");
          break;

        case "mapOrSet":
          const value = result[token.segment];
          if (!Utils.isMap(value) && !Utils.isSet(value)) {
            throw new Error(`Property "${token.segment}" is not a map or set`);
          }
          if (Utils.isMap(value)) result = value.get(token.mapOrSetKey);
          if (Utils.isSet(value)) result = value.has(token.mapOrSetKey);
          if (result === undefined) throw new Error("Invalid Map or Set key");
          break;

        case "function":
          const fn = result[token.segment];
          if (!Utils.isFunction(fn)) {
            throw new Error(`Property "${token.segment}" is not a function`);
          }
          if (Utils.isAsyncFunction(fn)) {
            throw new Error(
              `Cannot call async function "${token.segment}" in sync mode`
            );
          }
          result = fn.apply(result, token.functionArgs);
          if (result === undefined)
            throw new Error("Function return undefined value");
          break;

        default:
          result = result[token.segment];
      }
    }
    if (result === undefined) throw new Error("Invalid Path");
    return result;
  }

  /**
   * Résolution récursive interne avec optimisations
   */
  private async _resolve(
    tokens: Token[],
    context: any,
    index: number
  ): Promise<any> {
    if (index >= tokens.length) return context;
    if (!Utils.isObject(context)) {
      throw new Error("Cannot access properties of " + context);
    }

    const token = tokens[index];
    let value;

    switch (token.type) {
      case "array":
        const arr = context[token.segment];
        if (!Utils.isArray(arr)) {
          throw new Error(`Property "${token.segment}" is not an array`);
        }
        value = arr[token.arrayIndex as number];
        if (value === undefined) throw new Error("Invalid Array Index");
        break;

      case "mapOrSet":
        const collection = context[token.segment];
        if (!Utils.isMap(collection) && !Utils.isSet(collection)) {
          throw new Error(`Property "${token.segment}" is not a map or set`);
        }
        if (Utils.isMap(collection)) value = collection.get(token.mapOrSetKey);
        if (Utils.isSet(collection)) value = collection.has(token.mapOrSetKey);
        if (value === undefined) throw new Error("Invalid Map or Set key");
        break;

      case "function":
        const fn = context[token.segment];
        if (!Utils.isFunction(fn)) {
          throw new Error(`Property "${token.segment}" is not a function`);
        }
        value = Utils.isAsyncFunction(fn)
          ? await fn.apply(context, token.functionArgs)
          : fn.apply(context, token.functionArgs);
        if (value === undefined)
          throw new Error("Function return undefined value");
        break;

      default:
        value = context[token.segment];
    }

    return this._resolve(tokens, value, index + 1);
  }

  /**
   * Parse un segment de type tableau ou Map/Set
   */
  private parseArrayOrMapAndSet(segment: string): Token {
    const match = segment.match(Utils.ARRAY_REGEX);
    if (!match) throw new Error(`Invalid segment: ${segment}`);

    const [, name, key] = match;
    const isNumericKey = !isNaN(Number(key));

    return {
      segment: name,
      type: isNumericKey ? "array" : "mapOrSet",
      arrayIndex: isNumericKey ? Number(key) : undefined,
      mapOrSetKey: isNumericKey ? undefined : key,
    };
  }

  /**
   * Parse un segment de type fonction
   */
  private parseFunction(segment: string): Token {
    const match = segment.match(Utils.FUNCTION_REGEX);
    if (!match) throw new Error(`Invalid function segment: ${segment}`);

    const [, name, argsStr] = match;
    const functionArgs = argsStr
      ? argsStr.split(",").map((arg) => {
          const value = arg.trim();
          return !isNaN(Number(value)) ? Number(value) : value;
        })
      : [];

    return {
      segment: name,
      type: "function",
      functionArgs,
    };
  }

  /**
   * Vide le cache des tokens
   */
  clearCache(): void {
    this.tokenCache.clear();
  }
}
