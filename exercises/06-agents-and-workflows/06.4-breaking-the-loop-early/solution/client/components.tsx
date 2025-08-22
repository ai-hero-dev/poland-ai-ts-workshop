import React, { type ReactNode } from 'react';
import type { MyMessage } from '../api/chat.ts';
import ReactMarkdown from 'react-markdown';

export const Wrapper = (props: {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {props.children}
    </div>
  );
};

export const Message = ({
  role,
  parts,
}: {
  role: string;
  parts: MyMessage['parts'];
}) => (
  <div className="my-4">
    {parts.map((part) => {
      if (part.type === 'data-slack-message') {
        return (
          <div key={part.id} className="mb-4">
            <h2 className="text-gray-300 text-sm mb-1">
              First draft
            </h2>
            <p className="text-gray-400 text-xs">{part.data}</p>
          </div>
        );
      }

      if (part.type === 'data-slack-message-feedback') {
        return (
          <div key={part.id} className="mb-4">
            <h2 className="text-gray-300 text-sm mb-1">
              Feedback
            </h2>
            <p className="text-gray-400 text-xs">{part.data}</p>
          </div>
        );
      }

      return null;
    })}

    <ReactMarkdown>
      {(role === 'user' ? 'User: ' : 'AI: ') +
        parts
          .map((part) => {
            if (part.type === 'text') {
              return part.text;
            }
            return '';
          })
          .join('')}
    </ReactMarkdown>
  </div>
);

export const ChatInput = ({
  input,
  onChange,
  onSubmit,
  disabled,
}: {
  input: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled?: boolean;
}) => (
  <form onSubmit={onSubmit}>
    <input
      className={`fixed bottom-0 w-full max-w-md p-2 mb-8 border-2 border-zinc-700 rounded shadow-xl bg-gray-800 ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      value={input}
      placeholder={
        disabled
          ? 'Please handle tool calls first...'
          : 'Say something...'
      }
      onChange={onChange}
      disabled={disabled}
      autoFocus
    />
  </form>
);
