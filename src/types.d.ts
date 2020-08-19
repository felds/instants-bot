type Instant = {
  title: string;
  url: string;
};

interface ICommandHandler {
  /**
   * Checks whether or not the object can handle the command.
   */
  public accepts(): Promise<boolean>;

  /**
   * Process the command.
   */
  public handle(): Promise<void>;
}
