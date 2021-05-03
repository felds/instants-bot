export type Command = {
  aliases: string[];
  description: string;
  process: (message: Message, queue: Queue, args: string[]) => void;
};
