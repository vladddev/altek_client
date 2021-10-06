"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallEvents = void 0;
var twilio_client_1 = require("twilio-client");
var CallEvents = /** @class */ (function () {
    function CallEvents(_a) {
        var Device = _a.Device, setIsConnect = _a.setIsConnect;
        this._setIsConnect = function () { };
        this.__disconnectHandler = function () { };
        this.__incomingHandler = function () { };
        this._Device = Device;
        this._setIsConnect = setIsConnect;
        this._connect = null;
    }
    CallEvents.prototype._setConnect = function (connect) {
        this._connect = connect;
    };
    CallEvents.prototype._getConnect = function () {
        return this._connect;
    };
    CallEvents.prototype.initEventsHandler = function (disconnectHandler, incomingHandler, missingCallHandler) {
        var _this = this;
        this.__disconnectHandler = disconnectHandler;
        this.__incomingHandler = incomingHandler;
        this.__missedCallHandler = missingCallHandler;
        this._Device.on('incoming', function (connect) {
            _this._setConnect(connect);
            _this.__incomingHandler(connect);
            console.log('incoming');
        });
        this._Device.on('reject', function (connect) {
            _this._setConnect(connect);
            _this.__disconnectHandler();
            console.log('reject');
        });
        this._Device.on('cancel', function (connect) {
            _this._setConnect(connect);
            _this.__disconnectHandler();
            _this.__missedCallHandler && _this.__missedCallHandler(connect);
            connect.disconnect();
            console.log('cancel');
        });
        // Событие - отключение
        this._Device.on('disconnect', function (connect) {
            _this._setConnect(connect);
            _this.__disconnectHandler();
            console.log('Disconnect');
        });
        // Событие - в разговоре
        this._Device.on('connect', function (connect) {
            _this._setConnect(connect);
            _this._setIsConnect && _this._setIsConnect(true);
            console.log('Connect');
        });
        // Приложение запущенно
        this._Device.on('ready', function (connect) {
            _this._setConnect(connect);
            //@ts-ignore
            twilio_client_1.Device.audio.incoming(true);
            _this.__disconnectHandler();
            console.log('Ready');
        });
        this._Device.on('error', function (error) {
            console.log('Device Error');
            console.log(error);
        });
        this._Device.on('offline', function (connect) {
            console.log('OFFLINE');
        });
    };
    return CallEvents;
}());
exports.CallEvents = CallEvents;
