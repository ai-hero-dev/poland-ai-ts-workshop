import * as readline from 'readline';

export const listenForKeyPresses = (opts: {
  onKeyPress: (key: string) => void;
  onForwardChunkToChild: (chunk: any) => void;
  onKill: () => void;
}) => {
  // Configure stdin to emit keypress events
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  // Set up readline interface for better key handling
  readline.emitKeypressEvents(process.stdin);

  const keypressHandler = (chunk: string, key: any) => {
    if (key) {
      opts.onKeyPress(key);
    }

    // Handle ctrl+c - send to child process if available, otherwise exit
    if (
      (key.ctrl && key.name === 'c') ||
      (key.meta && key.name === 'c') ||
      (key.name === 'q' && key.meta) ||
      (key.name === 'q' && key.ctrl)
    ) {
      opts.onKill();
    }

    // Forward other input to child process if available
    if (chunk) {
      opts.onForwardChunkToChild(chunk);
    }
  };

  process.stdin.on('keypress', keypressHandler);

  const dispose = handleKeypressCleanup();

  return () => {
    dispose();
    process.stdin.removeListener('keypress', keypressHandler);
  };
};

const handleKeypressCleanup = () => {
  // Handle different termination signals
  process.on('SIGINT', cleanup);

  process.on('SIGTERM', cleanup);

  process.on('SIGHUP', cleanup);

  const uncaughtExceptionHanlder = (error: Error) => {
    console.error('Uncaught Exception:', error);
    cleanup();
  };
  process.on('uncaughtException', uncaughtExceptionHanlder);

  const unhandledRejectionHandler = (
    reason: any,
    promise: any,
  ) => {
    console.error(
      'Unhandled Rejection at:',
      promise,
      'reason:',
      reason,
    );
    cleanup();
  };

  process.on('unhandledRejection', unhandledRejectionHandler);

  // Cleanup function
  function cleanup() {
    process.stdin.setRawMode(false);
    process.stdin.pause();
    process.exit(0);
  }

  return () => {
    // Set raw mode to false to prevent the terminal from being messed up
    process.stdin.setRawMode(false);
    process.stdin.pause();

    // Remove event listeners
    process.removeListener('SIGINT', cleanup);
    process.removeListener('SIGTERM', cleanup);
    process.removeListener('SIGHUP', cleanup);
    process.removeListener(
      'uncaughtException',
      uncaughtExceptionHanlder,
    );
    process.removeListener(
      'unhandledRejection',
      unhandledRejectionHandler,
    );
  };
};
