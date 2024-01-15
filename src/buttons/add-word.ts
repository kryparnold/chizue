import { ButtonParams, FormattedLocale, client } from "@/globals";
import { ButtonInteraction } from "discord.js";

export default {
    data: {
        id: "add-word",
        params: [
            "word",
            "language"
        ]
    },
    async execute(interaction: ButtonInteraction, params: ButtonParams) {
        const word = params["word"];
        const language = params["language"] as FormattedLocale;

        await client.words.addWord(word,language);

        await interaction.reply({
            content: `word: ${word}, language: ${language}`
        });
    }
}