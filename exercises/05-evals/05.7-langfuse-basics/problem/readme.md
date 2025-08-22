Probably the single most important thing you can do with any AI powered application in order to improve it is to observe it in production.

The reason for that is that the data you get from users using your app is always good quality - since it matches exactly how people are _using_ it.

You can also use it to help your data coverage - by discovering new edge cases that you might not have thought of otherwise. That user data can then be directly used in your evals to improve them.

Not only that, but observability is absolutely key when we're relying so heavily on a paid service. We need to understand how much we're spending as well as look for ways to optimize our token use across prompts.

## LangFuse

There are many custom built tools for LLM observability, but the one I'm going to show you how to use is [LangFuse](https://langfuse.com/). LangFuse is really interesting because they have a cloud service, but they _also_ allow you to run the entire thing locally on Docker.

For simplicity, I recommend that you sign up to their free trial on their [cloud service](https://cloud.langfuse.com/). Once you've done that, you'll need three environment variables in your `.env` file:

```
LANGFUSE_PUBLIC_KEY=your_public_key
LANGFUSE_SECRET_KEY=your_secret_key
LANGFUSE_BASE_URL=https://cloud.langfuse.com
```

You'll be introduced to these as part of the onboarding process.

## The Setup

In this exercise, we're going to be taking the chat title generation system that we created before and instrumenting it, allowing us to observe what's happening with it in production.

In this implementation, we're going to run the title generation in parallel to the chat. This means that if we were persisting the chat, we would be able to persist it with the generated title immediately.

Our first job is to go into the [`langfuse.ts`](./api/langfuse.ts) file and do a little bit of admin. Inside the `otelSDK` variable, we're going to be instantiating a `NodeSDK` class from the `@opentelemetry/sdk-node` package. We're then going to pass it the `LangfuseExporter` instance from the `langfuse-vercel` package as the `traceExporter` property.

The `TODO` for `otelSDK` looks like this:

```ts
// langfuse.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { LangfuseExporter } from 'langfuse-vercel';

// TODO: declare the otelSDK variable using the NodeSDK class
// from the @opentelemetry/sdk-node package,
// and pass it the LangfuseExporter instance
// from the langfuse-vercel package as the traceExporter
export const otelSDK = TODO;
```

Secondly, down the bottom, we're going to instantiate the `langfuse` variable using the `Langfuse` class from the `langfuse` package and pass it the following properties: `environment`, `publicKey`, `secretKey` and `baseUrl`:

```ts
// langfuse.ts
import { Langfuse } from 'langfuse';

// TODO: declare the langfuse variable using the Langfuse class
// from the langfuse package, and pass it the following arguments:
// - environment: process.env.NODE_ENV
// - publicKey: process.env.LANGFUSE_PUBLIC_KEY
// - secretKey: process.env.LANGFUSE_SECRET_KEY
// - baseUrl: process.env.LANGFUSE_BASE_URL
export const langfuse = TODO;
```

## Tracing The Code

Once that's done, we can get into the interesting stuff of actually tracing our code. Our first job is inside the `POST` route in [`chat.ts`](./api/chat.ts). We're going to declare a trace using the `langfuse.trace` method:

```ts
// Replace this:
const trace = TODO;

// With something like:
const trace = langfuse.trace({
  sessionId: body.id,
});
```

We can then pass it the `sessionId` property, which is the ID of the chat.

### Traces and Spans

LangFuse is based on [OpenTelemetry](https://opentelemetry.io/), which means it works with traces and spans.

You can think of a span as like a unit of work. So for instance, a single function call might be a span. In our case, our `streamText` calls are going to be our spans. Our first span is to write the chat message and the second one is to generate the title.

A trace is like a container for some spans. It's like the whole story of what happened.

```
┌──────────────────────────────────────────────┐
│                    TRACE                     │
├──────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────┐  │
│  │     SPAN 1      │    │     SPAN 2      │  │
│  │  Write Chat     │    │    Generate     │  │
│  │    Message      │    │    Title        │  │
│  └─────────────────┘    └─────────────────┘  │
└──────────────────────────────────────────────┘
```

### Passing `telemetry` to the `streamText` & `generateText` calls

Once the trace has been created, we should then go down into the `streamText` call and the `generateText` call and look at the `experimental_telemetry` property.

The AI SDK has built-in support for telemetry. We just need to replace this `TODO` with an object that has an `isEnabled` property, a `functionId` property, and some metadata to link it to the `langfuse.trace.id`.

```ts
// Replace this:
experimental_telemetry: TODO,

// With something like:
experimental_telemetry: {
  isEnabled: true,
  functionId: 'your-name-here',
  metadata: {
    langfuseTraceId: trace.id,
  },
},
```

The `functionId` should be used to describe the action that is being performed.

### Flushing the traces

And once that's done, we can go right to the end of the code all the way down into `onFinish` here.

In `onFinish`, we need to flush the LangFuse traces using the `langfuse.flushAsync` method. 'Flush' here just means send the traces off to LangFuse so that we can view them in its cloud viewer.

```ts
onFinish: async () => {
  // TODO: flush the langfuse traces using the langfuse.flushAsync method
  // and await the result
  TODO;
};
```

### Testing

Once all of these to-dos are done, you can try testing out your application, making sure again that your environment variables are all set up correctly.

You can go into the traces section of the LangFuse dashboard and see your traces coming in. You'll be able to see the title generation and the chat message writing in a single trace.

Good luck, and I'll see you in the solution.

## Steps To Complete

- [ ] Sign up for a free [LangFuse](https://langfuse.com) account to get your API keys

- [ ] Add three environment variables to your `.env` file:

  ```
  LANGFUSE_PUBLIC_KEY=your_public_key
  LANGFUSE_SECRET_KEY=your_secret_key
  LANGFUSE_BASE_URL=https://cloud.langfuse.com
  ```

- [ ] Implement the `otelSDK` in [`langfuse.ts`](./api/langfuse.ts)

- [ ] Implement the `langfuse` instance in [`langfuse.ts`](./api/langfuse.ts)

- [ ] In [`chat.ts`](./api/chat.ts), implement the trace variable:

- [ ] Add `experimental_telemetry` to the `streamText` call and the `generateText` call in [`chat.ts`](./api/chat.ts)

- [ ] Implement the `langfuse.flushAsync()` call in the `onFinish` handler

- [ ] Test your application by running the local dev server

- [ ] Check the LangFuse dashboard to see if traces are being recorded

- [ ] Try different prompts to see how they appear in the traces view
