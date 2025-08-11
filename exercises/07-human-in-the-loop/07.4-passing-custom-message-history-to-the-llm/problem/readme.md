This exercise is an absolutely tiny one and it shows you the importance of taking full control over formatting of the message history.

We're here because we're trying to fix a bug actually. When we attempt to:

- Send an email
- Reject it with a negative feedback message

Then actually the LLM doesn't respond to our output. It just says "thank you for a fantastic email and I've sent it".

It seems like the LLM is somewhat out of sync with our message history.

## The Problem

The reason for this is that when we pass the messages to our `streamText` call, we are converting them into model messages:

```ts
// from the streamText call
streamText({
  messages: convertToModelMessages(messages),
});
```

This is a problem because the model messages don't know anything about our custom data parts - they're for `UIMessage`'s only. Check the [reference](/exercises/99-reference/99.6-ui-messages-vs-model-messages/explainer/readme.md) for a playground to see the differences between model and UI messages.

## `getDiary`

That means we need to find a way of formatting our message history for the LLM so that it can see both of the text parts, which it can see already, and the custom data parts.

I've given you a `getDiary` function, which takes in an array of messages and just returns a single string. This returns a markdown formatted version of our message history, where each message has a subheading of either user message or assistant message, but each part, it then just turns it into an array and then joins it.

Here's the `getDiary` function from the code:

```ts
const getDiary = (messages: MyMessage[]): string => {
  return messages
    .map((message): string => {
      return [
        message.role === 'user'
          ? '## User Message'
          : '## Assistant Message',
        message.parts
          .map((part): string => {
            if (part.type === 'text') {
              return part.text;
            }

            if (part.type === 'data-action-start') {
              if (part.data.action.type === 'send-email') {
                return [
                  'The assistant requested to send an email:',
                  `To: ${part.data.action.to}`,
                  `Subject: ${part.data.action.subject}`,
                  `Content: ${part.data.action.content}`,
                ].join('\n');
              }

              return '';
            }

            if (part.type === 'data-action-decision') {
              if (part.data.decision.type === 'approve') {
                return 'The user approved the action.';
              }

              return `The user rejected the action: ${part.data.decision.reason}`;
            }

            return '';
          })
          .join('\n\n'),
      ].join('\n\n');
    })
    .join('\n\n');
};
```

And here's an example of what the output from `getDiary` might look like for a conversation.

```md
## User Message

Send an email to team@aihero.dev saying what a fantastic AI workshop I'm currently attending. Thank them for the workshop.

## Assistant Message

I'd be happy to draft an email to the team at AI Hero expressing your gratitude for the workshop! Here's what I'd like to send:

The assistant requested to send an email:
To: team@aihero.dev
Subject: Thank You for the Fantastic AI Workshop
Content: Hello AI Hero Team,

I wanted to take a moment to express my sincere gratitude for the fantastic AI workshop I'm currently attending. The content has been incredibly insightful, and I'm learning so much valuable information.

Thank you for putting together such an excellent educational experience. I truly appreciate the effort that went into creating this workshop.

Best regards,
John Doe

## User Message

The user rejected the action: The email is too formal. Make it more casual and friendly.
```

This gives us full control so we can do prompt engineering from inside the messages.

## The Fix

All I want you to do in this exercise is just take out `convertToModelMessages` and use the `prompt` property instead, calling `getDiary` on the messages and test it before and after to see if it makes a difference.

I also recommend `console.log`-ing the `getDiary` output so that you can see everything that comes from it. What you should see is that the LLM starts reacting better to this flow:

- Send an email
- Reject it with a negative feedback message

Good luck, and I'll see you in the solution!

## Steps To Complete

- [ ] In [`api/chat.ts`](./api/chat.ts), locate where `convertToModelMessages` is being used

- [ ] Replace `messages: convertToModelMessages(messages)` with `prompt: getDiary(messages)`

- [ ] Add `console.log(getDiary(messages))` before the `streamText` call to see the formatted output

- [ ] Test the application by sending an email and then rejecting it with feedback

- [ ] Observe if the LLM now responds appropriately to your rejection feedback

- [ ] Look at the console output to see how the conversation history is formatted for the LLM
