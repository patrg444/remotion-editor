"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
async function initialize() {
    // Set app user model id for windows
    if (process.platform === 'win32') {
        electron_1.app.setAppUserModelId(electron_1.app.getName());
    }
    // Add app path to environment
    process.env.APP_PATH = electron_1.app.getAppPath();
    process.env.USER_DATA_PATH = electron_1.app.getPath('userData');
    // Set up protocol handlers
    if (process.defaultApp) {
        if (process.argv.length >= 2) {
            electron_1.app.setAsDefaultProtocolClient('remotion-editor', process.execPath, [path_1.default.resolve(process.argv[1])]);
        }
    }
    else {
        electron_1.app.setAsDefaultProtocolClient('remotion-editor');
    }
}
exports.initialize = initialize;
