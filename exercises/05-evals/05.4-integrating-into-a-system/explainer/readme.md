So far, we've seen what evals are, but we haven't really seen them connected to production code.

In a traditional production system, you need to think about making that system testable. In an AI-powered application, you need to think about making your system evaluatable.

In other words, you need to extract out the parts of your system that are going to be evaluated.

## The `POST` Route

Inside [`api/chat.ts`](./api/chat.ts), we have an example `POST` route that sits at `/api/chat`.

```ts
export const POST = async (req: Request): Promise<Response> => {
  const body: { messages: MyMessage[] } = await req.json();
  const { messages } = body;

  return createUIMessageStreamResponse({
    stream: createChatStream(messages),
  });
};
```

As you can see, we still have this `createUIMessageStreamResponse` here, and all of the logic that extracts the messages out of the body.

But I've created a separate [`createChatStream`](./api/chat.ts#createChatStream) function that takes in an array of `MyMessage` objects.

If we look at the definition for this function, we can see that it returns a `createUIMessageStream` with `MyMessage`, with all of the logic inside here:

```ts
export const createChatStream = (messages: MyMessage[]) => {
  const stream = createUIMessageStream<MyMessage>({
    execute: async ({ writer }) => {
      // Implementation details...
    },
  });

  return stream;
};
```

This stream can then be passed down directly into `createUIMessageStreamResponse`, and we can also use this inside our eval.

## The Eval

We're inside [`evals/example.eval.ts`](./evals/example.eval.ts) here, and we're using `createChatStream` to create a stream of messages:

```ts
evalite('Example', {
  data: async () => [
    {
      input: 'Write a message to my boss asking for a raise.',
    },
  ],
  task: async (input) => {
    const messages: MyMessage[] = [
      {
        id: '1',
        role: 'user',
        parts: [{ type: 'text', text: input }],
      },
    ];
    const stream = createChatStream(messages);

    let text = '';

    for await (const message of stream) {
      if (message.type === 'text-delta') {
        text += message.delta;
      }
    }

    return text;
  },
  scorers: [],
});
```

## Streaming The Result

Now, we have a bunch of choices for how we're going to consume this stream, because we need to consume it and then pass the result of that to Evalite.

The most useful thing to pass to Evalite in terms of what we want to evaluate is going to be the final Slack message that gets produced by `createChatStream`.

So what I've done is essentially just gone `for await const message of stream`, and then checking for text delta parts, and then appending that stuff to this message here.

```ts
let text = '';

for await (const message of stream) {
  if (message.type === 'text-delta') {
    text += message.delta;
  }
}

return text;
```

Once this stream is complete, so we've `for await`-ed every single message in the stream, finally, we can just simply return the text, which is the concatenated version of all of the text parts that have come down.

And if we were to look at Evalite now, we would see that we get the text back from the application having saved all of the text delta parts.

This is the cleanest way to separate your production application from the thing that you want to evaluate. You pull out everything that does the streaming, and then you just extract from the stream and pass that into Evalite.

It works really nicely, and hopefully that makes sense as an approach.

Good luck, and I'll see you in the next one.

## Steps To Complete

- [ ] Review the [`api/chat.ts`](./api/chat.ts) file to understand how the `createChatStream` function works

- [ ] Examine the eval file structure in [`evals/example.eval.ts`](./evals/example.eval.ts)

- [ ] Understand how the input gets converted to messages and passed to `createChatStream`

- [ ] Learn how to consume the stream by iterating through it with `for await` and collecting text deltas

- [ ] Verify that your Evalite setup is correctly receiving the final text output

- [ ] Run the exercise to see the evaluation results

- [ ] Check the terminal output to confirm that the eval is working as expected
