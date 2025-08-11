So far, we've seen two algorithms that you can use to retrieve relevant documents from a corpus.

It turns out that both of these have different strengths.

These strengths are:

- **BM25**: Really useful when you want to do keyword matching, when you want to say "I want to find this keyword in this document".
- **Semantic search**: Better for broader semantic and meaningful connections between a document and a query.

It turns out that actually taking the results of these and combining them together, fusing those ranking systems together, is the most productive way of getting the best results.

## The Problem

Now, a lot of research has gone into this problem, and I want to show you one really nice algorithm you can use to combine two different ranking systems together. It's called Reciprocal Rank Fusion.

You might think, well, both of them have a score, right? Why don't we just sort of like sort based on the score?

But different ranking systems score things differently.

You might end up with one ranking system that ranks between one and 0.9, and the other one does it mostly between 0.2 and 0.3:

| Document | Ranking System 1 | Ranking System 2 |
| -------- | ---------------- | ---------------- |
| Doc A    | 0.95             | 0.21             |
| Doc B    | 0.87             | 0.35             |
| Doc C    | 0.91             | 0.18             |
| Doc D    | 0.78             | 0.42             |

If we just sort based on the score, we'll end up with a list that's dominated by the first ranking system.

## Reciprocal Rank Fusion

The algorithm that I've chosen to show you is the reciprocal rank fusion algorithm. The way it works is it takes each element and checks its relative position in its own ranking system.

It then adds those contributions up together, and you end up with a list of documents where the best ones are floated to the top.

You can look at the code here in [`utils.ts`](./api/utils.ts):

```ts
const RRF_K = 60;

export function reciprocalRankFusion(
  rankings: { filename: string; content: string }[][],
): { filename: string; content: string }[] {
  const rrfScores = new Map<string, number>();
  const documentMap = new Map<
    string,
    { filename: string; content: string }
  >();

  // Process each ranking list
  rankings.forEach((ranking) => {
    ranking.forEach((doc, rank) => {
      // Get current RRF score for this document
      const currentScore = rrfScores.get(doc.filename) || 0;

      // Add contribution from this ranking list
      const contribution = 1 / (RRF_K + rank);
      rrfScores.set(doc.filename, currentScore + contribution);

      // Store document reference
      documentMap.set(doc.filename, doc);
    });
  });

  // Sort by RRF score (descending)
  return Array.from(rrfScores.entries())
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
    .map(([docId]) => documentMap.get(docId)!);
}
```

## Usage

In terms of usage, we can call this reciprocal rank fusion passing in the BM25 search results and the embedding search results.

```ts
// search.ts
export const searchTypeScriptDocs = async (opts: {
  keywordsForBM25: string[];
  embeddingsQuery: string;
}) => {
  const bm25SearchResults = await searchTypeScriptDocsViaBM25(
    opts.keywordsForBM25,
  );

  const embeddingsSearchResults =
    await searchTypeScriptDocsViaEmbeddings(
      opts.embeddingsQuery,
    );

  const rrfResults = reciprocalRankFusion([
    bm25SearchResults,
    embeddingsSearchResults,
  ]);

  return rrfResults;
};
```

This will give us back a list of documents. We can then take these search results and just clip off the top five or top 10 or however many we fancy, and then just pass those into our LLM.

```ts
// In chat.ts
const topSearchResults = searchResults.slice(0, 5);

console.log(topSearchResults.map((result) => result.filename));
```

I recommend you give this a go locally and see if this improves based on the two previous setups we found, and see if there are any test cases that this one passes and the others don't really work on.

Have a bit of a play, and I will see you in the next one.

## Steps To Complete

- [ ] Explore the reciprocal rank fusion (RRF) algorithm in the codebase, particularly in the [`utils.ts`](./api/utils.ts) file

- [ ] Understand how RRF combines results from different ranking systems (BM25 and embeddings)

- [ ] Try different queries to see how the combined ranking system performs

- [ ] Compare the results with previous setups that only used BM25 or only used embeddings

- [ ] Look for test cases where this combined approach works better than either individual approach

- [ ] Check the console logs to see which documents are being retrieved for different queries
