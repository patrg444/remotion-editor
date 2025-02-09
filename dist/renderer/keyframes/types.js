"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterpolationType = void 0;
/**
 * Available interpolation types for transitions between keyframes
 */
var InterpolationType;
(function (InterpolationType) {
    InterpolationType["Linear"] = "linear";
    InterpolationType["Step"] = "step";
    InterpolationType["EaseIn"] = "ease-in";
    InterpolationType["EaseOut"] = "ease-out";
    InterpolationType["EaseInOut"] = "ease-in-out";
    InterpolationType["Bezier"] = "bezier";
})(InterpolationType = exports.InterpolationType || (exports.InterpolationType = {}));
