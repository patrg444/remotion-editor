"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EffectPlugin = void 0;
const logger_1 = require("../../utils/logger");
const logger = new logger_1.Logger('EffectPlugin');
class EffectPlugin {
    constructor(name, options = {}) {
        this.name = name;
        this.options = options;
    }
    getName() {
        return this.name;
    }
    getOptions() {
        return this.options;
    }
    setOptions(options) {
        this.options = { ...this.options, ...options };
        logger.info(`Updated options for effect ${this.name}:`, this.options);
    }
    async initialize() {
        logger.info(`Initializing effect ${this.name}`);
    }
    async cleanup() {
        logger.info(`Cleaning up effect ${this.name}`);
    }
}
exports.EffectPlugin = EffectPlugin;
