"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServerEndpoint = void 0;
var typed_express_1 = require("@marvinav/typed-express");
function createServerEndpoint(meta) {
    return typed_express_1.createEndpoint(meta);
}
exports.createServerEndpoint = createServerEndpoint;
var addTask = typed_express_1.createEndpoint({
    url: "/",
    method: "get",
});
var getTask = typed_express_1.createEndpoint({
    url: "/:id",
    method: "get",
});
var endpoints = { addTask: addTask, getTask: getTask };
var TaskController = /** @class */ (function (_super) {
    __extends(TaskController, _super);
    function TaskController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.route = "/task";
        _this.endpoints = endpoints;
        return _this;
    }
    return TaskController;
}(typed_express_1.BaseController));
var Controller = /** @class */ (function (_super) {
    __extends(Controller, _super);
    function Controller() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Controller;
}(TaskController));
