Our workflow is working pretty nicely. We're getting some decent output, but our user is not seeing anything on their screen for a significant amount of time. That's because we are using `generateText` here.

```ts
// Current code using [`generateText`](./api/chat.ts)
const writeSlackResult = await generateText({
  model: google('gemini-2.0-flash-001'),
  system: WRITE_SLACK_MESSAGE_FIRST_DRAFT_SYSTEM,
  prompt: `
    Conversation history:
    ${formatMessageHistory(messages)}
  `,
});
```

In other words, this `await` is waiting for this entire piece of text to be generated before we can continue with the evaluation. And then only finally, when we get to the final Slack attempt, do we then start streaming the text to the user via [`toUIMessageStreamResponse`](./api/chat.ts).

It would be much better if the user could see tokens on the screen faster, if we could improve our TTFT, time to first token. The way we're going to do that is via streaming some custom data parts.

## Declaring A Custom Message Type

We're going to create a custom `MyMessage` type using `UIMessage` and declare some custom data parts in here:

```ts
// TODO: Replace with this
export type MyMessage = UIMessage<
  unknown,
  {
    'slack-message': string;
    'slack-message-feedback': string;
  }
>;
```

The `slack-message` and `slack-message-feedback` keys represent the name of the data part, and the `string` type represents the _value_ of that data part.

One data part is going to represent the evaluation result and one is going to represent the first draft.

You probably won't need to change much of this code here. As extra prep for this lesson, I recommend you check out the [reference material](/exercises/99-reference/99.2-custom-data-parts-streaming/explainer/readme.md) on streaming custom data parts, because that will tell you a few things that will help you solve these next todos.

## Passing The Custom Message Type To The Frontend

Inside our frontend here, we definitely want to pass `MyMessage` to the [`useChat`](./client/root.tsx) hook:

```tsx
// Change this:
const { messages, sendMessage } = useChat({});

// To this:
const { messages, sendMessage } = useChat<MyMessage>({});
```

## Rendering The Custom Data Parts

And we'll also want to go into the components and render the messages inside the message component. You'll need to update the [`Message`](./client/components.tsx) component to handle the custom data parts:

```tsx
// Message component will need to handle custom data parts
export const Message = ({
  role,
  parts,
}: {
  role: string;
  parts: MyMessage['parts'];
}) => {
  // Add rendering for slack-message and slack-message-feedback parts
  // ...
};
```

And again, there's examples for all of these things in the reference material, which as a generous teacher, I will link to. But good luck and I will see you in the solution.

## Steps To Complete

- [ ] Check out the [reference material](/exercises/99-reference/99.2-custom-data-parts-streaming/explainer/readme.md) on streaming custom data parts. This will tell you how to update the `MyMessage` type.

- [ ] Update the `MyMessage` type with custom data parts for 'slack-message' and 'slack-message-feedback'

- [ ] Update the API to use `streamText` instead of `generateText` for the first draft and evaluation

- [ ] Create a `createUIMessageStream` to manage the writing of messages and data parts. Check the [reference material](/exercises/99-reference/99.3-custom-data-parts-stream-to-frontend/explainer/readme.md) to understand how to do this.

- [ ] Use the `writer.write()` method to add custom data parts to the stream as they're generated

- [ ] Ensure that all the data parts are written with consistent ids. Check out the [reference material](/exercises/99-reference/99.4-custom-data-parts-id-reconciliation/explainer/readme.md) to understand how to do this.

- [ ] Update the frontend to use the custom `MyMessage` type in the `useChat` hook

- [ ] Modify the `Message` component to render the custom data parts with appropriate styling. Again, the [reference material](/exercises/99-reference/99.3-custom-data-parts-stream-to-frontend/explainer/readme.md) has some tips here.

- [ ] Test your implementation by running the local dev server and checking if you see the Slack message draft and feedback appearing on the screen before the final message
