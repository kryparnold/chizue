import { REST, Routes } from "discord.js";
import { config as envConfig } from "dotenv";
envConfig();
import { readdirSync } from "fs";
import path from "node:path";
import { Config } from "@/classes/Config";

const commands = [];
const guildCommands: { [x: string]: { id: string; commands: any[] } } = {};
/* 
// TODO - /kryp - admin commands
// Kryp Commands
    // TODO - /kryp quit - to quit the bot safely
    // TODO - /kryp announce {announcement message} - to announce something on all game channels
    // TODO - /kryp status {status} - to change the bot's custom status
    // TODO - /kryp emote {emote} - to change bot's current accept emote
*/

const config = new Config();

const commandFiles = readdirSync(config.commandsPath);

for (const file of commandFiles) {
	const filePath = path.join(config.commandsPath, file);
	const command: any = (await import(filePath)).default;
	if (command.guildId) {
		if (!guildCommands[command.guildId]) {
			guildCommands[command.guildId] = { id: command.guildId, commands: [] };
		}
		guildCommands[command.guildId].commands.push(command.data.toJSON());
	} else {
		commands.push(command.data.toJSON());
	}
}

const rest = new REST().setToken(process.env.TOKEN!);

(async () => {
	try {
		console.log(`Started refreshing application and guild (/) commands.`);

		const data: any = await rest.put(Routes.applicationCommands(config.clientId), { body: commands });

		let guildCommandCounter = 0;

		Object.values(guildCommands).forEach(async (guild) => {
			guildCommandCounter += guild.commands.length;
			await rest.put(Routes.applicationGuildCommands(config.clientId, guild.id), { body: guild.commands });
		});

		console.log(`Successfully reloaded ${data.length} application, ${guildCommandCounter} guild (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();
