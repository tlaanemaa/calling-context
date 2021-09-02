import { getStack } from "./getStack";

describe("getStack", () => {
  describe("when called in a deep call stack", () => {
    Error.stackTraceLimit = 10
    function testFunction(i: number): ReturnType<typeof getStack> {
      return i < 1000 ? testFunction(i + 1) : getStack();
    }

    const stack = testFunction(1);
    const testFunctionCallsInStack = stack.match(/testFunction/g) ?? [];
    it("should return the whole stack", () => {
      expect(testFunctionCallsInStack.length).toBe(1000);
    });

    it("should not change the Error.stackTraceLimit", () => {
      expect(Error.stackTraceLimit).toBe(10);
    });
  });
});
