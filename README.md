
# smart-path-resolver

A lightweight and efficient library for resolving object paths dynamically in JavaScript and TypeScript. It supports property access, array indexing, Map/Set key lookups, and function invocation.
[![npm version](https://badge.fury.io/js/smart-path-resolver.svg)](https://badge.fury.io/js/smart-path-resolver)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
## Features

- 🚀 **Fast and optimized**: Uses caching and efficient type checks.
- 🎨 **Supports complex paths**: Navigate through properties, arrays, Maps, Sets, and function calls.
- 🔄 **Synchronous and asynchronous resolution**: Works in both blocking and non-blocking contexts.
- ⚛️ **Minimal and dependency-free**: No external dependencies, lightweight implementation.

## Installation

```sh
npm install smart-path-resolver
#or 
yarn add smart-path-resolver
```
## Usage

### Basic Property Resolution
```ts
import { PathResolver } from "smart-path-resolver";

const obj = { user: { name: "John", age: 30 } };
const resolver = new PathResolver(obj);

console.log(resolver.resolveSync("user.name")); // "John"
console.log(resolver.resolveSync("user.age"));  // 30
```

### Array Access
```ts
const data = { items: [{ id: 1 }, { id: 2 }] };
const resolver = new PathResolver(data);

console.log(resolver.resolveSync("items[1].id")); // 2
```
### Map and Set Access
```ts
const mapData = { users: new Map([["john", { age: 25 }]]) };
const resolver = new PathResolver(mapData);

console.log(resolver.resolveSync("users[john].age")); // 25
```
### Function Invocation
```ts
const obj = {
    getMessage: () => "Hello, World!",
    math: { add: (a: number, b: number) => a + b }
};
const resolver = new PathResolver(obj);

console.log(resolver.resolveSync("getMessage()"));      // "Hello, World!"
console.log(resolver.resolveSync("math.add(2,3)"));     // 5
```
### Asynchronous Resolution
```ts
const asyncData = {
    fetchData: async () => "Fetched Data"
};
const resolver = new PathResolver(asyncData);

resolver.resolve("fetchData()").then(console.log); // "Fetched Data"
```
## API
```ts
new PathResolver(context: any, options?: PathResolverOptions)
```
#### Creates an instance of PathResolver.

- context: The object to resolve paths from.

- options (optional):
  - useCache (boolean, default true): Enables token caching.
  - maxCacheSize (number, default 1000): Limits the cache size.
```ts
.resolve(path: string): Promise<any>
```
#### Resolves a path asynchronously.
```ts
.resolveSync(path: string): any
```
#### Resolves a path synchronously. Throws an error if an async function is encountered.
```ts
.clearCache()
```
#### Clears the token cache.

## Performance

- Optimized with caching to improve repeated path resolution.

- Uses precompiled regular expressions for parsing function calls and array indices.


## License

MIT License