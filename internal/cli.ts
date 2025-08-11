import { existsSync } from 'fs';
import { Command } from 'commander';
import path from 'path';
import { readdir } from 'fs/promises';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import prompts from 'prompts';
import { listenForKeyPresses } from './handle-keypress.ts';

const program = new Command();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

program
  .arguments('<exerciseNumber>')
  .action(async (exerciseNumber: string) => {
    const exercisesDir = path.resolve(
      __dirname,
      '..',
      'exercises',
    );

    if (!existsSync(exercisesDir)) {
      console.error(
        `Exercises directory not found at ${exercisesDir}`,
      );
      process.exit(1);
    }

    const sections = await readdir(exercisesDir);
    let foundExerciseDir: string | null = null;

    // Search through each section to find the exercise
    for (const section of sections) {
      const sectionPath = path.resolve(exercisesDir, section);
      const exercises = await readdir(sectionPath);

      // Find the exercise that contains the exercise number
      const exerciseDir = exercises.find((exercise) => {
        return exercise.includes(exerciseNumber);
      });

      if (exerciseDir) {
        foundExerciseDir = path.resolve(
          sectionPath,
          exerciseDir,
        );
        break;
      }
    }

    if (!foundExerciseDir) {
      console.error(
        `Could not find exercise ${exerciseNumber} in any section.`,
      );
      process.exit(1);
    }

    // Get all directories inside the exercise (problem/solution)
    const exerciseContents = await readdir(foundExerciseDir, {
      withFileTypes: true,
    });
    const directories = exerciseContents
      .filter((item) => item.isDirectory())
      .map((dir) => dir.name);

    if (directories.length === 0) {
      console.error(
        `No directories found in exercise ${exerciseNumber}.`,
      );
      process.exit(1);
    }

    let selectedDirectory: string;

    // If there's only one directory, use it automatically
    if (directories.length === 1) {
      selectedDirectory = directories[0]!;
      console.log(
        `Auto-selecting directory: ${selectedDirectory}`,
      );
    } else {
      // Prompt user to choose which directory to run
      const response = await prompts({
        type: 'autocomplete',
        name: 'selectedDirectory',
        message: `Choose which directory to run for exercise ${exerciseNumber}:`,
        choices: directories.map((dir) => ({
          title: dir,
          value: dir,
        })),
      });

      if (!response.selectedDirectory) {
        console.log('No directory selected. Exiting.');
        process.exit(0);
      }

      selectedDirectory = response.selectedDirectory;
    }

    const selectedDirectoryFullPath = path.resolve(
      foundExerciseDir,
      selectedDirectory,
    );
    const mainFilePath = path.resolve(
      selectedDirectoryFullPath,
      'main.ts',
    );

    const envFilePath = path.resolve(__dirname, '..', '.env');

    if (!existsSync(mainFilePath)) {
      console.error(
        `Could not find main.ts file in ${selectedDirectory} for exercise ${exerciseNumber}.`,
      );
      process.exit(1);
    }

    console.log(
      `Running exercise ${exerciseNumber} from ${mainFilePath}`,
    );

    const tsxExecutablePath = path.resolve(
      __dirname,
      '..',
      'node_modules',
      '.bin',
      'tsx',
    );

    let dispose: (() => void) | null = null;

    try {
      // Use spawn instead of execSync for non-blocking execution with input forwarding
      const childProcess = spawn(
        tsxExecutablePath,
        ['--env-file=' + envFilePath, mainFilePath],
        {
          stdio: ['pipe', 'inherit', 'inherit'],
          cwd: selectedDirectoryFullPath,
        },
      );

      // Set up key press listener with child process forwarding
      dispose = listenForKeyPresses({
        onKeyPress: (key) => {},
        onForwardChunkToChild: (chunk) => {
          childProcess.stdin.write(chunk);
        },
        onKill: () => {
          childProcess.kill();
          process.exit(0);
        },
      });

      // Handle child process events
      childProcess.on('error', (error) => {
        console.error('Failed to start child process:', error);
        dispose?.();
        process.exit(1);
      });

      childProcess.on('exit', (code, signal) => {
        if (code !== null) {
          console.log(`Child process exited with code ${code}`);
        } else if (signal !== null) {
          console.log(
            `Child process was killed with signal ${signal}`,
          );
        }
        dispose?.();
        process.exit(code || 0);
      });

      // Wait for child process to complete
      await new Promise<void>((resolve, reject) => {
        childProcess.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(
              new Error(
                `Child process exited with code ${code}`,
              ),
            );
          }
        });
      });
    } catch (e) {
      console.error(e);
      dispose?.();
      process.exit(1);
    }

    dispose?.();
  });

program.parse(process.argv);
