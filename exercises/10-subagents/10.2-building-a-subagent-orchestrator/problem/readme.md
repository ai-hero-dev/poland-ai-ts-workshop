Now that we understand the problem space a little bit more, let's start building our orchestrator.

Our orchestrator agent is going to be responsible for prompting the subagents. It will give them some tasks to do, which they will then report back to the orchestrator, and the orchestrator will decide what to do next.

We're just going to focus on generating the list of tasks that need to be performed. This is just going to be an array of objects, containing:

- The agent name that needs to be called
- The prompt that should be given to that agent

By the end of the exercise, you should be able to prompt the orchestrator from the UI and see in the terminal the tasks that it's chosen.

## The `generateObject` call

Our first to-do is inside the `POST` route in our [`api/chat.ts`](./api/chat.ts), and all we're going to do is call `generateObject` to generate a list of tasks. These tasks should be an array of objects with the following properties:

- The subagent to use
- A detailed description of the task to perform

```ts
// TODO: call generateObject to generate a list of tasks.
// These tasks should be an array of objects with the following
// properties:
// - subagent: the name of the subagent to use
// - task: the task to perform
//
// The system prompt is in the getSystemPrompt function above.
// The prompt should be the formatted messages above.
const tasksResult = TODO;
```

If we look at the system prompt in the `getSystemPrompt` function, we can see:

```ts
const getSystemPrompt = () => {
  return `
    You are a helpful assistant that manages a multi-agent system.
    You will be given a conversation history and the user's initial prompt.

    The current date is ${new Date().toISOString()}.

    You have access to four subagents:

    - todos-agent: This agent manages a list of todos.
    - student-notes-manager: This agent manages a list of student notes.
    - song-finder-agent: This agent finds songs using the web.
    - scheduler-agent: This agent manages a calendar.

    You will return a list of tasks to delegate to the subagents.
    These tasks will be executed in parallel.

    Subagents can handle complicated tasks, so don't be afraid to delegate large tasks to them.

    This means that inter-dependent tasks (like finding X and using X to create Y) should be split into two tasks.

    Think step-by-step - first decide what tasks need to be performed,
    then decide which subagent to use for each task.
  `;
};
```

You should pass in the formatted messages as the prompt, and test the tasks by logging them to your terminal.

Eagle-eyed readers will notice that we're not using `streamObject` here. We'll look at streaming the tasks to the front end in the next exercise.

## Testing

You should be able to provide your orchestrator several different prompts:

- "Get me my lessons for tomorrow"
- "Read this student's notes and find me a song for them"
- "Any test that you can think of that coordinates multiple agents together"

And the relevant tasks should be selected and logged to your terminal.

Once you've got it working, try just prompting a few things in the UI and seeing what you get in your terminal.

Good luck, and I'll see you in the solution!

## Steps To Complete

- [ ] Find the POST route in `problem/api/chat.ts` file

- [ ] Replace the TODO with the call to `generateObject`
  - [ ] Use the system prompt from `getSystemPrompt()` function
  - [ ] Use `formattedMessages` as the prompt
  - [ ] Create a schema for tasks using Zod with these properties:
    - An array of tasks
    - Each task has a `subagent` property (must be one of the four agent names)
    - Each task has a `task` property (string description of what to do)

- [ ] Get the tasks from the result with `const tasks = tasksResult.object.tasks`
  - [ ] Log the tasks to console with `console.dir(tasks, { depth: null })`

- [ ] Start the local dev server

- [ ] Test by entering prompts in the UI
  - "Get me my lessons for tomorrow"
  - "Read this student's notes and find me a song for them"
  - "Any test that you can think of that coordinates multiple agents together"

- [ ] Check your terminal to see the tasks that are being generated

- [ ] You won't see any output in the UI yet - we'll look at that in the next exercise
