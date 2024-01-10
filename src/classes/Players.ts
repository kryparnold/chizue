// Importing necessary modules and components from the global namespace and external libraries
import { Player, prisma } from "@/globals";
import { Collection } from "discord.js";
import { Player as RawPlayer } from "@prisma/client";

// Class definition for managing player instances
export class Players {
    // Private property to store player instances using a Collection
    private cache = new Collection<string, Player>();
    get = this.cache.get;

    // Asynchronous method to initialize the Players instance with an array of raw player data
    async init(players: RawPlayer[]) {
        // Iterating through the array of raw player data and creating Player instances, then adding them to the cache
        players.forEach((player) => this.cache.set(player.id, new Player(player)));
    }

    // Method to retrieve all player instances from the cache
    getAll() {
        return this.cache.map((player) => player);
    }

    // Asynchronous method to create a new player, initializing their entry in the database and adding the player to the cache
    async create(playerId: string, guildId: string, gameId: string) {
        // Creating a new raw player entry in the database
        const newRawPlayer = await prisma.player.create({
            data: {
                id: playerId,
                scores: {
                    [guildId]: {
                        [gameId]: 0,
                    },
                },
            },
        });

        // Creating a new Player instance from the raw player data
        const player = new Player(newRawPlayer);

        // Adding the player to the cache using their ID as the key
        this.cache.set(playerId, player);

        // Initializing the player's game entry in the database and cache
        player.addGame(guildId, gameId);

        // Returning the created player instance
        return player;
    }
}
