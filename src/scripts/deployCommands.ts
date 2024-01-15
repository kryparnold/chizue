import { REST, Routes } from "discord.js";
import { config as envConfig } from "dotenv";
envConfig();
import config from "../config";
import { readdirSync } from "fs";
import path from "node:path";

const commands = [];
/* 
// TODO - /kryp - admin commands
// Kryp Commands
    // TODO - /kryp quit - to quit the bot safely
    // TODO - /kryp add-word {word} {language} - to add words
    // TODO - /kryp announce {announcement message} - to announce something on all game channels
    // TODO - /kryp status {status} - to change the bot's custom status
    // TODO - /kryp emote {emote} - to change bot's current accept emote
*/

const commandFiles = readdirSync(config.commandsPath);

for (const file of commandFiles){
    const filePath = path.join(config.commandsPath, file);
    const command: any = await import(filePath);
    commands.push(command.default.data.toJSON());
}

const rest = new REST().setToken(process.env.TOKEN!);

(async () => {
    try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		const data: any = await rest.put(
			Routes.applicationCommands(config.clientId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();