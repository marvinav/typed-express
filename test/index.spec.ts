import { equal } from "assert";
import { createEndpoint, EndpointMeta } from "../src";

describe("Typescript usage suite", () => {
  it("Should be able to execute a test", () => {
    equal(true, true);
  });
  it("Should return created endpoint", () => {
    const endpoint: EndpointMeta = { url: "/test", method: "get" };
    equal(createEndpoint(endpoint), endpoint);
  });
});
