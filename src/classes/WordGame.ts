import { Player, Players, RawWordGameWithPlayers, Utils, client, prisma } from "@/globals";
import { GameMode, GameType, Locales } from "@prisma/client";
import { Message } from "discord.js";

export class WordGame {
	// Class properties
	public id: string;
	private player: string;
	private players: Players;
	public letter: string;
	private limit: number;
	private randomWords: string[];
	public mode: GameMode;
	public locale: Locales;
	private formattedLocale: "tr" | "en";
	readonly type = GameType.WordGame;
	public words: string[];

	// Constructor to initialize the WordGame instance
	constructor(game: RawWordGameWithPlayers) {
		this.id = game.id;
		this.player = game.player;
		this.letter = game.letter;
		this.limit = game.limit;
		this.randomWords = game.randomWords;
		this.mode = game.mode;
		this.locale = game.locale;
		this.formattedLocale = Utils.formatLocale("English");
		this.words = game.words;
		this.players = game.players;
	}

	// Method to handle a player's word input
	async handleWord(message: Message) {
		// Processing the word from the message
		const word = message.content.replace("I", "ı").toLowerCase().replace("i̇", "i");
		// Getting the player or adding a new player
		let player = this.players.getPlayer(message.author.id);

		if (!player) {
			player = await this.addPlayer(message.author.id);
			client.stats.playerCount++;
		}

		// Checking if the word is valid
		const reason = await this.checkWord(word, player.id);

		if (reason) {
			// Deleting the message and providing feedback to the player
			await message.delete().catch(() => {});
			await message.channel.send(`<@${player.id}>, ${reason}`).then(async (reply) =>
				setTimeout(async () => {
					await reply.delete();
				}, 5000)
			);

			return;
		}

		// Checking if the word ends with 'ğ' or is one of the random words
		if (word.endsWith("ğ") || this.randomWords.includes(word)) {
			if (this.words.length >= this.limit && this.mode !== GameMode.Endless) {
				// Reacting to the message with an emoji and restarting the game
				await message.react(client.emotes.accept).catch(() => {});
				await this.restartGame(word, player);
			} else {
				// Deleting the message and providing feedback to the player
				if (this.mode === GameMode.Endless) {
                    if(this.locale === Locales.Turkish){
                        const randomLetter = Utils.randomLetter("tr");
                        this.letter = randomLetter;
                        await message.channel.send(client.getLocalization<true>(this.formattedLocale, "wordGameNewLetter")(randomLetter));
                        await this.save();
                    }
				} else {
					await message.delete().catch(() => {});
					await message.channel
						.send(client.getLocalization<true>(this.formattedLocale, "wordGameNotYet")(this.words.length.toString()))
						.then((reply) => setTimeout(() => reply.delete(), 5000));
				}
			}
		} else {
			// Reacting to the message with an emoji and adding the word to the game
			await message.react(client.emotes.accept).catch(() => {});
			await this.addWord(word, player);
		}
	}

	// Method to add a word to the game
	async addWord(word: string, player: Player) {
		// Calculating word reward based on length
		const wordReward = word.length > 6 ? 1 : word.length / 10;
		// Incrementing word count in statistics
		client.stats.wordCount++;
		// Adding score to the player
		await player.addScore(wordReward);
		// Updating game state
		this.words.push(word);
		this.letter = word.at(-1) as string;
		this.player = player.id;

		await this.save();

		// Logging for debugging
		console.log(`Word added: ${word}`);
		console.log(`Player score updated: ${player.score}`);
	}

	// Method to check the validity of a word
	async checkWord(word: string, playerId: string) {
		const firstLetter = word[0];
		const last40Words = this.words.slice(-40);

		if (playerId === this.player) {
			// Player attempted to play in a row
			return client.getLocalization(this.formattedLocale, "gameSamePlayer");
		} else if (!Utils.Letters[this.formattedLocale].includes(firstLetter) || firstLetter != this.letter) {
			// Invalid starting letter
			return client.getLocalization<true>(this.formattedLocale, "wordGameInvalidLetter")(this.letter);
			//@ts-ignore
		} else if (!client.words[this.formattedLocale][firstLetter].includes(word)) {
			// Invalid word
			return client.getLocalization(this.formattedLocale, "wordGameInvalidWord");
		} else if (this.words.includes(word)) {
			// Word already used in the game
			return client.getLocalization(this.formattedLocale, "wordGameSameWord");
		} else if (this.mode === GameMode.Endless && last40Words.includes(word)) {
			// Word can be used after n times word
			const wordIndex = last40Words.indexOf(word);
			return client.getLocalization<true>(this.formattedLocale, "wordGameNotYetAgain")((40 - wordIndex).toString());
		}
	}

	// Method to restart the game
	async restartGame(word: string, player: Player) {
		// Storing the current word count
		const wordCount = this.words.length;
		// Calculating game and word rewards
		const gameReward = Utils.randomInt(wordCount / 2, wordCount);
		const wordReward = word.length > 6 ? 1 : word.length / 10;
		// Generating a random letter for the next round
		const randomLetter = Utils.randomLetter(this.formattedLocale);

		// Incrementing word count in statistics
		client.stats.wordCount++;

		// Adding total score to the player
		await player.addScore(wordReward + gameReward);

		// Resetting game state
		this.words = [];
		this.letter = randomLetter;
		this.player = player.id;

		// Generating new random words for the next round (if English locale)
		if (this.locale === Locales.English) {
			const randomWords = Utils.getRandomWords(3);
			this.randomWords = randomWords;
		}

		// Saving the updated game state
		await this.save();

		// Logging for debugging
		console.log(`Game restarted with word: ${word}`);
		console.log(`Player total score updated: ${player.score}`);
	}

	// Method to add a new player to the game
	async addPlayer(id: string) {
		const rawPlayer = await prisma.player.create({
			data: {
				id,
				wordGameId: this.id,
			},
		});

		return await this.players.add(rawPlayer);
	}

	// Method to set game mode
	async setMode(mode: GameMode) {
		this.mode = mode;
		await prisma.wordGame.update({
			where: {
				id: this.id,
			},
			data: {
				mode: mode,
			},
		});
        return this;
	}

	// Method to set locale
	async setLocale(locale: Locales) {
		this.locale = locale;
		this.formattedLocale = Utils.formatLocale(locale);

		await prisma.wordGame.update({
			where: {
				id: this.id,
			},
			data: {
				locale,
			},
		});
        return this;
	}

	// Method to save the current game state to the database
	async save() {
		await prisma.wordGame.update({
			where: {
				id: this.id,
			},
			data: {
				letter: this.letter,
				limit: this.limit,
				locale: this.locale,
				mode: this.mode,
				player: this.player,
				randomWords: this.randomWords,
				words: this.words,
			},
		});

		// Logging for debugging
		console.log(`Game state saved. Letter: ${this.letter}, Word count: ${this.words.length}`);
	}
}
