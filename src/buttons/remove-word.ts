import { ButtonParams, FormattedLocale, client } from "@/globals";
import { ButtonInteraction } from "discord.js";

export default {
    data: {
        id: "remove-word",
        params: [
            "word",
            "language"
        ]
    },
    async execute(interaction: ButtonInteraction, params: ButtonParams) {
        const word = params["word"];
        const language = params["language"] as FormattedLocale;

        await client.words.removeWord(word,language);

        await interaction.reply({
			content: `The word **${word}** removed from ${client.getLocalization("en", language)} Words.`,
            ephemeral: true
		});
    }
}