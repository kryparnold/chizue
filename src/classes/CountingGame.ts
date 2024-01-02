import { prisma } from "@/globals";
import { CountingGame as CountingGameModel, GameType } from "@prisma/client";
import { Message } from "discord.js";

export class CountingGame {
	public id: string;
	private player: string;
    public multiplier: number;
    public readonly type = GameType.CountingGame;
    public recentNumber: number;

    // Constructor to initialize the CountingGame instance
	constructor(game: CountingGameModel) {
		this.id = game.id;
		this.player = game.player;
        this.multiplier = game.multiplier;
        this.recentNumber = game.recentNumber;
	}

    async handleNumber(message: Message){
        // TODO - Add number handling
    }

    // Method to set the multiplier
    async setMultiplier(multiplier: number){
        this.multiplier = multiplier;
        await this.save();
        return this;
    }

    // Method to save the current game state to the database
    async save(){
        await prisma.countingGame.update({
            where: {
                id: this.id
            },
            data: {
                player: this.player,
                multiplier: this.multiplier,
                recentNumber: this.recentNumber,
            }
        })
    }
}