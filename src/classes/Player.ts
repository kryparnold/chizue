// Importing the Prisma client instance from the global namespace
import { prisma } from "@/globals";

// Importing the Player model from Prisma generated client
import { Player as PlayerModel } from "@prisma/client";

// Defining an interface for scores with dynamic keys
interface IScores {
    [x: string]: {
        [x: string]: number;
    };
}

// Class representing a player with score tracking functionality
export class Player {
    // Properties for player ID, total score, and scores per guild and game
    id: string;
    score: number;
    scores: IScores;

    // Constructor to create a Player instance from a PlayerModel
    constructor(player: PlayerModel) {
        this.id = player.id;
        this.score = player.score;
        this.scores = JSON.parse(player.scores?.toString() as string);
    }

    // Asynchronous method to add a score to the player's total and per-game scores
    async addScore(score: number, guildId: string, gameId: string) {
        this.score += score;
        this.scores[guildId][gameId] += score;
        await this.save();
    }

    // Asynchronous method to initialize a new game entry for the player
    async addGame(guildId: string, gameId: string) {
        // Checking if the guild entry exists in scores, if not, creating it
        if (!this.scores[guildId]) {
            this.scores[guildId] = {};
        }

        // Initializing the game entry with a score of 0
        this.scores[guildId][gameId] = 0;

        // Saving the updated data to the database
        await this.save();
    }

    // Asynchronous method to save the current player data to the database
    async save() {
        await prisma.player.update({
            where: {
                id: this.id,
            },
            data: {
                score: this.score,
                scores: this.scores,
            },
        });
    }
}
