I wanted to take a minute and critique our titles dataset a little bit. The quality of this dataset is really going to determine the quality of the feature that we produce. Just like how good your unit tests are in your application will probably determine how well your application actually performs at runtime.

To start this exercise, I recommend you take the [CSV in the repo](./titles-dataset.csv) and import it into a spreadsheet like Google Sheets. Once that's done, you can have a look at the data and manually assess it.

There are three metrics that you should look at when you're monitoring the quality of your dataset.

## Data Quantity

The first is quantity, how much data do you actually have?

In this case, we have 44 input-output pairs. That's a pretty solid amount. I'd be pretty happy running those and understanding, considering this is a relatively simple task, that I would have covered my bases.

## Data Quality

If quantity is how much data you have, quality is how _good_ that data is. You've probably heard of the phrase garbage in, garbage out, right? Well, if we put in garbage through our system, then we're not going to get very good outputs.

Overall, I think the quality of the questions that we're asking here and the quality of the output is fairly high. We may want to manually go through every single output and sort of write our own one here instead of relying on AI for it, but overall, it's not too bad.

## Coverage Concerns

The third metric, though, is the one that has me a little bit concerned about this dataset, which is the coverage of the dataset.

What we notice here is:

- The inputs are pretty much always the same length. They pretty much always run to two lines in the Google Sheet I have.
- They are all in English
- They're all written with very good punctuation as well, with perfect capitalization.
- They're written with good intent - there are no malicious inputs.

This leaves us with a lot of questions about our system:

- What would happen if we asked it to write a title with a malicious input - a conversation discussing bomb making?
- How would it respond if we query it in a different language?
- How would it respond if we query it with a very long piece of text?
- What about an extremely short piece of text or a vague piece of text, like "yo"?

So while our dataset is high quality, it's not very diverse.

## The Plan

To improve our dataset, we should consider adding:

- Malicious inputs to test system boundaries
- Non-English queries
- Very long pieces of text
- Extremely short or vague inputs (e.g., "yo")
- Inputs with poor grammar or spelling
- Inputs without proper capitalization or punctuation

Let's go back to our [Chat Title Generation Playground](/exercises/05-evals/05.05-chat-title-generation/problem/readme.md) and try some of those inputs out.

## Steps To Complete

- [ ] Go back to the [chat title generation exercise](/exercises/05-evals/05.05-chat-title-generation/problem/readme.md) and add some more data to the dataset.
  - Add some malicious inputs to test system boundaries.
  - Add some non-English queries.
  - Add some very long pieces of text.
  - Add some extremely short or vague inputs (e.g., "yo" or "ey up chuck").
  - Add some inputs with poor grammar or spelling.
  - Add some inputs without proper capitalization or punctuation.

- [ ] Run the evals with the new dataset and see how they perform.

- [ ] Reflect on the results and see if you can improve the dataset further.
