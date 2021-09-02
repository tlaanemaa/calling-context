export const getStack = (): string => {
  const oldStackTraceLimit = Error.stackTraceLimit;
  Error.stackTraceLimit = Infinity;
  const stack = new Error().stack;
  Error.stackTraceLimit = oldStackTraceLimit;
  return stack ?? "";
};
