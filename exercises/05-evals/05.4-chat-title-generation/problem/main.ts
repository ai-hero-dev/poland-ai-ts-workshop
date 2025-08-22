import { runVitest } from 'evalite/runner';

await runVitest({
  cwd: import.meta.dirname,
  mode: 'watch-for-file-changes',
  path: undefined,
});
