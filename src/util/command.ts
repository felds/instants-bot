import { Message } from "discord.js";
import { logger } from "../logging";
import { Queue } from "../queue";
import { importDir } from "./fs";

export type ProcessCommandCallback = (
  message: Message,
  queue: Queue,
  args: string[],
  allCommands?: Command[],
) => Promise<void>;

export type Command = {
  name: string;
  aliases: string[];
  description: string;
  process: ProcessCommandCallback;
};

export async function createCommandRunner(
  folder: string,
  defaultCommandName: string,
): Promise<ProcessCommandCallback> {
  const commands: Command[] = await importDir<{ command: Command }>(folder)
    .then((modules) => modules.map((module) => module.command))
    .catch((err) => {
      logger.fatal("Couldn't load command.", { err });
      process.exit(1);
    });

  return async (message: Message, queue: Queue, args: string[]) => {
    // try every handle
    for (const command of commands) {
      if (commandRespondsTo(command, args)) {
        return await command.process(message, queue, args, commands);
      }
    }

    // it wasn't handled. try default command.
    const defaultCommand =
      defaultCommandName && commands.find((c) => c.name === defaultCommandName);
    if (defaultCommand) {
      return await defaultCommand.process(message, queue, args, commands);
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
