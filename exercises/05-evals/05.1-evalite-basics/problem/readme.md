Okay, now we understand a little bit about how to implement AI-powered applications. We really need to know how to test them. For folks who are used to writing deterministic code, you're probably used to writing unit tests for your applications.

Well, in the AI world, these look like evals. These are programs that you can run which will evaluate your AI output to see if it matches certain criteria.

Unlike unit tests where you get a pass-fail score, these will give you a score. They will give you a grade out of zero to a hundred on how good your AI application is at certain tasks.

## Evalite

There are plenty of options out there for different tools you can use to run evals like [Braintrust](https://www.braintrust.dev/) or [Langfuse](https://langfuse.com/). We're going to use one called [Evalite](https://evalite.dev), which you can run completely locally and doesn't cost you anything on top of the AI costs.

We're going to go into [`example.eval.ts`](./evals/example.eval.ts) and we'll see that Evalite is being called here with a title of "Capitals". This is the name of the eval that we're going to run.

```ts
import { evalite } from 'evalite';

evalite('Capitals', {
  // Configuration goes here
});
```

You have some data here, which is a list of different tasks you're going to get the LLM to perform, as well as some expected outputs:

```ts
evalite('Capitals', {
  data: () => [
    {
      input: 'What is the capital of France?',
      expected: 'Paris',
    },
    {
      input: 'What is the capital of Germany?',
      expected: 'Berlin',
    },
    {
      input: 'What is the capital of Italy?',
      expected: 'Rome',
    },
  ],
  // ...other properties
});
```

You'll need to implement the task function, which performs the actual AI call:

```ts
evalite('Capitals', {
  // ...other properties
  task: async (input) => {
    const capitalResult = TODO; // Implement this!

    return capitalResult.text;
  },
});
```

The scorer is going to evaluate whether the LLM did a decent job:

```ts
evalite('Capitals', {
  // ...other properties
  scorers: [
    {
      name: 'includes',
      scorer: ({ input, output, expected }) => {
        return output.includes(expected!) ? 1 : 0;
      },
    },
  ],
});
```

In this case, we're going to look at the output of the LLM and see if it includes the thing that we expect to be in the string. For example, we expect that it will answer something to do with Rome when replying to "What is the capital of Italy?"

If it does, then it will give a one, which indicates 100% or zero, if it doesn't, indicating 0%.

## Your Task

All you need to do is implement the task function, and this is going to be a pretty simple AI SDK call to ask the LLM to return some sort of capital result.

By running the exercise, you'll then see the Evalite output and also open a local dev server at [localhost:3006](http://localhost:3006) to investigate the outputs.

Good luck, and I'll see you in the solution.

## Steps To Complete

- [ ] Import the necessary AI SDK components at the top of your file

  ```ts
  import { google } from '@ai-sdk/google';
  import { generateText } from 'ai';
  ```

- [ ] Implement the `task` function to use the AI SDK to generate a response about capitals

  ```ts
  task: async (input) => {
    const capitalResult = // Call generateText with appropriate model and prompt

    return capitalResult.text;
  },
  ```

- [ ] Your prompt should instruct the model to answer questions about capitals of countries

- [ ] Run the exercise to see the evaluation results

- [ ] Check that your implementation scores well on the test cases (France/Paris, Germany/Berlin, Italy/Rome)

- [ ] Read the [Evalite docs](https://evalite.dev) to get an overview of Evalite's features
