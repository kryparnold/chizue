import { Events } from "discord.js";
import { client, users } from "./globals";
import { config as envConfig } from "dotenv";
envConfig();

client.once(Events.ClientReady, async (_client) => {
    console.log(_client.user.username + " is online.");

    await client.init();
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isChatInputCommand()) {
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
    }
});

client.login(process.env.TOKEN);

export { client };
