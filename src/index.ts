import { Events } from "discord.js";
import { BotStatuses, client } from "./globals";
import { config as envConfig } from "dotenv";
envConfig();

client.once(Events.ClientReady, async (readyClient) => {
    console.log(readyClient.user.username + " is online.");

    const startTime = new Date().getTime();
    await client.init();
    client.logger.log(
        `Client initialization completed in **${
            new Date().getTime() - startTime
        }ms**.`
    );
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (client.status === BotStatuses.INITIALIZING) return;

    if(interaction.isChatInputCommand()){
        await client.handleCommand(interaction);
    }else if(interaction.isButton()){
        await client.handleButton(interaction);
    }
});

client.login(process.env.TOKEN);

export { client };
