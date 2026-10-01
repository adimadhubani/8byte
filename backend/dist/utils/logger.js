"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.logger = {
    info: (msg, ...rest) => {
        console.log(`[${new Date().toISOString()}] [INFO] ${msg}`, ...rest);
    },
    warn: (msg, ...rest) => {
        console.warn(`[${new Date().toISOString()}] [WARN] ${msg}`, ...rest);
    },
    error: (msg, ...rest) => {
        console.error(`[${new Date().toISOString()}] [ERROR] ${msg}`, ...rest);
    }
};
