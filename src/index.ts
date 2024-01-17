// Importing necessary modules and components from external files
import { Events } from "discord.js";
import { BotStatuses, client } from "@/globals";

// Importing and configuring environment variables using dotenv
import { config as envConfig } from "dotenv";
envConfig();

// Event handler for when the Discord client is ready
client.once(Events.ClientReady, async (readyClient) => {
    // Recording the start time for measuring initialization duration
    const startTime = new Date().getTime();

    // Initializing the client and waiting for completion
    await client.init();
    // Making the bot status Stable after initializing completion
    client.status = BotStatuses.Stable;

    // Logging the completion of client initialization with the duration
    client.logger.log(`Client initialization completed in **${new Date().getTime() - startTime}ms**.`);
});

// Event handler for when a message is created in a channel
client.on(Events.MessageCreate, async (message) => {
    if (client.status !== BotStatuses.Stable) return; // Check if the client is not stable

    // Process the message by sending it to the client for handling games
    await client.handleMessage(message);
});

// Event handler for when an interaction (command or button) is created
client.on(Events.InteractionCreate, async (interaction) => {
    // Check if the client is not stable, and if so, return early
    if (client.status !== BotStatuses.Stable) return;

    // Check if the interaction is a chat input command
    if (interaction.isChatInputCommand()) {
        // Handle the command
        await client.handleCommand(interaction);
    } else if (interaction.isButton()) {
        // Handle the button interaction
        await client.handleButton(interaction);
    }
});

// Log in to Discord using the provided bot token
client.login(process.env.TOKEN);
