Probably the single most important thing you can do with any AI powered application in order to improve it is to observe it in production.

The more data you gather from your users actually using your application, understanding where they went wrong, understanding what was good, the more data you can take from that and put into your evaluation suite.

Not only that, but observability is absolutely key when we're relying so heavily on a paid service. We need to understand how much we're spending as well as look for ways to optimize our token use across prompts.

## LangFuse

There are many custom built tools for LLM observability, but the one I'm going to show you how to use is [LangFuse](https://langfuse.com/). LangFuse is really interesting because they have a cloud service, but they _also_ allow you to run the entire thing locally on Docker.

For simplicity, I recommend that you sign up to their free trial on their cloud service. Once you've done that, you'll need three environment variables in your `.env` file:

```
LANGFUSE_PUBLIC_KEY=your_public_key
LANGFUSE_SECRET_KEY=your_secret_key
LANGFUSE_BASE_URL=https://cloud.langfuse.com
```

You'll be introduced to these as part of the onboarding process.

## The Setup

In this exercise, we're going to be taking the Slack message system that we created before and instrumenting it, allowing us to observe what's happening with it in production.

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

### Traces and Spans

LangFuse is based on [OpenTelemetry](https://opentelemetry.io/), which means it works with traces and spans.

You can think of a span as like a unit of work. So for instance, a single function call might be a span. In our case, our `streamText` calls are going to be our spans. Our first span is to write the Slack message and the second one is to evaluate it.

A trace is like a container for some spans. It's like the whole story of what happened.

```
┌──────────────────────────────────────────────┐
│                    TRACE                     │
├──────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────┐  │
│  │     SPAN 1      │    │     SPAN 2      │  │
│  │  Write Slack    │    │    Evaluate     │  │
│  │    Message      │    │    Response     │  │
│  └─────────────────┘    └─────────────────┘  │
└──────────────────────────────────────────────┘
```

### Passing `telemetry` to the `streamText` call

Once the trace has been created, we should then go down into the first `streamText` call and look at the `experimental_telemetry` property.

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

We need to do that for the generate call, but also for the evaluation call as well down the bottom.

```ts
// For the evaluation call, replace:
experimental_telemetry: TODO,

// With:
experimental_telemetry: {
  isEnabled: true,
  functionId: 'your-name-here',
  metadata: {
    langfuseTraceId: trace.id,
  },
},
```

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

### Prettifying the LangFuse Traces

There's a little `TODO` just above this as well, which is right at the end of the stream, you can update the trace again with the following information:

```ts
// TODO: update the trace with the following information:
// - input: messages
// - output: mostRecentDraft
// - metadata: { feedback: mostRecentFeedback }
// - name: 'generate-slack-message'
TODO;
```

Without this, LangFuse has a habit of updating the parent trace with funny information. And so adding a final update, a kind of summary at the end will make our traces just look a little bit better.

### Testing

Once all of these to-dos are done, you can try testing out your application, making sure again that your environment variables are all set up correctly.

You can go into the traces section of the LangFuse dashboard and see your traces coming in. You'll be able to see detailed information about your AI calls.

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

- [ ] Add `experimental_telemetry` to the first `streamText` call and the `streamObject` call

- [ ] Implement `trace.update` at the end of the stream

- [ ] Implement the `langfuse.flushAsync()` call in the `onFinish` handler

- [ ] Test your application by running the local dev server

- [ ] Check the LangFuse dashboard to see if traces are being recorded

- [ ] Try different prompts to see how they appear in the traces view
