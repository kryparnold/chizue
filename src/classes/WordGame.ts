import { FormattedLocale, GuildPlayers, Player, RawWordGameWithPlayers, Utils, client, prisma } from "@/globals";
import { GameMode, GameType, Locales } from "@prisma/client";
import { GuildTextBasedChannel, Message } from "discord.js";

export class WordGame {
    public id: string;
    private name: string;
    private recentPlayerId: string;
    public guildId: string;
    public players: GuildPlayers;
    public letter: string;
    private limit: number;
    private randomWords: string[];
    public mode: GameMode;
    public locale: Locales;
    public formattedLocale: FormattedLocale;
    readonly type = GameType.WordGame;
    public words: string[];
    private isProcessing = false;

    // Constructor to initialize the WordGame instance
    constructor(game: RawWordGameWithPlayers) {
        this.id = game.id;
        this.name = game.name;
        this.recentPlayerId = game.recentPlayerId;
        this.guildId = game.guildId;
        this.letter = game.letter;
        this.limit = game.limit;
        this.randomWords = game.randomWords;
        this.mode = game.mode;
        this.locale = game.locale;
        this.formattedLocale = Utils.formatLocale(game.locale);
        this.words = game.words;
        this.players = game.players;
    }

    // Method to handle a player's word input
    async handleWord(message: Message) {
        // Check if a process is already in progress
        if (this.isProcessing) {
            // If so, wait for the process to complete
            await this.waitForProcessing();
        }

        // Mark the start of the processing
        this.isProcessing = true;

        // Processing the word from the message
        const word = message.content.replace("I", "ı").toLowerCase().replace("i̇", "i");
        // Getting the player or adding a new player
        const playerId = message.author.id;
        let player = this.players.get(playerId);

        if (!player) {
            player = await this.addPlayer(playerId);
        }

        // Checking if the word is valid
        const reason = await this.checkWord(word, player.id);

        if (reason) {
            // Release the processing flag
            this.isProcessing = false;

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
                await message.react(client.config.acceptEmote).catch(() => {});
                const { gameReward, randomLetter } = await this.restartGame(word, player);

                // Release the processing flag
                this.isProcessing = false;

                // Sending the finish and restart message
                await message.channel.send(
                    client.getLocalization<true>(this.formattedLocale, "wordGameFinished")(gameReward.toString()) +
                        "\n" +
                        client.getLocalization<true>(this.formattedLocale, "wordGameRestarted")(randomLetter)
                );
            } else {
                // Deleting the message and providing feedback to the player
                if (this.mode === GameMode.Endless) {
                    if (this.locale !== Locales.Turkish) {
                        this.isProcessing = false;
                        return;
                    }

                    const randomLetter = Utils.randomLetter("tr");

                    this.letter = randomLetter;

                    await message.react(client.config.acceptEmote).catch(() => {});

                    await message.channel.send(client.getLocalization<true>(this.formattedLocale, "wordGameNewLetter")(randomLetter));

                    await this.save();
                    // Release the processing flag
                    this.isProcessing = false;
                } else {
                    // Release the processing flag
                    this.isProcessing = false;
                    await message.delete().catch(() => {});
                    await message.channel
                        .send(
                            `<@${player.id}>, ` +
                                client.getLocalization<true>(this.formattedLocale, "wordGameNotYet")((this.limit - this.words.length).toString())
                        )
                        .then((reply) => setTimeout(() => reply.delete(), 5000));
                }
            }
        } else {
            // Reacting to the message with an emoji and adding the word to the game
            await message.react(client.config.acceptEmote).catch(() => {});
            this.setName((message.channel as GuildTextBasedChannel).name);
            await this.addWord(word, player);
            // Release the processing flag
            this.isProcessing = false;
        }
    }

    // Method to wait for the processing to complete
    private async waitForProcessing() {
        // Wait for isProcessing to become false
        while (this.isProcessing) {
            await new Promise((resolve) => setTimeout(resolve, 50));
        }
    }

    // Method to add a word to the game
    private async addWord(word: string, player: Player) {
        // Calculating word reward based on length
        const wordReward = word.length > 6 ? 1 : word.length / 10;
        // Incrementing word count in statistics
        client.stats.increaseWordCount();
        // Adding score to the player
        await player.addScore(wordReward, this.guildId, this.id);
        // Updating game state
        this.words.push(word);
        this.letter = word.charAt(word.length - 1);
        this.recentPlayerId = player.id;

        await this.save();
    }

    // Method to check the validity of a word
    private async checkWord(word: string, playerId: string) {
        const firstLetter = word[0];
        const last40Words = this.words.slice(-40);

        if (playerId === this.recentPlayerId) {
            // Player attempted to play in a row
            return client.getLocalization(this.formattedLocale, "gameSamePlayer");
        } else if (!Utils.Letters[this.formattedLocale].includes(firstLetter) || firstLetter !== this.letter) {
            // Invalid starting letter
            return client.getLocalization<true>(this.formattedLocale, "wordGameInvalidLetter")(this.letter);
        } else if (await client.words.find(word, this.formattedLocale)) {
            // Invalid word
            return client.getLocalization(this.formattedLocale, "wordGameInvalidWord");
        } else if (this.words.includes(word) && this.mode === GameMode.Normal) {
            // Word already used in the game
            return client.getLocalization(this.formattedLocale, "wordGameSameWord");
        } else if (this.mode === GameMode.Endless && last40Words.includes(word)) {
            // Word can be used after n times word
            const wordIndex = last40Words.indexOf(word);
            return client.getLocalization<true>(this.formattedLocale, "wordGameNotYetAgain")((40 - wordIndex).toString());
        }
    }

    // Method to restart the game
    private async restartGame(word: string, player: Player) {
        // Storing the current word count
        const wordCount = this.words.length;
        // Calculating game and word rewards
        const gameReward = Utils.randomInt(wordCount / 2, wordCount);
        const wordReward = word.length > 6 ? 1 : word.length / 10;
        // Generating a random letter for the next round
        const randomLetter = Utils.randomLetter(this.formattedLocale);

        // Incrementing word count in statistics
        client.stats.increaseWordCount();

        // Adding total score to the player
        await player.addScore(wordReward + gameReward, this.guildId, this.id);

        // Resetting game state
        this.words = [];
        this.letter = randomLetter;
        this.recentPlayerId = player.id;

        // Generating new random words for the next round (if English locale)
        if (this.locale === Locales.English) {
            const randomWords = Utils.getRandomWords(3);
            this.randomWords = randomWords;
        }

        // Saving the updated game state
        await this.save();

        return { gameReward, randomLetter };
    }

    // Method to add a new player to the game
    private async addPlayer(id: string) {
        let player = client.players.get(id);

        if (!player) {
            player = await client.players.create(id, this.guildId, this.id);
        } else {
            await player.addGame(this.guildId, this.id);
        }

        this.players.add(player);

        return player;
    }

    // Method to remove player from the game
    async removePlayer(id: string) {
        const player = this.players.get(id);

        if (!player) return;

        const hasNoScores = await player.removeGame(this.guildId, this.id);

        this.players.remove(id);

        if (hasNoScores) {
            await client.players.remove(id);
        }
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

    // Method to set name
    setName(name: string) {
        this.name = name;
    }

    // Method to save the current game state to the database
    private async save() {
        await prisma.wordGame.update({
            where: {
                id: this.id,
            },
            data: {
                name: this.name,
                letter: this.letter,
                limit: this.limit,
                locale: this.locale,
                mode: this.mode,
                recentPlayerId: this.recentPlayerId,
                randomWords: this.randomWords,
                words: this.words,
                playerIds: this.players.getIds(),
            },
        });
    }
}
