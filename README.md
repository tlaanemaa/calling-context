# Calling Context

This was an attempt to add call stack context into NodeJS. The approach was to annotate the call-stack with a custom function, giving us the ability to use that annotation as an ID to look up a previously stored context.
Sadly though, the experiment failed due to how async operations break up the call-stack. Never the less, this serves as an interesting case study into Node JS call-stack manipulation.

See the `./src/context.spec.ts` for an example of how this implementation fails.

For a real solution to the problem of adding context to your call-stack, see [async_context](https://nodejs.org/api/async_context.html)
