There are yet more optimizations that we can make to our flow, specifically in improving the results that we get back from our retrieval. So far, our process is:

1. Create some keywords for BM25
2. Generate a search query for semantic search (thanks to the query rewriter)
3. Perform both of those searches
4. Merge them together with reciprocal rank fusion

But what if we then take those results and pass those to another LLM?

- We'll take the most relevant results from, for example, the top `30`.
- Pass them to an LLM that will filter out the irrelevant results.
- Only those top results will be passed to the next step that generates the answer.

This is called re-ranking, and it's a very common pattern in situations where you want to improve your retrieval.

We are going to implement it in this exercise.

## Slicing the search results

Our first TODOs are just under the `searchTypeScriptDocs` function, inside the [`/api/chat.ts`](./api/chat.ts) POST route:

```ts
const searchResults = await searchTypeScriptDocs({
  keywordsForBM25: keywords.object.keywords,
  embeddingsQuery: keywords.object.searchQuery,
});

// TODO: Slice the search results to the top 30
// TODO: Add an ID to each result (just a number: use the index of the array)
const topSearchResultsWithId = TODO;
```

Our plan here is to take the search results that we get from `searchTypeScriptDocs`, which have already been rank fused. We're then going to slice those results so we just get the top 30, and then we're going to add an ID to each result.

I've then got some code to translate it into text here, to format it so that the ID comes first, then the file name comes next, and then the content comes in these XML tags:

```ts
const topSearchResultsAsText = topSearchResultsWithId
  .map((result) =>
    [
      `## ID: ${result.id}`,
      `### Title: ${result.filename}`,
      `<content>`,
      result.content,
      `</content>`,
    ].join('\n\n'),
  )
  .join('\n\n');
```

## Building the re-ranker

Now here's the big TODO. We need a `generateObject` call that filters down to only the most relevant search results. This `generateObject` call is going to receive:

- The search results (including their IDs)
- The query that we asked it
- A system prompt that tells it what to do

```ts
// TODO: Filter down to only the most relevant search results
// via a generateObject call
// Use the RERANKER_SYSTEM_PROMPT to rerank the search results
// Pass it the search results as text and the user's question
// Return the IDs of the most relevant search results - NOT
// all the content. No need to waste tokens returning all
// the content too.
const rerankedSearchResults = TODO;
```

And here's a really important point: We only want it to return the IDs of the most relevant documents. We could get it to return all of the content too, but that would be extremely token wasteful, because really we're just passing a bunch of documents to this LLM and just asking it for the references to those documents.

You can also use this `RERANKER_SYSTEM_PROMPT`, which I've got above:

```ts
const RERANKER_SYSTEM_PROMPT = `You are a search result reranker. Your job is to analyze a list of documentation pages and return only the IDs of the most relevant pages for answering the user's question.

Given a list of documentation pages with their IDs, filenames, and content, you should:
1. Evaluate how relevant each page is to the user's question
2. Return only the IDs of the most relevant pages

You should be selective and only include pages that are genuinely helpful for answering the question. If a page is only tangentially related or not relevant, exclude its ID.

Return the IDs as a simple array of numbers.`;
```

We're then going to map over them, grabbing the references to the actual documents from the ID that we get back from the LLM.

```ts
// Make an object out of the top search results
const topSearchResultsAsMap = new Map(
  topSearchResultsWithId.map((result) => [result.id, result]),
);

// Map over the IDs that we got back from the LLM
// and grab the references to the actual documents from the ID
const topSearchResults = rerankedSearchResults.object.resultIds
  .map((id) => topSearchResultsAsMap.get(id))
  .filter((result) => result !== undefined);
```

We also filter out any that were hallucinated by the LLM, because the LLM might invent its own IDs that don't actually exist in our ID set.

Once this is implemented, you should be able to run the exercise locally, try asking it a few TypeScript questions, and see what documents get pulled out. In theory, this should improve the quality of our retrieval, which will improve the quality of our whole system, but also you may want to monitor how fast this is taking, because this approach will certainly add latency.

Good luck, and I'll see you in the solution.

## Steps To Complete

- [ ] Complete the first TODO by slicing the search results to the top `30` and adding an ID to each result using the array index

- [ ] Implement the second TODO by creating a `generateObject` call that uses the `RERANKER_SYSTEM_PROMPT`
  - Configure the `generateObject` call to only return the IDs of the most relevant documents (not the full content)
  - Pass the search query and formatted search results text to the `generateObject` call

- [ ] Run the exercise locally and test it by asking TypeScript questions

- [ ] Observe which documents are being selected by the re-ranker in the console logs

- [ ] Monitor the impact on response time/latency

- [ ] Evaluate whether the quality of answers improves with the re-ranking step
