Now that we've got our architecture all put together, it's time to start optimizing a little.

The first thing I can see to optimize is improving the way the orchestration agent reasons.

LLMs in general do better when you take a moment to plan ahead before you go to executing. I find this when editing code - taking the time to create a plan for the LLM to follow ends up with better results than just improvisation.

So, that's exactly what we're going to do. Before we figure out which tasks to run, we'll first generate a plan.

## Creating the Plan

Inside our POST route, before we get to the loop, we're going to call `streamText` to generate a plan.

```ts
// TODO: Before the loop, call streamText to generate a plan.
// Use the getPlanSystemPrompt function to create the system prompt.
// Pass in the formatted messages to create the prompt.
const planResult = TODO;
```

There's a `getPlanSystemPrompt` function that helps with the planning. It has a lot of similar content to the system prompt below which describes how to execute the plan, but it also has some instructions on how to format the plan - specifically in the form of an ordered list of steps like a to-do list.

## Streaming the Plan

We'll need to monitor the plan's text stream and write it to the client. We'll write it as reasoning parts using `reasoning-start`, `reasoning-delta`, and `reasoning-end`.

```ts
// TODO: Write the plan to the client by monitoring the plan's
// textStream.
// You can either use a custom data part for this, or use
// reasoning-start, reasoning-delta, and reasoning-end.
// These work the same as text-start, text-delta, and text-end,
// but are for reasoning parts.
TODO;
```

The reasoning parts work exactly the same as `text-start`, `text-delta`, and `text-end` parts. Check out the [reference](/exercises/99-reference/99.5-streaming-text-parts-by-hand/explainer/readme.md) for more details on streaming text parts.

## Displaying the Plan

Now, we need to modify our [`Message` component](./client/components.tsx) to handle reasoning parts. Looking at the TODO comment in the component:

```tsx
{
  parts.map((part) => {
    if (part.type === 'text') {
      return (
        <div className="text-gray-100 prose prose-invert">
          <ReactMarkdown>{part.text}</ReactMarkdown>
        </div>
      );
    }

    // TODO: Handle the reasoning part. You can handle it
    // in the same way as the text above - though it should
    // perhaps look a little greyed out.
    TODO;

    if (part.type === 'data-task') {
      return <TaskItem key={part.id} task={part.data} />;
    }
  });
}
```

In the solution, the reasoning text is displayed in a slightly grayer color to differentiate it from regular text.

## Updating the Diary

Finally, we'll update the diary with the final plan.

Storing the plan in the diary makes sense because it marks the plan in the chronology. We're making a plan at the start, but things might not go according to plan. We might get some errors further down, and seeing the plan at the very start helps ensure the agent won't blindly stick to the plan even when things go wrong.

## Testing

When we've implemented these changes, we should see the reasoning parts being streamed in when we query the UI. This should lead to better results from prompts that demand multiple agents or agents being called in parallel.

Good luck, and I'll see you in the solution!

## Steps To Complete

- [ ] Implement the plan generation in our [`api/chat.ts`](./api/chat.ts)

- [ ] Stream the plan to the client using reasoning parts

- [ ] Update the diary with the final plan

- [ ] Modify the [`Message` component](./client/components.tsx) to handle reasoning parts

- [ ] Test your changes by running the exercise
  - [ ] Make a request and observe if you can see the plan being streamed as reasoning
  - [ ] Check if the plan appears before the execution starts
  - [ ] Verify that multiple agents are being used effectively based on the plan
