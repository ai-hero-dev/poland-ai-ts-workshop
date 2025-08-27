So far, we've been persisting our data in a pretty naive way by saving it to a JSON file and reading it back. This isn't how real applications handle data persistence. Let's explore a more production-ready approach.

## `parts` as a JSON blob

In our `main.ts` file, we have a message with a type of `MyUIMessage`. This represents a slice of an application that might contain tool calls and custom data parts. Each message has an `id`, a `role`, and an array of `parts`.

While `id` and `role` are straightforward to represent in a database, the `parts` array is more complex because it contains different types of elements with varying properties.

```typescript
const message: MyUIMessage = {
  id: '123',
  role: 'user',
  parts: [
    {
      type: 'text',
      text: 'Hello!',
    },
    {
      type: 'reasoning',
      text: 'I am thinking...',
    },
    {
      type: 'tool-getWeatherInformation',
      state: 'output-available',
      toolCallId: '123',
      input: {
        city: 'London',
      },
      output: {
        city: 'London',
        weather: 'sunny',
      },
    },
  ],
};
```

You might be tempted to store these parts as a JSON blob in your Postgres database. However, this approach has significant drawbacks:

1. The JSON blob isn't managed by Postgres - it's just literal data
2. The structure isn't guaranteed over time, making migrations difficult
3. It's inefficient for filtering or displaying only certain parts

## `parts` as a normalized table

Instead, we'll use a separate table for parts. In `schema.ts`, we have an example schema written using [Drizzle ORM](https://orm.drizzle.team/), which helps design and query database tables.

```typescript
export const chats = pgTable('chats', {
  id: varchar()
    .primaryKey()
    .$defaultFn(() => generateId()),
});

export const messages = pgTable(
  'messages',
  {
    id: varchar()
      .primaryKey()
      .$defaultFn(() => generateId()),
    chatId: varchar()
      .references(() => chats.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    role: varchar().$type<MyUIMessage['role']>().notNull(),
  },
  // indexes omitted for brevity
);
```

For the parts, we create a dedicated table with fields for each type of part. This table uses SQL constraints to ensure the correct fields exist for each part type:

```typescript
export const parts = pgTable(
  'parts',
  {
    id: varchar()
      .primaryKey()
      .$defaultFn(() => generateId()),
    messageId: varchar()
      .references(() => messages.id, { onDelete: 'cascade' })
      .notNull(),
    type: varchar().$type<MyUIMessagePart['type']>().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    order: integer().notNull().default(0),

    // Text fields
    text_text: text(),

    // Reasoning fields
    reasoning_text: text(),

    // Many more fields for different part types...
  },
  (t) => [
    // Check constraints for each part type
    check(
      'text_text_required_if_type_is_text',
      sql`CASE WHEN ${t.type} = 'text' THEN ${t.text_text} IS NOT NULL ELSE TRUE END`,
    ),
    // More constraints...
  ],
);
```

The constraints ensure that, for example, when a part's type is `text`, the `text_text` field must exist. Each part type has its own constraint to enforce data integrity.

## Mapping between UI and database representations

When we run our mapping function with the original message, we get an array of database parts that look very different from the UI parts:

```typescript
const dbMessageParts = mapUIMessagePartsToDBParts(
  message.parts,
  message.id,
);

console.dir(dbMessageParts, { depth: null });
```

For example, a UI part with `type: 'text'` and `text: 'Hello!'` becomes a database part with `type: 'text'` and `text_text: 'Hello!'`. Other part types will have their own fields.

This approach requires mapping functions to convert between UI and database representations. The `mapUIMessagePartsToDBParts` function uses a switch case to handle each type:

```typescript
export const mapUIMessagePartsToDBParts = (
  messageParts: MyUIMessagePart[],
  messageId: string,
): MyDBUIMessagePart[] => {
  return messageParts.map((part, index) => {
    switch (part.type) {
      case 'text':
        return {
          messageId,
          order: index,
          type: part.type,
          text_text: part.text,
        };
      // Cases for other part types...
    }
  });
};
```

Similarly, the `mapDBPartToUIMessagePart` function converts database parts back to UI parts.

This structured approach gives us confidence that our message parts maintain their correct structure. While some JSON fields still exist for complex nested data (like tool inputs/outputs), the overall schema is much more robust and easier to reason about.

Try experimenting with different parts in the message object and see how they're represented in the database. You can examine the `schema.ts` file and use AI to help answer questions about the implementation.

The code shown is based on a reference example from the [Vercel AI SDK docs](https://github.com/vercel-labs/ai-sdk-persistence-db), which provides a fully working implementation of this approach.

## Steps To Complete

- [ ] Examine the structure of the `message` object in [`main.ts`](./main.ts) to understand the UI representation of messages
  - Look at the different part types and their properties
  - Notice how each part type has its own specific structure

- [ ] Study the database schema in [`schema.ts`](./schema.ts) to see how messages and parts are represented
  - Pay attention to the table relationships between chats, messages, and parts
  - Note the constraints that enforce data integrity for each part type

- [ ] Review the mapping functions in [`mapping.ts`](./mapping.ts) that convert between UI and DB representations
  - Understand how `mapUIMessagePartsToDBParts` converts UI parts to DB parts
  - See how `mapDBPartToUIMessagePart` converts DB parts back to UI parts

- [ ] Experiment with the code by modifying the `message` object in [`main.ts`](./main.ts)
  - Add or change parts of different types
  - Run the code with `pnpm run exercise` to see how they're represented in the database

- [ ] Consider the tradeoffs of this approach versus storing parts as a JSON blob
  - Think about data integrity, query efficiency, and migration complexity
  - Reflect on when each approach might be appropriate
