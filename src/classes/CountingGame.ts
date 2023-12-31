import { prisma } from "@/globals";
import { CountingGame as CountingGameModel, GameType } from "@prisma/client";
import { Message } from "discord.js";

export class CountingGame {
	private id: string;
	private player: string;
    private multiplier: number;
    public readonly type = GameType.CountingGame;
    private recentNumber: number;

	constructor(game: CountingGameModel) {
		this.id = game.id;
		this.player = game.player;
        this.multiplier = game.multiplier;
        this.recentNumber = game.recentNumber;
	}

    async handleNumber(message: Message){
        // TODO - Add number handling
    }

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