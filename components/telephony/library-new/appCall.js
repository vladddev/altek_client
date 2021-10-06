"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppCall = void 0;
var callService_1 = require("./callService");
var connectGuard_1 = require("./connectGuard");
var AppCall = /** @class */ (function () {
    function AppCall(_a) {
        var setIsConnect = _a.setIsConnect, connectHandler = _a.connectHandler, disconnectHandler = _a.disconnectHandler, incomingHandler = _a.incomingHandler, acceptHandler = _a.acceptHandler, callingHandler = _a.callingHandler, missedCallHandler = _a.missedCallHandler;
        this.callService = new callService_1.CallService({ setIsConnect: setIsConnect, connectHandler: connectHandler, disconnectHandler: disconnectHandler, incomingHandler: incomingHandler,
            acceptHandler: acceptHandler, callingHandler: callingHandler, missedCallHandler: missedCallHandler });
    }
    AppCall.prototype.init = function (myNumber, company) {
        this.callService.initToken(myNumber, company);
        this.callService.initEventsListener();
    };
    AppCall.prototype.call = function (phone) {
        this.callService.Call(phone);
    };
    AppCall.prototype.decline = function () {
        this.callService.HungUp();
    };
    AppCall.prototype.mute = function (status) {
        var _a;
        if (connectGuard_1.connectGuard(this.callService.getConnect(), 'open')) {
            (_a = this.callService.getConnect()) === null || _a === void 0 ? void 0 : _a.mute(status);
        }
    };
    AppCall.prototype.isMuted = function () {
        if (this.callService.getConnect() && connectGuard_1.connectGuard(this.callService.getConnect(), 'open')) {
            return !!this.callService.getConnect().isMuted();
        }
        return false;
    };
    AppCall.prototype.sendDigits = function (number) {
        var _a;
        if (connectGuard_1.connectGuard(this.callService.getConnect(), 'open')) {
            (_a = this.callService.getConnect()) === null || _a === void 0 ? void 0 : _a.sendDigits(number);
        }
    };
    AppCall.prototype.connectGuard = function (val, status) {
        connectGuard_1.connectGuard(val, status);
    };

    return AppCall;
}());
exports.AppCall = AppCall;
