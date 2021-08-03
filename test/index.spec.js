"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = require("assert");
var src_1 = require("../src");
describe("Typescript usage suite", function () {
    it("Should be able to execute a test", function () {
        assert_1.equal(true, true);
    });
    it("Should return created endpoint", function () {
        var endpoint = { url: "/test", method: "get" };
        assert_1.equal(src_1.createEndpoint(endpoint), endpoint);
    });
});
