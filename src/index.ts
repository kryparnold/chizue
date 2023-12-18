import { Events } from "discord.js";
import { client, users } from "./globals";
import { config as envConfig } from "dotenv";
envConfig();

client.once(Events.ClientReady, async (_client) => {
    console.log(_client.user.username + " is online.");

    await client.init();
});

client.login(process.env.TOKEN);

export { client };