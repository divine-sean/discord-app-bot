import { SlashCommandBuilder, InteractionContextType, PermissionsBitField } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('permissions')
    .setDescription('View a user’s permissions in this channel.')
    .setContexts(InteractionContextType.Guild)
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to check permissions for')
        .setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const member = interaction.guild.members.cache.get(user.id);

    if (!member) {
      return interaction.reply({ content: 'User not found in this server.', ephemeral: true });
    }

    const perms = interaction.channel.permissionsFor(member);
    const permList = perms.toArray().map(p => `• ${p}`).join('\n');

    await interaction.reply({
      embeds: [{
        title: `Permissions for ${user.tag}`,
        description: permList || 'No permissions.',
        color: 0x5865F2
      }]
    });
  }
};
