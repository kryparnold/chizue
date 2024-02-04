process.on("uncaughtException", console.error).on("unhandledRejection", console.error);
// Importing necessary modules and components from external files
import { Events } from "discord.js";
import { BotStatuses, Utils, client, prisma } from "@/globals";

// Importing and configuring environment variables using dotenv
import { config as envConfig } from "dotenv";
import { GameType } from "@prisma/client";
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

// Event handler for when a guild is deleted
client.on(Events.GuildDelete, async (guild) => {
    // Log the deleted guild
    await client.logger.logGuild(guild, false);

    // Retrieve game IDs associated with the deleted guild
    const guildGameIds = client.games.getGuildGameIds(guild.id);

    // Iterate through each game ID
    for (let i = 0; i < guildGameIds.length; i++) {
        const gameId = guildGameIds[i];

        // Delete the game associated with the current game ID
        await client.games.delete(gameId);
    }
});

// Event handler for when a channel is deleted
client.on(Events.ChannelDelete, async (channel) => {
    // Delete the game associated with the deleted channel
    await client.games.delete(channel.id);
});

// Event handler for when a member is deleted
client.on(Events.GuildMemberRemove, async (member) => {
    // Retrieve the player associated with the deleted member
    const player = client.players.get(member.id);

    // If the player doesn't exist, return early
    if (!player) return;

    // Retrieve games associated with the guild of the deleted member
    const guildGames = client.games.getGuildGames(member.guild.id);

    // Iterate through each game associated with the guild
    for (let i = 0; i < guildGames.length; i++) {
        const game = guildGames[i];

        // Remove the player from the current game
        await game.removePlayer(player.id);
    }
});

// Event handler for when a message is deleted
client.on(Events.MessageDelete, async (message) => {
    // Get the game associated with the channel where the message was deleted
    const game = client.games.get(message.channelId);

    // Check if there is no game, or the game is not a counting game, or the deleted message is not the recent one in the game
    if (!game || game.type !== GameType.CountingGame || game.recentMessageId !== message.id) return;

    // Format the guild's preferred locale for localization
    const guildLocale = Utils.formatLocale(message.guild?.preferredLocale!);

    // Send a message to the channel indicating that a counting game message was deleted
    await message.channel.send(
        // Use localization to mention the author of the deleted message
        client.getLocalization<true>(guildLocale, "countingGameMessageDeleted")(`<@${message.author?.id}>`) +
            "\n" +
            // Use localization to mention the deleted number in the counting game
            client.getLocalization<true>(guildLocale, "countingGameDeletedNumber")(game.recentNumber.toString())
    );
});

// Event handler for when a guild is added
client.on(Events.GuildCreate, async (guild) => {
    // Log the added guild
    await client.logger.logGuild(guild, true);
});

// Event handler for when a member is added
client.on(Events.GuildMemberAdd, async (member) => {
    // Get auto-role by member's guild id
    const autoRole = await prisma.autoRole.findFirst({ where: { id: member.guild.id } });

    // Return if there is no autoRole for the guild
    if (!autoRole) return;

    // Add the role to the member
    await member.roles.add(autoRole.roleId);
});

// Log in to Discord using the provided bot token
client.login(process.env.TOKEN);
