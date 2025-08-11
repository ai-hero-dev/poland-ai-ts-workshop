We've seen how you can use custom data parts to stream down custom objects, custom shapes into your front end. But what if you have a data part that you want to overwrite another data part?

A classic example of this is like a current status data part, where you say, oh, we're loading, then we're searching the web, then we're scraping some pages, then we're summarizing:

```txt
Loading...
Searching the web...
Scraping some pages...
Summarizing...
```

You don't want those to show as four different elements in the UI. You want them just to show as a single status that changes over time.

We can model that by providing a stable ID to each data part.

```ts
const stream = createUIMessageStream<MyMessage>({
  execute: async ({ writer }) => {
    const helloId = crypto.randomUUID();
    const goodbyeId = crypto.randomUUID();

    // Initial state: No parts
    // messageParts = []

    writer.write({
      type: 'data-hello',
      id: helloId,
      data: 'Bonjour!',
    });

    // After first write:
    // messageParts = [
    //   {
    //     type: 'data-hello',
    //     id: helloId,
    //     data: 'Bonjour!'
    //   }
    // ]

    await new Promise((resolve) => setTimeout(resolve, 1000));

    writer.write({
      type: 'data-goodbye',
      id: goodbyeId,
      data: 'Au revoir!',
    });

    // After second write:
    // messageParts = [
    //   {
    //     type: 'data-hello',
    //     id: helloId,
    //     data: 'Bonjour!'
    //   },
    //   {
    //     type: 'data-goodbye',
    //     id: goodbyeId,
    //     data: 'Au revoir!'
    //   }
    // ]

    await new Promise((resolve) => setTimeout(resolve, 1000));

    writer.write({
      type: 'data-hello',
      id: helloId,
      data: 'Guten Tag!',
    });

    // After third write - notice how the helloId part is UPDATED, not added:
    // messageParts = [
    //   {
    //     type: 'data-hello',
    //     id: helloId,
    //     data: 'Guten Tag!'  // Updated from 'Bonjour!'
    //   },
    //   {
    //     type: 'data-goodbye',
    //     id: goodbyeId,
    //     data: 'Au revoir!'
    //   }
    // ]

    await new Promise((resolve) => setTimeout(resolve, 1000));

    writer.write({
      type: 'data-goodbye',
      id: goodbyeId,
      data: 'Auf Wiedersehen!',
    });

    // After fourth write - goodbye part is UPDATED:
    // messageParts = [
    //   {
    //     type: 'data-hello',
    //     id: helloId,
    //     data: 'Guten Tag!'
    //   },
    //   {
    //     type: 'data-goodbye',
    //     id: goodbyeId,
    //     data: 'Auf Wiedersehen!'  // Updated from 'Au revoir!'
    //   }
    // ]
  },
});
```

With just this small change of providing stable IDs, we can see how the message parts change over time. When we write to an existing ID:

- "Guten Tag!" replaces "Bonjour!"
- "Auf Wiedersehen!" replaces "Au revoir!"

So by providing this ID here, we have given each data part a stable identity, and when we write to an existing ID, we update the value of that data part rather than creating a new one. You can see this in action by running our [`main.ts`](./main.ts) example.

So it's a really nice way to model data parts that need to update over time. Very, very cool. Nice work, and I will see you in the next one.
