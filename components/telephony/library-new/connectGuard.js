"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectGuard = void 0;
exports.connectGuard = function (value, status) {
    if (value.__proto__.hasOwnProperty('status') && typeof value.status === 'function' && value.status() === status) {
        return true;
    }
    return false;
};
