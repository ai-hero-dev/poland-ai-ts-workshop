Now that we've gone full workflow, why don't we pull it back a little bit and inject some agentic behavior into our workflow. Instead of just taking a linear path - creating a first draft, evaluating it, then creating another draft - let's run that loop a specific number of times to see if we can get a better output.

The appeal of this approach is flexibility. That loop count could be increased over time or tuned to configure our system remotely. You might even give high-paying customers a better experience than lower-paying customers by increasing their loop iterations.

The code for this lives inside our POST route. In the problem code, we need to modify the [`execute`](./api/chat.ts) function to implement our loop:

```ts
export const POST = async (req: Request): Promise<Response> => {
  const body: { messages: MyMessage[] } = await req.json();
  const { messages } = body;

  const stream = createUIMessageStream<MyMessage>({
    execute: async ({ writer }) => {
      let step = TODO; // TODO: keep track of the step we're on
      let mostRecentDraft = TODO; // TODO: keep track of the most recent draft
      let mostRecentFeedback = TODO; // TODO: keep track of the most recent feedback

      // TODO: create a loop which:
      // 1. Writes a Slack message
      // 2. Evaluates the Slack message
      // 3. Saves the feedback in the variables above
      // 4. Increments the step variable
    },
  });

  return stream.toUIMessageStreamResponse();
};
```

Instead of the existing linear workflow with separate sections for first draft, feedback, and final message, we'll create a `while` loop that repeats the process a specified number of times.

We'll need to maintain state between iterations by tracking:

- Which step we're on
- The most recent draft
- The most recent feedback

Once the loop is done, we'll use the final draft as our response, streaming it as a text part rather than a custom data part. Check out the [reference material](/exercises/99-reference/99.5-streaming-text-parts-by-hand/explainer/readme.md) to see how to do this.

Make sure you lock down the stop condition of your while loop - paid systems with potential infinite loops can be scary! Always ensure your loop has a clear exit condition.

Good luck, and I'll see you in the solution.

## Steps To Complete

- [ ] Initialize variables at the beginning of the `execute` function: `step` (starting at 0), `mostRecentDraft` (empty string), and `mostRecentFeedback` (empty string)

- [ ] Create a `while` loop that continues until `step < 2` (or another number of your choosing)

- [ ] Increment the `step` variable at the end of each loop iteration

- [ ] Inside the loop, implement the slack message writing logic:
  - Stream the draft to the client using `writer.write`
  - Store the draft in `mostRecentDraft`

- [ ] Still inside the loop, implement the evaluation logic:
  - Stream the feedback to the client
  - Store the feedback in `mostRecentFeedback`

- [ ] After the loop completes, stream the final text as a text part:
  - Create a text-start part
  - Create a text-delta part with the final draft
  - Create a text-end part

- [ ] Test your implementation by running the local dev server and checking if the Slack message generation shows multiple drafts and feedback cycles
