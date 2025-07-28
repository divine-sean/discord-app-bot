import { SlashCommandBuilder, ContextMenuCommandBuilder, ApplicationCommandType } from 'discord.js';

export default [
  {
    // Slash command: /user-info
    data: new SlashCommandBuilder()
      .setName('user-info')
      .setDescription('Displays info about you or someone else.')
      .addUserOption(option =>
        option.setName('target')
          .setDescription('The user you want info on')
          .setRequired(false)
      ),
    async execute(interaction) {
      const user = interaction.options.getUser('target') || interaction.user;
      const member = interaction.guild?.members.cache.get(user.id);

      await interaction.reply({
        embeds: [generateUserEmbed(user, member, interaction.user)],
        ephemeral: false,
      });
    }
  },
  {
    // User context menu command
    data: new ContextMenuCommandBuilder()
      .setName('User Info')
      .setType(ApplicationCommandType.User),
    async execute(interaction) {
      const user = interaction.targetUser;
      const member = interaction.guild?.members.cache.get(user.id);

      await interaction.reply({
        embeds: [generateUserEmbed(user, member, interaction.user)],
        ephemeral: false,
      });
    }
  }
];

// Helper function shared between both commands
function generateUserEmbed(user, member, invoker) {
  return {
    color: 0x5865F2,
    title: `User Info: ${user.username}`,
    thumbnail: { url: user.displayAvatarURL({ dynamic: true }) },
    fields: [
      { name: 'Username', value: `${user.tag}`, inline: true },
      { name: 'User ID', value: user.id, inline: true },
      ...(member?.joinedAt
        ? [{ name: 'Joined Server', value: `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:R>`, inline: true }]
        : []),
      { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
    ],
    timestamp: new Date().toISOString(),
    footer: { text: `Requested by ${invoker.username}` },
  };
}
