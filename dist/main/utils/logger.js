"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
    constructor(name) {
        this.name = name;
    }
    info(message, data) {
        console.log(`[${this.name}] ${message}`, data);
    }
    error(message, error) {
        console.error(`[${this.name}] ${message}`, error);
    }
    warn(message, data) {
        console.warn(`[${this.name}] ${message}`, data);
    }
    debug(message, data) {
        console.debug(`[${this.name}] ${message}`, data);
    }
}
exports.Logger = Logger;
