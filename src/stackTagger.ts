// Do not import anything into this file, ever!
// See the `stackTagger` comment below for reasons.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any;
type StackTagger = <F extends AnyFunction>(fn: F) => F;

interface TaggerScope {
  readonly createTagger: () => StackTagger;
  readonly getTag: (stackTrace: string) => string | null;
}

/**
 * We use this hard-coded UUIDv4 (dashes removed) to reduce the likely hood of collisions with other
 * entries in the stack trace.
 * This is also used to find our context keys.
 */
const BASE_KEY = "3d0294b9a36042afa51478071c0a9d5d";

/**
 * We use this counter to create IDs that are guaranteed to not overlap
 * between scopes. The counter is incremented every time a new scope is created
 */
let scopeCounter = 0;

/**
 * Create a new tagger scope
 */
export const createTaggerScope = (): TaggerScope => {
  scopeCounter += 1;
  const scopeId = scopeCounter.toString(32);

  /**
   * We use this counter to create IDs that are guaranteed to not overlap
   * between calls within a scope. The counter is incremented every time a new call is triggered
   */
  let callCounter = 0;

  /**
   * Create a new stack tagger within the scope
   */
  const createTagger = () => {
    callCounter += 1;
    const callId = callCounter.toString(32);
    const callKey = [BASE_KEY, scopeId, callId].join("_");

    /**
     * Dont panic!
     *
     * I know what you're thinking, `new Function` is eval.
     *
     * It's close, but `new Function` is actually not as bad.
     * You can read about it here if you'd like more info on how it works: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function
     *
     * Also, what we're doing here is heavily bounded. This function is intentionally placed in a module with no imports and takes
     * no input of it's own. This is to eliminate any risk of rouge input sneaking into our `new Function` call. It's totally isolated.
     *
     * What we're doing here is creating a dynamically named function and calling our own function through it.
     * This creates an entry into the stack trace and allows us to resolve the ID of the call stack from any
     * function within that stack. Essentially, we're tagging the call stack with an ID that allows us to look up the context for it.
     */
    const stackTagger = new Function(
      "action",
      `return function ___stack_tag_${callKey}___(...args) { return action(...args); };`
    );

    return stackTagger as StackTagger;
  };

  /**
   * We'll be using this regex to resolve stack ID from a call stack.
   * It is important that this matches the function name created in `stackTagger`
   */
  const matcherRegex = new RegExp(
    `___stack_tag_(${BASE_KEY}_${scopeId}_[a-z0-9]+)___`
  );

  /**
   * Returns stack trace ID, or null, given a stack trace string.
   */
  const getTag = (stackTrace: string) => {
    const match = stackTrace.match(matcherRegex);
    return match ? match[2] : null;
  };

  return {
    createTagger,
    getTag,
  } as const;
};
