import path from 'node:path';

console.log(
  `Check out the readme at ${path.join(
    import.meta.dirname,
    'readme.md',
  )}`,
);
