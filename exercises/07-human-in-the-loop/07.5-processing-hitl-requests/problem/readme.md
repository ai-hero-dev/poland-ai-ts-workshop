Now that we've passed all the information to the LLM, we need to process the decisions that users make into actual actions.

In this exercise, we'll be working on processing human-in-the-loop (HITL) decisions for actions like sending emails.

## Declaring the `action-end` Part

First, we need to declare our third custom data part - an `action-end` part that contains the output of the action.

This will help us track the entire lifecycle of an action from request to completion.

In the [`api/chat.ts`](./api/chat.ts) file, we need to complete the type definition for the `action-end` part:

```ts
export type MyMessage = UIMessage<
  unknown,
  {
    // ...existing parts...

    // TODO: declare an action-end part that contains
    // the output of the action. This should contain:
    // - the action ID
    // - the output of the action (in this case, a message
    // that the email was sent)
    'action-end': TODO;
  }
>;
```

We need to define what data an action-end part should contain - at minimum, it should include the action ID and information about the output.

## Updating the Diary Function

Next, we need to update the `getDiary` function to handle action-end parts. This function transforms message parts into a readable format for the LLM:

```ts
// inside the getDiary function
if (part.type === 'data-action-end') {
  // TODO: if the part is a data-action-end,
  // return a string that describes the output of
  // the action.
}
```

## Handling Missing User Messages

In the `POST` handler, we need to add validation to ensure we have a valid user message:

```ts
export const POST = async (req: Request): Promise<Response> => {
  const body: { messages: MyMessage[] } = await req.json();
  const { messages } = body;

  const mostRecentUserMessage = messages[messages.length - 1];

  // TODO: return a Response of status 400 if there's
  // no most recent user message.

  // ...existing code...
};
```

## Processing Decisions

Finally, we need to implement the `findDecisionsToProcess` function, which:

1. Gets actions from the assistant message
2. Gets decisions from the user message
3. Matches them up and returns action-decision pairs to process

```ts
export const findDecisionsToProcess = (opts: {
  mostRecentUserMessage: MyMessage;
  mostRecentAssistantMessage: MyMessage | undefined;
}): HITLError | HITLDecisionsToProcess[] => {
  const { mostRecentUserMessage, mostRecentAssistantMessage } =
    opts;

  // NOTE: If there's no assistant message in the chat,
  // there's nothing to process and we can proceed with
  // the conversation.
  if (!mostRecentAssistantMessage) {
    return [];
  }

  // TODO: Get all the actions from the assistant message
  // and return them in an array.
  const actions = TODO;

  // TODO: Get all the decisions that the user has made
  // and return them in a map.
  const decisions = TODO;

  const decisionsToProcess: HITLDecisionsToProcess[] = [];

  for (const action of actions) {
    const decision = decisions.get(action.id);

    // TODO: if the decision is not found, return an error -
    // the user should make a decision before continuing.
    //
    // TODO: if the decision is found, add the action and
    // decision to the decisionsToProcess array.
  }

  return decisionsToProcess;
};
```

This function ensures we have all the necessary information before proceeding with any actions, providing a safety mechanism for our application.

You can also return a `HITLError` if the user hasn't made a decision for an action. This has already been scaffolded for you in the `POST` route.

```ts
// NOTE: if hitlResult returns a HITLError,
// we should return a Response with the error message
if ('status' in hitlResult) {
  return new Response(hitlResult.message, {
    status: hitlResult.status,
  });
}
```

## Testing

When fully implemented, you'll be able to nearly see the complete flow: the assistant requests an action, the user makes a decision, and the system processes that decision accordingly.

All that's left is executing the action, which we'll cover in the next exercise.

To see if it's working, I've also added a `console.dir` just before the `createUIMessageStream` call:

```ts
console.dir(hitlResult, { depth: null });
```

So you'll be able to see the decisions that are being processed as you're testing.

Good luck, and I'll see you in the solution!

## Steps To Complete

- [ ] Complete the `'action-end'` type definition in [`api/chat.ts`](./api/chat.ts) to include the action ID and output information

- [ ] Update the `getDiary` function to handle `data-action-end` parts by returning a string that describes the action output

- [ ] Add validation in the POST handler to return a 400 response if there's no most recent user message

- [ ] Implement the `findDecisionsToProcess` function to:
  - Get actions from the assistant message
  - Get decisions from the user message
  - Match them up and return action-decision pairs to process
  - Return a `HITLError` if the user hasn't made a decision for an action
- [ ] Test your implementation by running the local dev server and checking if the console logs show the correct action-decision pairs

- [ ] Note that `sendEmail` still won't be executed yet - we'll do that in the next exercise
