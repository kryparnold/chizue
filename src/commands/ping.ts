import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { client } from "@/globals";

export default {
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("null")
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction: ChatInputCommandInteraction) {
		interaction
			.deferReply({
				ephemeral: true,
				fetchReply: true,
			})
			.then((reply) => {
				const startTime = interaction.createdTimestamp;
				const endTime = reply.createdTimestamp;
				interaction.editReply(`API: ${client.ws.ping}ms\nResponse: ${endTime - startTime}ms`);
			});
	},
};
