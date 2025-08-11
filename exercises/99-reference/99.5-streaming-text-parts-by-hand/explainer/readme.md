Sometimes you'll want to not only be able to stream custom parts, but also stream in the AI SDK's built-in parts in order to mimic them. I'm specifically thinking here of streaming manually text parts by hand.

This comes up in a few edge cases where you want something to look like an LLM call that isn't actually an LLM call, or you have some data that's been prepared in parallel that you just want to spit out all at once.

To do this, we're going to create a `UIMessageStream` using `createUIMessageStream`:

```ts
const stream = createUIMessageStream<MyMessage>({
  execute: async ({ writer }) => {
    const textPartId = crypto.randomUUID();

    writer.write({
      type: 'text-start',
      id: textPartId,
    });

    const splitText = text.split(' ');

    for (const word of splitText) {
      writer.write({
        type: 'text-delta',
        delta: word + ' ',
        id: textPartId,
      });

      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    writer.write({
      type: 'text-end',
      id: textPartId,
    });
  },
});
```

With text streaming, there's a specific sequence you need to follow. You start with a `text-start` event, then send multiple `text-delta` events for each piece of text, and finally a `text-end` event to complete the sequence.

Each of these message parts needs to share the same ID (`textPartId` in this case), which is generated using `crypto.randomUUID()`.

The text is split into words, and each word is sent as a separate delta with a small delay to create the streaming effect:

```ts
const splitText = text.split(' ');

for (const word of splitText) {
  writer.write({
    type: 'text-delta',
    delta: word + ' ',
    id: textPartId,
  });

  await new Promise((resolve) => setTimeout(resolve, 50));
}
```

This approach is really handy when you want to mimic a part of the AI SDK or just manually stream in some text. You can see the full example in our [`main.ts`](./main.ts) file.

Nice work, and I'll see you in the next one.
