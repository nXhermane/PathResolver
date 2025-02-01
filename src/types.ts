/**
 * Token représentant un segment du chemin analysé
 */
export interface Token {
    segment: string;
    type: "property" | "array" | "mapOrSet" | "function";
    arrayIndex?: number;
    mapOrSetKey?: string;
    functionArgs?: any[];
}

/**
 * Options de configuration pour PathResolver
 */
export interface PathResolverOptions {
    /** Active le cache pour les chemins tokenisés */
    useCache?: boolean;
    /** Taille maximum du cache (default: 1000) */
    maxCacheSize?: number;
}