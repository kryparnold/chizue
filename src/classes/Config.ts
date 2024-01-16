import * as config from "@/config.json";
import fs from "fs";

export class Config {
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

	constructor() {
        const srcPath = process.cwd() + "/src";
        const jsonPath = srcPath + "/database/json";
        const configData = config;

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

    async save() {
        await fs.promises.writeFile("../config.json",JSON.stringify({
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
            denyEmote: this.denyEmote
        }));
    }
}
