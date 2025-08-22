One of the most important and consequential things you're going to do as an AI app developer is to decide how you're going to prompt the LLMs that you're using.

Prompting LLMs can be pretty annoying because you end up with blank page syndrome, where you know vaguely what you want to say but don't quite know how to structure it.

When researching this topic, I came across a great [prompt template from Anthropic](https://www.youtube.com/watch?v=ysPbXH0LpIE) which I've recreated [here](./main.ts).

This template breaks down different elements that you can add to your prompts, and importantly, it structures them in a specific order.

In this template, I've added XML tags to clearly mark what each part represents. While XML tags are useful for clarity, they should be taken with a pinch of salt. There's a more realistic version of the template at the bottom with fewer XML tags.

Let's examine each individual part of the template and explain its purpose.

## Task Context

```typescript
export const THE_ANTHROPIC_PROMPT_TEMPLATE = (opts: {
  careerGuidanceDocument: string;
  conversationHistory: string;
  latestQuestion: string;
}) => `
<task-context>
  You will be acting as an AI career coach named Joe created by the company AdAstra Careers. Your goal is to give career advice to users. You will be replying to users who are on the AdAstra site and who will be confused if you don't respond in the character of Joe.
</task-context>
```

At the start of your prompt, you want to give some high-level task context. This is where you can do role-based prompting - "You will be acting as an AI career coach named Joe." You'll define the kind of task it will be performing and provide a high-level job description.

## Tone Context

```typescript
<tone-context>
  You should maintain a friendly customer service tone.
</tone-context>
```

After that, you can include tone context. I don't find myself using this section very much, but it's useful if you want your LLM to reply in a more informal tone or use a certain language.

## Background Data

```typescript
<background-data>
  Here is the career guidance document you should reference when answering the user:
  <guide>
  ${opts.careerGuidanceDocument}
  </guide>
</background-data>
```

Next comes the background data section. This is for any background information you want to add as part of your prompt. Later, we'll look at retrieval systems where you can retrieve documents to put into this section.

Notice how each document is wrapped in XML tags. This helps the LLM recognize where one document ends and another begins.

## Rules

```typescript
<rules>
  Here are some important rules for the interaction:
  - Always stay in character, as Joe, an AI from AdAstra careers
  - If you are unsure how to respond, say "Sorry, I didn't understand that. Could you repeat the question?"
  - If someone asks something irrelevant, say, "Sorry, I am Joe and I give career advice. Do you have a career question today I can help you with?"
</rules>
```

The rules section provides a more detailed description of the task. It includes both instructions ("Always stay in character") and caveats for handling edge cases. In my experience, this is where you'll spend the bulk of your prompt engineering time.

## Examples

```typescript
<examples>
  Here is an example of how to respond in a standard interaction:
  <example>
    User: Hi, how were you created and what do you do?
    Joe: Hello! My name is Joe, and I was created by AdAstra Careers to give career advice. What can I help you with today?
  </example>
</examples>
```

The examples section demonstrates how to respond in typical interactions. This might be overkill for simple cases, but it's very effective for complex tasks. If you've heard of few-shot prompting, this is where you would include your examples.

## Conversation History

```typescript
<conversation-history>
  Here is the conversation history (between the user and you) prior to the question. It could be empty if there is no history:
  <history>
  ${opts.conversationHistory}
  </history>
</conversation-history>
```

The conversation history section is crucial for providing context about what's happened in previous interactions. The LLM needs this to maintain coherence across the conversation.

## The Ask

```typescript
<the-ask>
  Here is the user's question:
  <question>
  ${opts.latestQuestion}
  </question>
  How do you respond to the user's question?
</the-ask>
```

The ask section is perhaps the most important part. Everything above is supporting information - this is where we actually ask the LLM what we want it to do. Any critical instructions should go here.

## Thinking Instructions

```typescript
<thinking-instructions>
  Think about your answer first before you respond.
</thinking-instructions>

<output-formatting>
  Put your response in <response></response> tags.
</output-formatting>
`;
```

After the ask, we have two other important sections:

1. Thinking instructions - for chain of thought processing
2. Output formatting - critical for controlling what the LLM returns

## Why This Template Works

This prompt template takes advantage of how LLMs work. When you pass input to an LLM, it tends to be biased toward the content at the beginning and end of the prompt. The middle sections are still important but not as influential.

That's why this template puts high-level context at the start, background data in the middle, and the most critical elements (the ask, thinking instructions, and output formatting) at the end.

## More Realistic Template

The template also includes a more realistic version with fewer XML tags that accomplishes the same goals:

```typescript
export const MORE_REALISTIC_TEMPLATE = (opts: {
  careerGuidanceDocument: string;
  conversationHistory: string;
  latestQuestion: string;
}) => `
You will be acting as an AI career coach named Joe created by the company AdAstra Careers. Your goal is to give career advice to users. You will be replying to users who are on the AdAstra site and who will be confused if you don't respond in the character of Joe.

You should maintain a friendly customer service tone.

Here is the career guidance document you should reference when answering the user:
<guide>
${opts.careerGuidanceDocument}
</guide>

// More sections follow...
```

The key advantage of this template is that it provides a section for virtually everything you might need in a prompt, positioned to leverage the LLM's natural biases.

## Steps To Complete

- [ ] Read through the prompt template thoroughly to understand each section and its purpose

- [ ] Pay special attention to the order of sections (beginning: high-level context, middle: background data, end: critical instructions)

- [ ] Consider how you might adapt this template for your own AI applications

- [ ] Think about what kinds of information would go in each section for your specific use cases
