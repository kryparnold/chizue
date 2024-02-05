import { REST, Routes } from "discord.js";
import { config as envConfig } from "dotenv";
envConfig();
import { readdirSync } from "fs";
import path from "node:path";
import { Config } from "@/classes/Config";

const commands: any[] = [];
const guildCommands: { [x: string]: { id: string; commands: any[] } } = {};

const config = new Config();

const commandFiles = readdirSync(config.commandsPath);

for (const file of commandFiles) {
    const filePath = path.join(config.commandsPath, file);
    const command: any = (await import(filePath)).default;
    for (let i = 0; i < command.guildIds.length; i++) {
        const guildId = command.guildIds[i];

        if (!guildCommands[guildId]) {
            guildCommands[guildId] = { id: guildId, commands: [] };
        }
        guildCommands[guildId].commands.push(command.data.toJSON());
    }
    if (!command.guildIds) commands.push(command.data.toJSON());
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
