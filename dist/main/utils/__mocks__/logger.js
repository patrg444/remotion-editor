"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
    constructor(name) {
        this.name = name;
    }
    debug(...args) { }
    info(...args) { }
    warn(...args) { }
    error(...args) { }
}
exports.Logger = Logger;
exports.default = Logger;
