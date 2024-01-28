// Import necessary modules and types from Prisma, Discord.js, and local files
import { WordGame as RawWordGame, CountingGame as RawCountingGame, Player as RawPlayer, GameType, Prisma } from "@prisma/client";
import { Collection, TextChannel } from "discord.js";
import { CountingGame, GuildPlayers, Player, Utils, WordGame, client, prisma } from "@/globals";

// Define a class called Games to manage and interact with WordGame and CountingGame instances
export class Games {
    // Private property to store a cache of WordGame and CountingGame instances
    private cache = new Collection<string, WordGame | CountingGame>();

    // Initialization method, takes arrays of raw WordGame, Player, and CountingGame data
    async init(wordGames: RawWordGame[], players: Player[], countingGames: RawCountingGame[]) {
        // Initialize WordGame instances
        wordGames.forEach(async (game) => {
            // Create Players instance and initialize it with filtered player data
            const guildPlayers = new GuildPlayers();
            await guildPlayers.init(
                players.filter((player) => {
                    return Object.keys(Object.values(player.scores)[0]).includes(game.id);
                })
            );
            // Create new WordGame instance and add it to the cache
            const newGame = new WordGame({ ...game, players: guildPlayers });

            this.cache.set(game.id, newGame);
        });

        // Initialize CountingGame instances
        countingGames.forEach(async (game) => {
            // Create new CountingGame instance and add it to the cache
            const newGame = new CountingGame(game);

            this.cache.set(game.id, newGame);
        });
    }

    // Method to create a new WordGame and add it to the cache
    async createWordGame(game: Prisma.WordGameCreateInput) {
        // Create a new WordGame in the database using Prisma
        const newRawGame = await prisma.wordGame.create({
            data: game,
        });

        // Create a new WordGame instance with an empty Players instance
        const newGame = new WordGame({ ...newRawGame, players: new GuildPlayers() });

        // Add the new WordGame instance to the cache
        this.cache.set(newGame.id, newGame);

        // Get the game channel and send a message indicating the start of the WordGame
        const gameChannel = client.channels.cache.get(newGame.id) as TextChannel;
        await gameChannel.send(client.getLocalization<true>(Utils.formatLocale(newGame.locale), "wordGameStarted")(newGame.letter));

        // Return the new WordGame instance
        return newGame;
    }

    // Method to create a new CountingGame and add it to the cache
    async createCountingGame(game: Prisma.CountingGameCreateInput) {
        // Create a new CountingGame in the database using Prisma
        const newRawGame = await prisma.countingGame.create({
            data: game,
        });

        // Create a new CountingGame instance
        const newGame = new CountingGame(newRawGame);

        // Add the new CountingGame instance to the cache
        this.cache.set(newGame.id, newGame);

        // Get the game channel and send a message indicating the start of the CountingGame
        const gameChannel = client.channels.cache.get(newGame.id) as TextChannel;
        await gameChannel.send(
            client.getLocalization<true>(Utils.formatLocale(gameChannel.guild.preferredLocale), "countingGameStarted")(newGame.multiplier.toString())
        );

        // Return the new CountingGame instance
        return newGame;
    }

    // Method to get the total number of games in the cache
    count() {
        return this.cache.size;
    }

    // Method to delete a game from the cache and database
    async delete(gameId = "") {
        // Get the game instance from the cache
        const game = this.cache.get(gameId);

        // Check if the game instance exists
        if (!game) {
            throw "Game not found with id: " + gameId;
        }

        // Determine the game type and delete it from the database using Prisma
        if (game.type === GameType.WordGame) {
            const players = game.players.getAll();

            for (let i = 0; i < players.length; i++) {
                const player = players[i];

                await player.removeGame(game.guildId, game.id);
            }

            await prisma.wordGame.delete({ where: { id: gameId } });
        } else if (game.type === GameType.CountingGame) {
            await prisma.countingGame.delete({ where: { id: gameId } });
        }

        // Remove the game instance from the cache
        this.cache.delete(gameId);
    }

    // Method to get a game instance from the cache by its ID
    get(gameId: string) {
        return this.cache.get(gameId);
    }

    // Method to get all the game instances from the cache by its guild ID
    getGuildGames(guildId: string) {
        return this.cache.filter((game) => game.guildId === guildId && game.type === GameType.WordGame).map((game) => game) as WordGame[];
    }

    // Method to get all the game ids from the cache
    getIds() {
        return this.cache.map((game) => game.id);
    }
}
