In the AI SDK, you can take full control over the stream that comes from the back end to the front end, and you can create your own custom data parts that you can use to stream custom information.

The first way you do that is by setting up a custom message type:

```ts
type MyMessage = UIMessage<
  unknown,
  {
    hello: string;
    goodbye: string;
  }
>;
```

`UIMessage` can receive three type arguments: the metadata, some data parts, and some tools. We're interested in data parts here, so we can default metadata to unknown, and parse a map of our different data parts.

When we write to the stream, we'll use the keys from this map in our writer.write calls. This creates a message stream which we can then write to:

```ts
const stream = createUIMessageStream<MyMessage>({
  execute: async ({ writer }) => {
    writer.write({
      type: 'data-hello',
      data: 'Bonjour!',
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));

    writer.write({
      type: 'data-goodbye',
      data: 'Au revoir!',
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));

    writer.write({
      type: 'data-hello',
      data: 'Guten Tag!',
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));

    writer.write({
      type: 'data-goodbye',
      data: 'Auf Wiedersehen!',
    });
  },
});
```

The keys here represent the keys that we're going to use to write our data parts. The "hello" in our type corresponds to "data-hello" when we write to the stream, and "goodbye" corresponds to "data-goodbye".

Then we're just taking all of those chunks and logging them to the console:

```ts
for await (const chunk of stream) {
  console.log(chunk);
}
```

If we run our [`main.ts`](./main.ts) exercise, we'll see this output:

```
{ type: 'data-hello', data: 'Bonjour!' }
{ type: 'data-goodbye', data: 'Au revoir!' }
{ type: 'data-hello', data: 'Guten Tag!' }
{ type: 'data-goodbye', data: 'Auf Wiedersehen!' }
```

Each chunk is logged as it's produced, with a 1-second delay between them due to our `setTimeout` calls.

When we hook this to the UI, we're going to see these exact same data parts streamed in there too.

Once we've created that `MyMessage` type, we can create a `UIMessageStream` and just write custom things to it. These can be interleaved with stream text calls which merge into this stream too.

Nice work, and I'll see you in the next one.
