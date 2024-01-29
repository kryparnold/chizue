import { ButtonParams } from "@/types";
import { ButtonInteraction, GuildMember, Role } from "discord.js";

export default {
    data: {
        id: "toggle-role",
        params: ["roleId"],
    },
    async execute(interaction: ButtonInteraction, { roleId }: ButtonParams) {
        const role = (await interaction.guild?.roles.fetch(roleId)) as Role;
        const member = interaction.member as GuildMember;
        const hasRole = member.roles.cache.some((userRole) => userRole.id === role.id);

        if (!hasRole) {
            await member.roles.add(role);
            await interaction.reply({
                content: `Başarıyla **${role.name}** rolünü aldınız.`,
                ephemeral: true,
            });

            return;
        }

        await member.roles.remove(role);
        await interaction.reply({
            content: `Başarıyla **${role.name}** rolünü bıraktınız.`,
            ephemeral: true,
        });
    },
};
