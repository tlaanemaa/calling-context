import { createContextType } from "./context";

describe("createContextType", () => {
  it("should return 2 functions", () => {
    expect(createContextType()).toStrictEqual({
      withContext: expect.any(Function),
      getContext: expect.any(Function),
    });
  });

  describe("withContext", () => {
    const { withContext } = createContextType<string[]>();

    it("should return a function with the same call signature", () => {
      const testFn = (x: number, y: number) => x + y;
      const testFnWithContext = withContext(["a"], testFn);
      expect(testFnWithContext(5, 3)).toBe(8);
    });
  });

  describe("getContext", () => {
    const { getContext } = createContextType<string[]>();

    it("should return null if no context is set", () => {
      expect(getContext()).toBe(null);
    });
  });

  describe("withContext & getContext", () => {
    describe("when used together", () => {
      it("getContext should return the context that was provided to withContext", () => {
        const { withContext, getContext } = createContextType<string[]>();

        function testFn(i: number): ReturnType<typeof getContext> {
          return i < 10 ? testFn(i + 1) : getContext();
        }

        const initialContext = ["a", "b", "d"];
        const testFnWithContext = withContext(initialContext, testFn);
        const returnedContext = testFnWithContext(1);

        expect(returnedContext).toBe(initialContext);
      });

      it("getContext should return the context that was provided to withContext through async code", async () => {
        // FIXME: This test fails because async operations break the call stack.
        // See async_context for a better way to do the same thing

        const { withContext, getContext } = createContextType<string[]>();
        const wait = (ms: number) =>
          new Promise((resolve) => setTimeout(resolve, ms));

        const testFn = async () => {
          await wait(10);
          console.log(new Error().stack); // Our stack_tag is gone :(
          return getContext();
        };

        const initialContext = ["a", "b", "d"];
        const testFnWithContext = withContext(initialContext, testFn);
        const returnedContext = testFnWithContext();

        expect(await returnedContext).toBe(initialContext);
      });
    });
  });
});
