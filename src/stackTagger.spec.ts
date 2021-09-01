import { createTaggerScope } from "./stackTagger";

describe("getTaggerScope", () => {
  describe("when called", () => {
    const taggerScope = createTaggerScope();

    it("should return getTagger and getTag", () => {
      expect(taggerScope).toStrictEqual({
        createTagger: expect.any(Function),
        getTag: expect.any(Function),
      });
    });
  });

  describe("getTagger", () => {
    const { createTagger } = createTaggerScope();
    const tagger = createTagger();

    it("should return a function", () => {
      expect(tagger).toBeInstanceOf(Function);
    });

    describe("tagger", () => {
      it("should return a function with the same fingerprint as it was given", () => {
        const testFn = jest.fn((x: number, y: number) => x + y);
        const taggedFn = tagger(testFn);

        expect(taggedFn(3, 5)).toBe(8);
        expect(testFn).toHaveBeenCalledTimes(1);
        expect(testFn).toHaveBeenCalledWith(3, 5);
      });

      describe("tagged function", () => {
        it("should have a tag in it's call stack", () => {
          const layer3 = () => new Error().stack
          const layer2 = () => layer3();
          const layer1 = () => layer2();

          const taggedLayer1 = tagger(layer1);
          const layer3Stack = taggedLayer1()
          expect(layer3Stack).toMatch(/___stack_tag_(3d0294b9a36042afa51478071c0a9d5d_[a-z0-9]+_[a-z0-9]+)___/)
        });
      });
    });
  });
});
