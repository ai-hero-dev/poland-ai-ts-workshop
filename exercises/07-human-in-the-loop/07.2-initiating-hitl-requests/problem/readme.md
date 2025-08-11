Now we understand the vague setup for how our human in the loop is going to work. So let's start diving into some code to get it working.

## Current Implementation in [`api/chat.ts`](./api/chat.ts)

Our current setup uses `streamText`, with a tool call of `sendEmail` where the description is "send an email". It has an input schema of `to`, `subject`, and `content`, all the stuff that you need to be able to send an email. In the `execute` function of the tool, it actually calls `sendEmail`:

```ts
tools: {
  sendEmail: {
    description: 'Send an email',
    inputSchema: z.object({
      to: z.string(),
      subject: z.string(),
      content: z.string(),
    }),
    execute: async ({ to, subject, content }) => {
      // Currently directly sends the email without user confirmation
      await sendEmail({ to, subject, content });

      return 'Email sent';
    },
  },
},
```

This implementation delegates too much power to the LLM. It can send an email any time it wants to. We want the power to say no to certain emails or to review them before they get sent out.

(And by the way, `sendEmail` just logs to the console that an email has been sent. So don't worry, we're not going to send any real emails).

## `MyMessage` in [`api/chat.ts`](./api/chat.ts)

As always, I've given you a set of TODOs that you can follow. And the first one is in the `MyMessage` type.

In this exercise, we're going to focus on the `action-start` part we discussed in the intro. This custom data part is going to have all the information we need to preview what we're going to be sending on the front end.

```ts
export type MyMessage = UIMessage<
  unknown,
  {
    // TODO: declare an action-start part that
    // contains the action that will be performed.
    'action-start': TODO;
  }
>;
```

In other words, it needs all of the attributes that are on this schema:

```ts
// from the sendEmail tool
inputSchema: z.object({
  to: z.string(),
  subject: z.string(),
  content: z.string(),
}),
```

So that's your first job. Declare a custom data part that has all of those attributes.

NOTE: I also recommend you give the `action-start` part an ID. That will be very, very useful in future exercises, since other custom data parts will need to reference it.

## Fixing the Tool Call

Next, you're going to go inside the `streamText` function inside the execute call of the `sendEmail` tool. And you will change this so that it writes a `data-action-start` part to the message stream writer instead of sending the email:

```ts
// from the sendEmail tool
execute: ({ to, subject, content }) => {
  // TODO: Instead of calling sendEmail, write a
  // data-action-start part to the stream writer.
};
```

## The Stop Condition

We need to change the stop condition for `streamText`. Currently, it will run the tool and process the result immediately.

However, in our new setup, we want it to stop immediately after it calls the tool. Once it stops, we're then going to ask the frontend whether we should execute the tool.

Our current stop condition stops when the step count reaches `10`, which is a backstop against the LLM running wild. We'll keep this in place - but we'll need to add a new stop condition.

```ts
// Current implementation in [`api/chat.ts`](./api/chat.ts)
stopWhen: stepCountIs(10),
```

Instead, we want to stop either when the step count is `10` or when the agent has sent the `sendEmail` tool call. The [`hasToolCall` function from `ai`](https://ai-sdk.dev/docs/migration-guides/migration-guide-5-0#step-control-maxsteps--stopwhen) is going to be very useful here.

## The Message Component

So once that's done, our agent should have the ability to send these custom data parts to the front end. Fittingly then, our last TODO is in the front end. We're inside the message components here and if the part is a `data-action-start`, we want to render a preview of the email that will be sent.

```tsx
export const Message = ({
  role,
  parts,
}: {
  role: string;
  parts: MyMessage['parts'];
}) => (
  <div className="my-4">
    {parts.map((part) => {
      if (part.type === 'text') {
        return <ReactMarkdown>{part.text}</ReactMarkdown>;
      }

      // TODO: if the part is a data-action-start,
      // render a preview of the email that will be sent

      return null;
    })}
  </div>
);
```

Once all of these TODOs are resolved, you should be able to say, "send an email to this person" and if the LLM has enough information to call the tool, then once it's called the tool, it will show you a nice preview of the email in the front end. At that point, you can call the exercise done and move on to the next one.

Good luck, and I'll see you in the solution!

## Steps To Complete

- [ ] Define the `action-start` part type in the `MyMessage` type in [`api/chat.ts`](./api/chat.ts). Include fields for `action` which should contain: `id`, `type` ("send-email"), `to`, `subject`, and `content` fields.

- [ ] Modify the `execute` function inside the `sendEmail` tool to write a data action-start part to the writer instead of calling the `sendEmail` function directly. You'll need to use `writer.write()` with the appropriate data structure.

- [ ] Add a second stop condition to the `stopWhen` array. Currently it has `stepCountIs(10)`, but you'll need to add `hasToolCall('sendEmail')` so it stops when the model wants to send an email. Remember - we need both!

- [ ] Update the `Message` component in [`client/components.tsx`](./client/components.tsx) to render a preview of the email when it encounters a part with `type === 'data-action-start'`. Create a UI that shows the to, subject, and content fields.

- [ ] Test your implementation by running the exercise and asking the AI to send an email. Verify that instead of sending the email directly, it shows a preview of the email that would be sent.
