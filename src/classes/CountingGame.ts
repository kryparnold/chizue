import { prisma } from "@/globals";
import { Locales, CountingGame as CountingGameModel, GameType } from "@prisma/client";
import { Message } from "discord.js";

export class CountingGame {
	private id: string;
	private player: string;
	private locale: Locales;
    private multiplier: number;
    public type: GameType;
    private recentNumber: number;

	constructor(game: CountingGameModel) {
		this.id = game.id;
		this.player = game.player;
		this.locale = game.locale;
        this.multiplier = game.multiplier;
        this.type = game.type;
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
                locale: this.locale,
                player: this.player,
                multiplier: this.multiplier,
                recentNumber: this.recentNumber,
            }
        })
    }
}