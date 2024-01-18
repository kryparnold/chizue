// Importing the TextChannel class from the "discord.js" library
import { TextChannel } from "discord.js";

// Logger class definition
export class Logger {
    // Declaration of the logChannel property with the TextChannel type
    public logChannel!: TextChannel;

    // Default prefix for log messages
    private defaultPrefix = "[Chizue]";

    // Array to store log messages before sending them to the channel
    private logPool: string[] = [];
    private logInterval!: NodeJS.Timeout;

    // Initialization method for the Logger class
    async init(logChannel: TextChannel) {
        // Assigning the provided log channel to the logChannel property
        this.logChannel = logChannel;

        // Setting up an interval to periodically send log messages to the channel
        // Sending log messages every 1.5 seconds
        this.logInterval = setInterval(async () => await this.sendLogs(), 1500);
    }

    // Method to send accumulated log messages to the channel
    async sendLogs() {
        // Check if there are any log messages in the pool
        if (this.logPool.length === 0) return;

        // Concatenate log messages into a single string separated by newlines
        const logMessage = this.logPool.join("\n");

        // Clearing the log pool
        this.logPool.length = 0;

        // Sending the concatenated log message to the log channel
        await this.logChannel.send(logMessage);
    }

    // Method to stop the logger, clear logs, and send remaining logs
    async stop() {
        // Stopping the interval with its reference
        clearInterval(this.logInterval);

        // Checking the logs one last time before stopping
        await this.sendLogs();
    }

    // Method for logging messages
    log(logMessage: string) {
        // Log the message to the console with the default prefix and without bold formatting
        console.log(`${this.defaultPrefix} ${logMessage.replaceAll("**", "")}`);

        // Pushing the modified log message to the log pool
        this.logPool.push(`${this.defaultPrefix} ${logMessage}`);
    }
}
