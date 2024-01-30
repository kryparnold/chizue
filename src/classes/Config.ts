import * as configData from "@/config.local.json";
import fs from "fs";
import path from "path";

// Config class definition
export class Config {
    public guildId: string;
    public logChannelId: string;
    public wordLogChannelId: string;
    public processLogChannelId: string;
    public guildLogChannelId: string;
    public clientId: string;
    public clientStatus: string;
    public statsMessageId: string;
    public statsMessageChannelId: string;
    public statsChannelId: string;
    public wordReportChannelId: string;
    public ticketCategoryId: string;
    public announcementRoleId: string;
    public maintenanceRoleId: string;
    public logsPath: string;
    public commandsPath: string;
    public buttonsPath: string;
    public englishWordsPath: string;
    public turkishWordsPath: string;
    public wordleWordsPath: string;
    public acceptEmote: string;
    public denyEmote: string;

    // Constructor to initialize properties with values from the config file
    constructor() {
        // Setting up paths for source and JSON directories
        const basePath = process.cwd();
        const srcPath = path.join(basePath + "/src");
        const jsonPath = path.join(srcPath + "/database/json");

        // Assigning values to class properties from the configuration data
        this.guildId = configData.guildId;
        this.logChannelId = configData.logChannelId;
        this.wordLogChannelId = configData.wordLogChannelId;
        this.processLogChannelId = configData.processLogChannelId;
        this.guildLogChannelId = configData.guildLogChannelId;
        this.clientId = configData.clientId;
        this.clientStatus = configData.clientStatus;
        this.statsMessageId = configData.statsMessageId;
        this.statsMessageChannelId = configData.statsMessageChannelId;
        this.statsChannelId = configData.statsChannelId;
        this.wordReportChannelId = configData.wordReportChannelId;
        this.ticketCategoryId = configData.ticketCategoryId;
        this.announcementRoleId = configData.announcementRoleId;
        this.maintenanceRoleId = configData.maintenanceRoleId;
        this.logsPath = path.join(basePath + configData.logsPath);
        this.commandsPath = path.join(srcPath + configData.commandsPath);
        this.buttonsPath = path.join(srcPath + configData.buttonsPath);
        this.englishWordsPath = path.join(jsonPath + configData.englishWordsPath);
        this.turkishWordsPath = path.join(jsonPath + configData.turkishWordsPath);
        this.wordleWordsPath = path.join(jsonPath + configData.wordleWordsPath);
        this.acceptEmote = configData.acceptEmote;
        this.denyEmote = configData.denyEmote;
    }

    // Async method to save the current configuration to a file
    async save() {
        // Writing the configuration data to the "config.local.json" file
        await fs.promises.writeFile(
            "./src/config.local.json",
            //@ts-ignore
            JSON.stringify({ ...configData.default, clientStatus: this.clientStatus, acceptEmote: this.acceptEmote }, null, 4)
        );
    }
}
