import { createTaggerScope } from "./stackTagger";

describe("getTaggerScope", () => {
  describe("when called", () => {
    const taggerScope = createTaggerScope();

    it("should return createTagger and getTag", () => {
      expect(taggerScope).toStrictEqual({
        createTagger: expect.any(Function),
        getTag: expect.any(Function),
      });
    });
  });

  describe("createTagger", () => {
    const { createTagger } = createTaggerScope();
    const { stackTagger, tag } = createTagger();

    it("should return a function", () => {
      expect(stackTagger).toBeInstanceOf(Function);
    });

    describe("tagger", () => {
      it("should return a function with the same fingerprint as it was given", () => {
        const testFn = jest.fn((x: number, y: number) => x + y);
        const taggedFn = stackTagger(testFn);

        expect(taggedFn(3, 5)).toBe(8);
        expect(testFn).toHaveBeenCalledTimes(1);
        expect(testFn).toHaveBeenCalledWith(3, 5);
      });

      describe("tagged function", () => {
        it("should have a tag in it's call stack", () => {
          const layer3 = () => new Error().stack;
          const layer2 = () => layer3();
          const layer1 = () => layer2();

          const taggedLayer1 = stackTagger(layer1);
          const layer3Stack = taggedLayer1();
          expect(layer3Stack).toContain(`___stack_tag_${tag}___`);
        });
      });
    });
  });

  describe("getTag", () => {
    describe("when there is a tag in the call stack, that was created in the same scope", () => {
      const { createTagger, getTag } = createTaggerScope();
      const { stackTagger, tag } = createTagger();

      const layer3 = () => new Error().stack ?? "";
      const layer2 = () => layer3();
      const layer1 = () => layer2();
      const stack = stackTagger(layer1)();

      it("should return the tag", () => {
        const stackTag = getTag(stack);
        expect(stackTag).toBe(tag);
      });
    });

    describe("when there are multiple tags in the call stack, that were created in the same scope", () => {
      const { createTagger, getTag } = createTaggerScope();
      const { stackTagger: stackTagger1 } = createTagger();
      const { stackTagger: stackTagger2, tag: tag2 } = createTagger();

      const layer3 = () => new Error().stack ?? "";
      const layer2 = () => layer3();
      const layer1 = () => stackTagger2(layer2)();
      const stack = stackTagger1(layer1)();

      it("should return the last tag", () => {
        const stackTag = getTag(stack);
        expect(stackTag).toBe(tag2);
      });
    });

    describe("when there is a tag in the call stack, that was created in a different scope", () => {
      const { createTagger } = createTaggerScope();
      const { getTag } = createTaggerScope();
      const { stackTagger } = createTagger();

      const layer3 = () => new Error().stack ?? "";
      const layer2 = () => layer3();
      const layer1 = () => layer2();
      const stack = stackTagger(layer1)();

      it("should return null", () => {
        const stackTag = getTag(stack);
        expect(stackTag).toBe(null);
      });
    });
  });
});
