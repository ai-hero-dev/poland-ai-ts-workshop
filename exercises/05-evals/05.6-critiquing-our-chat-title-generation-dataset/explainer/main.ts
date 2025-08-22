import path from 'node:path';

console.log(
  `Read: ${path.join(import.meta.dirname, 'readme.md')}`,
);
