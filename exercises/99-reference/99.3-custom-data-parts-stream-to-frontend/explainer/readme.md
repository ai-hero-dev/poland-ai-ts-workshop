We're now going to look at streaming these custom data parts to the front end. Let's examine how this works through the code.

First, we define our custom message type:

```ts
export type MyMessage = UIMessage<
  unknown,
  {
    hello: string;
    goodbye: string;
  }
>;
```

This creates a `UIMessage` type that can handle our custom data parts. Our [`API route`](./api/chat.ts) still creates a message stream similar to before:

```ts
const stream = createUIMessageStream<MyMessage>({
  execute: async ({ writer }) => {
    writer.write({
      type: 'data-hello',
      data: 'Bonjour!',
    });
    // More writes...
  },
});
```

On the front end in our [`client components`](./client/components.tsx), we use the `useChat` hook with our custom message type:

```tsx
const { messages, sendMessage } = useChat<MyMessage>({});
```

The messages get passed into our `Message` component which accepts parts with the type `MyMessage['parts']`:

```tsx
export const Message = ({
  role,
  parts,
}: {
  role: string;
  parts: MyMessage['parts'];
}) => {
  // Component implementation
};
```

Inside this component, we handle the custom data parts:

```tsx
{
  parts.map((part) => {
    if (part.type === 'data-hello') {
      return (
        <div
          key={part.id}
          className="flex items-center space-x-3"
        >
          <MessageCircle />
          <span>{part.data}</span>
        </div>
      );
    }
    if (part.type === 'data-goodbye') {
      return (
        <div
          key={part.id}
          className="flex items-center space-x-3"
        >
          <MessageCircleOff />
          <span>{part.data}</span>
        </div>
      );
    }
    return null;
  });
}
```

And when we test this in the frontend, we'll see this output in the browser:

```
{ type: 'data-hello', data: 'Bonjour!' }
{ type: 'data-goodbye', data: 'Au revoir!' }
{ type: 'data-hello', data: 'Guten Tag!' }
{ type: 'data-goodbye', data: 'Auf Wiedersehen!' }
```

This is then rendered by our `Message` component and displays in the frontend.

Check out the video above to see this in action.

Nice work. And I will see you in the next one.
