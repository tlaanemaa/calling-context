import { createTaggerScope } from "./stackTagger";
import { getStack } from "./getStack";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any;

type WithContext<ContextType> = <F extends AnyFunction>(
  context: ContextType,
  fn: F
) => (...args: Parameters<F>) => ReturnType<F>;

type GetContext<ContextType> = () => ContextType | null;

type CreateContextType = <ContextType>() => {
  withContext: WithContext<ContextType>;
  getContext: GetContext<ContextType>;
};

/**
 * This is where we'll be keeping all of our context objects
 */
const contextMap = new Map();

/**
 * Create functions for a specific type of a context object.
 */
export const createContextType: CreateContextType = <ContextType>() => {
  const { createTagger, getTag } = createTaggerScope();

  /**
   * Use this to bind context to a function
   */
  const withContext: WithContext<ContextType> =
    (context, fn) =>
    (...args) => {
      /**
       * Get new unique tagger and tag for this call
       */
      const { stackTagger, tag } = createTagger();

      /**
       * Set context and run the function
       */
      contextMap.set(tag, context);
      const result = stackTagger(fn)(...args);

      /**
       * Make sure to remove the context once we're done
       */
      if (result instanceof Promise) {
        result.finally(() => {
          contextMap.delete(tag);
        });
      } else {
        contextMap.delete(tag);
      }

      return result;
    };

  /**
   * Gets the calling context for this call
   */
  const getContext: GetContext<ContextType> = () => {
    const stack = getStack();
    const tag = getTag(stack);
    return contextMap.get(tag) ?? null;
  };

  return { withContext, getContext };
};
