I wanted to show you the property called `partialObjectStream` that comes from `streamObject`. We have a `streamObject` call here, which is generating test data for an application - a large list of users.

```ts
const result = streamObject({
  model: google('gemini-2.0-flash-001'),
  prompt:
    'You are generating test data for an application. Generate a large list of users.',
  schema: z.object({
    users: z.array(
      z.object({
        name: z.string(),
        email: z.string(),
        age: z.number(),
      }),
    ),
  }),
});
```

We're passing in a schema where the users are an array of `z.object` with name, email, and age properties. They're pretty much self-explanatory, so I haven't added any descriptions here.

Then what we're going to do is process each part of this `partialObjectStream`:

```ts
for await (const part of result.partialObjectStream) {
  await setTimeout(1000);
  console.clear();
  console.log(part);
}
```

This is the important part here. Each `part` is a partial version of the object that will eventually be created. Unlike text streams where text is streamed delta by delta, here we get the entire object as it's growing and growing.

If we run this code in our [`main.ts`](./main.ts) file with `npm exercise 101`, we'll see output like this at different stages:

```js
// First iteration
{
}

// Second iteration
{
  users: [];
}

// Third iteration
{
  users: [{ name: 'John Doe' }];
}

// Fourth iteration
{
  users: [{ name: 'John Doe', email: 'john@example.com' }];
}

// Fifth iteration
{
  users: [
    { name: 'John Doe', email: 'john@example.com', age: 32 },
  ];
}

// Later iterations add more users
{
  users: [
    { name: 'John Doe', email: 'john@example.com', age: 32 },
    { name: 'Jane Smith' },
  ];
}
```

What we saw is that these objects stream in property by property. You'll get situations where only some properties are available on a user, while others are still undefined.

The type of this `part` is a partial object. If we try to access properties:

```ts
// TypeScript will warn about this
const age = part.users[0].age; // Error: part.users is possibly undefined

// Safer approach with optional chaining
const age = part.users?.[0]?.age;
```

It's basically guaranteed to be an empty object at least, but beyond that, any properties on it might not exist. So when you're dealing with these partial object streams, just remember the shape of `part`.

Nice work, and I'll see you in the next one.
