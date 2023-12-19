import { CommandInteraction, SlashCommandBuilder } from "discord.js"

export default {
    data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Ping Command!"),
    async execute(interaction: CommandInteraction){
        await interaction.reply('Pong!')
    }
}