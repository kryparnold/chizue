// Importing the TextChannel class from the "discord.js" library
import { TProcess, Utils, client } from "@/globals";
import { TextChannel } from "discord.js";
import fs from "fs";
import path from "path";

// Logger class definition
export class Logger {
    public logChannel!: TextChannel;
    public processLogChannel!: TextChannel;
    private defaultPrefix = "[Chizue]";

    private logPool: string[] = [];
    private processLogPool: string[] = [];
    private processLogSavePool: string[] = [];
    private intervals: NodeJS.Timeout[] = [];

    // Initialization method for the Logger class
    async init(logChannel: TextChannel, processLogChannel: TextChannel) {
        // Assigning the provided log channel to the logChannel property
        this.logChannel = logChannel;
        this.processLogChannel = processLogChannel;

        this.intervals = [
            setInterval(async () => await this.sendLogs(), 1500),
            setInterval(async () => {
                if (this.processLogSavePool.length < 50) return;
                await this.saveProcessLogs();
            }, 600000),
            setInterval(async () => await this.sendProcessLogs(), 1500),
        ];
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

    // Method to send process log messages to the channel
    async sendProcessLogs() {
        // Check if there any process log messages in the pool
        if (this.processLogPool.length === 0) return;

        // Concatenate process log message into a single string seperated by newlines
        const processLogMessage = this.processLogPool.join("\n");

        // Clearing the log pool
        this.processLogPool.length = 0;

        // Sending the concatenated log message to the channel
        await this.processLogChannel.send(processLogMessage);
    }

    // Method to save process logs to a file related to date
    async saveProcessLogs() {
        // Check if there are any process logs in the pool
        if (this.processLogSavePool.length === 0) return;

        // Get the current date
        const currentDate = new Date();

        // Create a filename based on the current date
        const filename = path.join(client.config.logsPath, `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}.log`);

        // Concatenate process logs into a single string separated by newlines
        const logContent = this.processLogSavePool.join("\n");

        // Clearing the process log pool
        this.processLogSavePool.length = 0;

        // Writing logs to file
        fs.writeFileSync(filename, logContent, { flag: "a" });
    }

    // Method to stop the logger, clear logs, and send remaining logs
    async stop() {
        // Stopping the interval with its reference
        for (let i = 0; i < this.intervals.length; i++) {
            const interval = this.intervals[i];

            clearInterval(interval);
        }

        // Checking the logs one last time before stopping
        await this.sendLogs();
        await this.sendProcessLogs();
        await this.saveProcessLogs();
    }

    // Method for logging processes
    logProcess(process: TProcess, endDate: Date) {
        const startDate = new Date(process.startTime);
        const processDay = Utils.formatDate(startDate.getDate().toString());
        const processMonth = Utils.formatDate((startDate.getMonth() - 1).toString());
        const processHour = Utils.formatDate(startDate.getHours().toString());
        const processMinute = Utils.formatDate(startDate.getMinutes().toString());
        const processSecond = Utils.formatDate(startDate.getSeconds().toString());
        const processMilisecond = Utils.formatDate(startDate.getMilliseconds().toString(), 2);

        let logString = `[${processDay}-${processMonth}-${startDate.getFullYear()}]`;
        logString += ` [${processHour}:${processMinute}:${processSecond}.${processMilisecond}]`;
        logString += ` [${process.type}] [${process.id}]`;

        for (const [key, value] of Object.entries(process.props)) {
            logString += ` ${Utils.capitalize(key)}: ${value.toString()}`;
        }

        logString += ` Took ${process.startTime - endDate.getTime()}`;

        this.processLogPool.push(logString);
        this.processLogSavePool.push(logString);
    }

    // Method for logging messages
    log(logMessage: string) {
        // Log the message to the console with the default prefix and without bold formatting
        console.log(`${this.defaultPrefix} ${logMessage.replaceAll("**", "")}`);

        // Pushing the modified log message to the log pool
        this.logPool.push(`${this.defaultPrefix} ${logMessage}`);
    }
}
