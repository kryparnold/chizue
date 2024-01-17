// Importing the configuration data from the "config.json" file using the alias '@'
import * as config from "@/config.json";

// Importing the 'fs' module for file system operations
import fs from "fs";

// Config class definition
export class Config {
    // Properties to store various configuration values
    public guildId: string;
    public logChannelId: string;
    public clientId: string;
    public clientStatus: string;
    public statsMessageId: string;
    public statsMessageChannelId: string;
    public statsChannelId: string;
    public wordReportChannelId: string;
    public wordLogChannelId: string;
    public commandsPath: string;
    public buttonsPath: string;
    public statsPath: string;
    public englishWordsPath: string;
    public turkishWordsPath: string;
    public wordleWordsPath: string;
    public acceptEmote: string;
    public denyEmote: string;

    // Constructor to initialize properties with values from the config file
    constructor() {
        // Setting up paths for source and JSON directories
        const srcPath = process.cwd() + "/src";
        const jsonPath = srcPath + "/database/json";

        // Extracting configuration data from the imported 'config' module
        const configData = config;

        // Assigning values to class properties from the configuration data
        this.guildId = configData.guildId;
        this.logChannelId = configData.logChannelId;
        this.clientId = configData.clientId;
        this.clientStatus = configData.clientStatus;
        this.statsMessageId = configData.statsMessageId;
        this.statsMessageChannelId = configData.statsMessageChannelId;
        this.statsChannelId = configData.statsChannelId;
        this.wordReportChannelId = configData.wordReportChannelId;
        this.wordLogChannelId = configData.wordLogChannelId;
        this.commandsPath = srcPath + configData.commandsPath;
        this.buttonsPath = srcPath + configData.buttonsPath;
        this.statsPath = jsonPath + configData.statsPath;
        this.englishWordsPath = jsonPath + configData.englishWordsPath;
        this.turkishWordsPath = jsonPath + configData.turkishWordsPath;
        this.wordleWordsPath = jsonPath + configData.wordleWordsPath;
        this.acceptEmote = configData.acceptEmote;
        this.denyEmote = configData.denyEmote;
    }

    // Async method to save the current configuration to a file
    async save() {
        // Writing the configuration data to the "config.json" file
        await fs.promises.writeFile(
            "../config.json",
            JSON.stringify({
                guildId: this.guildId,
                logChannelId: this.logChannelId,
                clientId: this.clientId,
                clientStatus: this.clientStatus,
                statsMessageId: this.statsMessageId,
                statsMessageChannelId: this.statsMessageChannelId,
                statsChannelId: this.statsChannelId,
                wordReportChannelId: this.wordReportChannelId,
                wordLogChannelId: this.wordLogChannelId,
                commandsPath: this.commandsPath,
                buttonsPath: this.buttonsPath,
                statsPath: this.statsPath,
                englishWordsPath: this.englishWordsPath,
                turkishWordsPath: this.turkishWordsPath,
                wordleWordsPath: this.wordleWordsPath,
                acceptEmote: this.acceptEmote,
                denyEmote: this.denyEmote,
            })
        );
    }
}
