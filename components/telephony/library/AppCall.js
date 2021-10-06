"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppCallFn = void 0;
var twilio_client_1 = require("twilio-client");
var AppCallEvents_1 = require("./AppCallEvents");
var AppCallFn = /** @class */ (function (_super) {
    __extends(AppCallFn, _super);
    function AppCallFn(_a) {
        var setConnect = _a.setConnect, connect = _a.connect, setIsConnect = _a.setIsConnect, connectHandler = _a.connectHandler, disconnectHandler = _a.disconnectHandler, incomingHandler = _a.incomingHandler, acceptHandler = _a.acceptHandler, callingHandler = _a.callingHandler, missedCallHandler = _a.missedCallHandler;
        var _this = 
        //@ts-ignore
        _super.call(this, { Device: twilio_client_1.Device, setConnect: setConnect, setIsConnect: setIsConnect }) || this;
        //@ts-ignore
        _this.Device = twilio_client_1.Device;
        _this.connect = connect; // connect instance
        _this.connectHandler = connectHandler; // Connect handler
        _this.disconnectHandler = disconnectHandler; // disconnect handler
        _this.incomingHandler = incomingHandler; // incoming call handler
        _this.acceptHandler = acceptHandler; // accept call handler
        _this.callingHandler = callingHandler; // calling handler
        _this.missedCallHandler = missedCallHandler;
        return _this;
    }
    AppCallFn.prototype._connectHandler = function () {
        this.connectHandler && this.connectHandler();
    };
    AppCallFn.prototype._disconnectHandler = function () {
        this.disconnectHandler && this.disconnectHandler();
    };
    AppCallFn.prototype._acceptHandler = function (connect) {
        this.acceptHandler && this.acceptHandler(connect);
    };
    AppCallFn.prototype._callingHandler = function () {
        this.callingHandler && this.callingHandler();
    };
    AppCallFn.prototype._incomingHandler = function (connect) {
        this.incomingHandler && this.incomingHandler(connect);
    };
    AppCallFn.prototype._missedCallHandler = function (connect) {
        this.missedCallHandler && this.missedCallHandler(connect);
    };
    AppCallFn.prototype.sendNumber = function (number) {
        var _a;
        //@ts-ignore
        (_a = this.Device.activeConnection()) === null || _a === void 0 ? void 0 : _a.sendDigits(number);
        console.log(this.Device.activeConnection());
        // this.connect?.sendDigits(number)
    };
    // pressing btn  Decline => HungUp or Reject
    AppCallFn.prototype.HungUp = function () {
        var _a;
        this._disconnectHandler();
        // if in call with => hangUp
        if (AppCallFn.connectGuard(this.connect, 'open')) {
            this.Device.disconnectAll();
            // if incoming call => reject
        }
        else {
            if (AppCallFn.connectGuard(this.connect, 'pending')) {
                (_a = this.connect) === null || _a === void 0 ? void 0 : _a.reject();
                console.log('reject');
            }
        }
    };
    // pressing btn Accept => Accept or Calling
    AppCallFn.prototype.Call = function (cellPhoneInput, fromNumber) {
        console.log(cellPhoneInput, fromNumber)
        var params = {
            'phoneNumber': cellPhoneInput,
            'from': fromNumber
        };
        // if incoming call
        if (this.connect && AppCallFn.connectGuard(this.connect, 'pending')) {
            this._connectHandler();
            this.connect.accept();
            this._acceptHandler(this.connect);
            // if calling to number
        }
        else if (this.Device.status() === 'ready' || AppCallFn.connectGuard(this.connect, 'closed')) {
            this.Device.connect(params);
            this._callingHandler();
            this._connectHandler();
        }
    };
    // token init
    AppCallFn.prototype.initToken = function (number) {
        return __awaiter(this, void 0, void 0, function () {
            var token;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("https://sms.green-node.ru/token/generate/cnu/" + number) // "url": "https://sms.altekloads.com",
                            .then(function (res) { return res.json(); })
                            .catch(function (error) { return console.log(error); })];
                    case 1:
                        token = (_a.sent()).token;
                        if (token) {
                            console.log(token);
                            this.Device.setup(token, {
                                debug: true,
                                sounds: {
                                    incoming: 'https://sms.green-node.ru/incoming_sound'
                                }
                            });
                        }
                        else {
                            console.log('Token error');
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    AppCallFn.connectGuard = function (value, status) {
        if (value.__proto__.hasOwnProperty('status') && typeof value.status === 'function' && value.status() === status) {
            return true;
        }
        return false;
    };
    AppCallFn.prototype.updateConnect = function (connect) {
        this.connect = connect;
    };
    AppCallFn.prototype.initEventsListener = function () {
        // Add Events listener
        _super.prototype.initEventsHandler.call(this, this._disconnectHandler, this._incomingHandler, this._missedCallHandler);
    };
    return AppCallFn;
}(AppCallEvents_1.AppCallEvents));
exports.AppCallFn = AppCallFn;
