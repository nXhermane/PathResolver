import { PathResolver } from "../src/PathResolver";

describe("PathResolver", () => {
  const testContext = {
    user: {
      id: 123,
      profile: {
        firstName: "John",
        lastName: "Doe",
        age: 30,
        address: {
          street: "123 Main St",
          city: "Boston",
        },
        scores: [85, 90, 95],
        metadata: new Map([
          ["role", "admin"],
          ["status", "active"],
        ]),
        permissions: new Set(["read", "write"]),
        getFullName() {
          return `${this.firstName} ${this.lastName}`;
        },
        async getAgeInDays() {
          return this.age * 365;
        },
        calculateScore(bonus: number) {
          return this.scores.reduce((a, b) => a + b, 0) + bonus;
        },
      },
    },
    company: {
      departments: [
        { name: "IT", employees: 50 },
        { name: "HR", employees: 20 },
        { name: "Sales", employees: 30 },
      ],
    },
  };

  let resolver: PathResolver;

  beforeEach(() => {
    resolver = new PathResolver(testContext);
  });

  describe("Propriétés simples", () => {
    test("devrait résoudre une propriété simple", async () => {
      expect(resolver.resolveSync("user.id")).toBe(123);
      expect(await resolver.resolve("user.id")).toBe(123);
    });

    test("devrait résoudre des propriétés imbriquées", async () => {
      expect(resolver.resolveSync("user.profile.age")).toBe(30);
      expect(await resolver.resolve("user.profile.age")).toBe(30);
      expect(resolver.resolveSync("user.profile.address.city")).toBe("Boston");
      expect(await resolver.resolve("user.profile.address.city")).toBe(
        "Boston"
      );
    });

    test("devrait lever une erreur pour un chemin invalide", async () => {
      expect(() => resolver.resolveSync("user.invalid")).toThrow();
      expect(() => resolver.resolveSync("invalid.path")).toThrow();
      expect(await resolver.resolve("user.invalid")).toBeUndefined();
    });
  });

  describe("Tableaux", () => {
    test("devrait accéder aux éléments du tableau par index", async () => {
      expect(resolver.resolveSync("user.profile.scores[0]")).toBe(85);
      expect(await resolver.resolve("user.profile.scores[0]")).toBe(85);
      expect(resolver.resolveSync("company.departments[1].name")).toBe("HR");
    });

    test("devrait retourner undefined pour un index invalide", async () => {
      expect(() => resolver.resolveSync("user.profile.scores[999]")).toThrow(
        "Invalid Array Index"
      );
      await expect(
        resolver.resolve("user.profile.scores[999]")
      ).rejects.toThrow("Invalid Array Index");
    });

    test("devrait lever une erreur si la propriété n'est pas un tableau", async () => {
      expect(() => resolver.resolveSync("user.id[0]")).toThrow();
      await expect(resolver.resolve("user.id[0]")).rejects.toThrow();
    });
  });

  describe("Map et Set", () => {
    test("devrait accéder aux valeurs Map par clé", () => {
      expect(resolver.resolveSync("user.profile.metadata[role]")).toBe("admin");
      expect(resolver.resolveSync("user.profile.metadata[status]")).toBe(
        "active"
      );
    });

    test("devrait vérifier l'existence dans un Set", () => {
      expect(resolver.resolveSync("user.profile.permissions[read]")).toBe(true);
      expect(resolver.resolveSync("user.profile.permissions[admin]")).toBe(
        false
      );
    });

    test("devrait lever une erreur si la propriété n'est pas une Map ou un Set", () => {
      expect(() => resolver.resolveSync("user.id[key]")).toThrow();
    });
  });

  describe("Fonctions", () => {
    test("devrait appeler des fonctions synchrones sans arguments", () => {
      expect(resolver.resolveSync("user.profile.getFullName()")).toBe(
        "John Doe"
      );
    });

    test("devrait appeler des fonctions synchrones avec arguments", () => {
      expect(resolver.resolveSync("user.profile.calculateScore(10)")).toBe(280);
    });

    test("devrait appeler des fonctions asynchrones", async () => {
      expect(await resolver.resolve("user.profile.getAgeInDays()")).toBe(10950);
    });

    test("devrait lever une erreur pour les fonctions asynchrones en mode sync", () => {
      expect(() =>
        resolver.resolveSync("user.profile.getAgeInDays()")
      ).toThrow();
    });

    test("devrait lever une erreur si la propriété n'est pas une fonction", () => {
      expect(() => resolver.resolveSync("user.id()")).toThrow();
    });
  });

  describe("Cache", () => {
    test("devrait utiliser le cache pour les chemins déjà résolus", () => {
      const resolverWithCache = new PathResolver(testContext, {
        useCache: true,
      });

      // Premier appel (sans cache)
      const start1 = performance.now();
      resolverWithCache.resolveSync("user.profile.address.city");
      const time1 = performance.now() - start1;

      // Deuxième appel (avec cache)
      const start2 = performance.now();
      resolverWithCache.resolveSync("user.profile.address.city");
      const time2 = performance.now() - start2;

      expect(time2).toBeLessThan(time1);
    });

    test("devrait respecter la taille maximale du cache", () => {
      const resolverWithSmallCache = new PathResolver(testContext, {
        useCache: true,
        maxCacheSize: 2,
      });

      // Remplir le cache
      resolverWithSmallCache.resolveSync("user.id");
      resolverWithSmallCache.resolveSync("user.profile.age");
      resolverWithSmallCache.resolveSync("user.profile.address.city");

      // Vérifier que la première entrée a été supprimée
      const privateCache = (resolverWithSmallCache as any).tokenCache;
      expect(privateCache.has("user.id")).toBe(false);
      expect(privateCache.has("user.profile.age")).toBe(true);
      expect(privateCache.has("user.profile.address.city")).toBe(true);
    });

    test("devrait pouvoir vider le cache", () => {
      const resolverWithCache = new PathResolver(testContext, {
        useCache: true,
      });

      resolverWithCache.resolveSync("user.id");
      resolverWithCache.clearCache();

      const privateCache = (resolverWithCache as any).tokenCache;
      expect(privateCache.size).toBe(0);
    });
  });

  describe("Gestion des erreurs", () => {
    test("devrait lever une erreur pour un chemin vide", () => {
      expect(() => resolver.resolveSync("")).toThrow();
    });

    test("devrait lever une erreur pour un chemin mal formaté", () => {
      expect(() => resolver.resolveSync("user..profile")).toThrow();
      expect(() => resolver.resolveSync("user.profile.[0]")).toThrow();
      expect(() =>
        resolver.resolveSync("user.profile.getFullName(,)")
      ).toThrow();
    });

    // test('devrait lever une erreur pour des arguments de fonction invalides', () => {
    //     expect(() => resolver.resolveSync('user.profile.calculateScore(invalid)')).toThrow();
    // });
  });
});
