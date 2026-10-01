"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.priceCache = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
// TODO: Redis use karna hai production ke liye, abhi in-memory theek hai
const cache = new node_cache_1.default({
    stdTTL: 15,
    checkperiod: 30
});
exports.priceCache = {
    get(key) {
        return cache.get(key);
    },
    set(key, value, ttlSeconds) {
        if (ttlSeconds !== undefined) {
            return cache.set(key, value, ttlSeconds);
        }
        return cache.set(key, value);
    },
    del(key) {
        return cache.del(key);
    },
    flush() {
        cache.flushAll();
    }
};
