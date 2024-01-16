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

	// Initialization method for the Logger class
	async init(logChannel: TextChannel) {
		// Assigning the provided log channel to the logChannel property
		this.logChannel = logChannel;

		// Setting up an interval to periodically send log messages to the channel
		setInterval(() => {
			// Check if there are any log messages in the pool
			if (this.logPool.length === 0) return;

			// Concatenate log messages into a single string separated by newlines
			const logMessage = this.logPool.join("\n");

			// Clearing the log pool
			this.logPool.length = 0;

			// Sending the concatenated log message to the log channel
			this.logChannel.send(logMessage);
		}, 1500); // Sending log messages every 1.5 seconds
	}

	// Method for logging messages
	log(logMessage: string) {
		// Log the message to the console with the default prefix and without bold formatting
		console.log(`${this.defaultPrefix} ${logMessage.replaceAll("**", "")}`);

		// Pushing the modified log message to the log pool
		this.logPool.push(`${this.defaultPrefix} ${logMessage}`);
	}
}
