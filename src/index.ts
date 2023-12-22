import { Events } from "discord.js";
import { BotStatuses, client } from "./globals";
import { config as envConfig } from "dotenv";
envConfig();

client.once(Events.ClientReady, async (readyClient) => {
    console.log(readyClient.user.username + " is online.");

    const startTime = new Date().getTime();
    await client.init();
    client.logger.log(`Client initialization completed in **${new Date().getTime() - startTime}ms**.`);
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (
        !interaction.isChatInputCommand() ||
        client.status === BotStatuses.INITIALIZING
    ) return;
        const command = client.commands.get(interaction.commandName);

    if (!command) {
        throw "Command not found: " + interaction.commandName;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: "There was an error while executing this command!",
                ephemeral: true,
            });
        } else {
            await interaction.reply({
                content: "There was an error while executing this command!",
                ephemeral: true,
            });
        }
    }
});

client.login(process.env.TOKEN);

export { client };
