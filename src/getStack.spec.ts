import { getStack } from "./getStack";

describe("getStack", () => {
  describe("when called in a deep call stack", () => {
    const initialStackTraceLimit = Error.stackTraceLimit;
    afterAll(() => (Error.stackTraceLimit = initialStackTraceLimit));
    Error.stackTraceLimit = 7;

    function testFunction(i: number): ReturnType<typeof getStack> {
      return i < 1000 ? testFunction(i + 1) : getStack();
    }

    const stack = testFunction(1);
    const testFunctionCallsInStack = stack.match(/testFunction/g) ?? [];

    it("should return the whole stack", () => {
      expect(testFunctionCallsInStack.length).toBe(1000);
    });

    it("should not change the Error.stackTraceLimit", () => {
      expect(Error.stackTraceLimit).toBe(7);
    });
  });

  describe("when the stack is not returned", () => {
    class MockError extends Error {
      public stack = undefined;
    }

    const originalError = global.Error;
    global.Error = MockError as ErrorConstructor;
    afterAll(() => (global.Error = originalError));

    function testFunction(i: number): ReturnType<typeof getStack> {
      return i < 10 ? testFunction(i + 1) : getStack();
    }

    it("should return an empty string", () => {
      const stack = testFunction(1);
      expect(stack).toBe("");
    });
  });
});
