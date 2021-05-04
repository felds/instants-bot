import { Message } from "discord.js";
import { logger } from "../logging";
import { importDir } from "./fs";

export type ProcessCommandCallback<T = undefined> = (
  args: string[],
  message: Message,
  allCommands: Command[],
  options: T,
) => Promise<void>;

export type Command<T = unknown> = {
  name: string;
  aliases: string[];
  description: string;
  process: ProcessCommandCallback<T>;
};

export type Processor<T> = (
  args: string[],
  message: Message,
  options?: T,
) => Promise<void>;

export async function createCommandRunner<T = unknown>(
  folder: string,
  defaultCommandName: string,
): Promise<Processor<T>> {
  const commands: Command[] = await importDir<{ command: Command }>(folder)
    .then((modules) => modules.map((module) => module.command))
    .catch((err) => {
      logger.fatal("Couldn't load command.", { err });
      process.exit(1);
    });

  return async (args: string[], message: Message, options?: T) => {
    // try every handle
    for (const command of commands) {
      if (commandRespondsTo(command, args)) {
        return await command.process(args.slice(1), message, commands, options);
      }
    }

    // it wasn't handled. try default command.
    const defaultCommand =
      defaultCommandName && commands.find((c) => c.name === defaultCommandName);
    if (defaultCommand) {
      return await defaultCommand.process(args, message, commands, options);
    }
  };
}

export function commandRespondsTo(command: Command, args?: string[]): boolean {
  return (
    command.aliases.length > 0 &&
    args !== undefined &&
    command.aliases.includes(args[0])
  );
}
