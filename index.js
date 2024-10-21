(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["pathresolver"] = factory();
	else
		root["pathresolver"] = factory();
})(this, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./index.ts":
/*!******************!*\
  !*** ./index.ts ***!
  \******************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(/*! ./src/PathResolver */ "./src/PathResolver.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/Utils */ "./src/Utils.ts"), exports);


/***/ }),

/***/ "./src/PathResolver.ts":
/*!*****************************!*\
  !*** ./src/PathResolver.ts ***!
  \*****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


/**
 * Path Exemple
 * ----------
1 -  patient.age.cm
2 - patient.medicalCondition[1]
3 - patient.medicalCondition[mapOrSetKey]
4 - patient.getAgeMonth()
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PathResolver = void 0;
const Utils_1 = __webpack_require__(/*! ./Utils */ "./src/Utils.ts");
class PathResolver {
    constructor(context) {
        this.context = context;
    }
    tokenise(path) {
        const tokens = this.splitPathToSegment(path);
        const tokensWithInfo = [];
        for (let i = 0; i < tokens.length; i++) {
            const segment = tokens[i];
            if (Utils_1.Utils.isArraySegment(segment)) {
                const token = this.parseArrayOrMapAndSet(segment);
                tokensWithInfo.push(token);
            }
            else if (Utils_1.Utils.isFunctionSegment(segment)) {
                const token = this.parseFunction(segment);
                tokensWithInfo.push(token);
            }
            else {
                const token = { segment, type: "property" };
                tokensWithInfo.push(token);
            }
        }
        return tokensWithInfo;
    }
    splitPathToSegment(path) {
        return path.split(".");
    }
    resolve(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokens = this.tokenise(path);
            let counter = 0;
            const value = yield this._resolve(tokens, this.context, counter);
            return value;
        });
    }
    _resolve(tokens, context, counter) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = tokens[counter];
            if (!token)
                return context;
            if (!context || !context.hasOwnProperty(token.segment)) {
                throw new Error(`Invalid property or path: ${token.segment}`);
            }
            if (token.type === "array") {
                const contextValue = context[token.segment];
                if (!Utils_1.Utils.isArray(contextValue)) {
                    throw new Error(`Property "${token.segment}" is not an array.`);
                }
                const value = contextValue[token === null || token === void 0 ? void 0 : token.arrayIndex];
                return this._resolve(tokens, value, counter + 1);
            }
            else if (token.type === "mapOrSet") {
                const contextValue = context[token.segment];
                if (!Utils_1.Utils.isMap(contextValue) && !Utils_1.Utils.isSet(contextValue)) {
                    throw new Error(`Property "${token.segment}" is not a map or set.`);
                }
                const value = contextValue.get(token === null || token === void 0 ? void 0 : token.mapOrSetKey);
                return this._resolve(tokens, value, counter + 1);
            }
            else if (token.type === "function") {
                const contextValue = context[token.segment];
                if (!Utils_1.Utils.isFunction(contextValue)) {
                    throw new Error(`Property "${token.segment}" is not a function.`);
                }
                if (Utils_1.Utils.isAsyncFunction(contextValue)) {
                    const value = yield contextValue(...token === null || token === void 0 ? void 0 : token.functionArgs);
                    return this._resolve(tokens, value, counter + 1);
                }
                else {
                    const value = contextValue(...token === null || token === void 0 ? void 0 : token.functionArgs);
                    return this._resolve(tokens, value, counter + 1);
                }
            }
            else if (token.type === "property") {
                const value = context[token.segment];
                return this._resolve(tokens, value, counter + 1);
            }
            else {
                throw new Error(`Invalid segment type: ${token.type}`);
            }
        });
    }
    parseArrayOrMapAndSet(segment) {
        const match = segment.match(/(\w+)\[(.*?)\]/);
        if (match) {
            const [, name, key] = match;
            const isNumericKey = !isNaN(Number(key));
            return {
                segment: name,
                type: isNumericKey ? "array" : "mapOrSet",
                arrayIndex: isNumericKey ? Number(key) : undefined,
                mapOrSetKey: isNumericKey ? undefined : key,
            };
        }
        throw new Error(`Invalid segment: ${segment}`);
    }
    parseFunction(segment) {
        const match = segment.match(/(\w+)\((.*?)\)/);
        if (match) {
            const [, name, args] = match;
            const functionArgs = args
                ? args.split(",").map((arg) => {
                    const value = arg.trim();
                    const isNumeric = !isNaN(Number(value));
                    return isNumeric ? Number(value) : value;
                })
                : [];
            return {
                segment: name,
                type: "function",
                functionArgs,
            };
        }
        throw new Error(`Invalid function segment: ${segment}`);
    }
}
exports.PathResolver = PathResolver;


/***/ }),

/***/ "./src/Utils.ts":
/*!**********************!*\
  !*** ./src/Utils.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Utils = void 0;
class Utils {
    static isAsyncFunction(fn) {
        return fn.constructor.name === "AsyncFunction";
    }
    static isFunctionSegment(segment) {
        const regex = /([\w]+)\((([\w]+)(,[\w]+)*)?\)/;
        return regex.test(segment);
    }
    static isArraySegment(segment) {
        const regex = /([\w]+)\[(\w+)\]/;
        return regex.test(segment);
    }
    static isObject(value) {
        return value instanceof Object;
    }
    static isFunction(value) {
        return value instanceof Function;
    }
    static isArray(value) {
        return value instanceof Array;
    }
    static isMap(value) {
        return value instanceof Map;
    }
    static isSet(value) {
        return value instanceof Set;
    }
}
exports.Utils = Utils;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./index.ts");
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=index.js.map