import { REST, Routes, SlashCommandBuilder } from "discord.js";
import { config as envConfig } from "dotenv";
envConfig();
import * as config from "@/config.json";
import { readdirSync } from "fs";
import path from "node:path";

const commands = [];

const commandsPath = path.join(import.meta.dir, "../commands");

const commandFiles = readdirSync(commandsPath);

for (const file of commandFiles){
    const filePath = path.join(commandsPath, file);
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