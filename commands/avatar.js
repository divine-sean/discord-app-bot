import { SlashCommandBuilder, ContextMenuCommandBuilder, ApplicationCommandType, InteractionContextType, EmbedBuilder } from 'discord.js';

export default [
  {
    // Slash command: /avatar
    data: new SlashCommandBuilder()
      .setName('avatar')
      .setDescription('Show a user\'s avatar in high resolution.')
      .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
      .addUserOption(option =>
        option.setName('target')
          .setDescription('The user to show the avatar of')
          .setRequired(false)),
    
    async execute(interaction) {
      const user = interaction.options.getUser('target') || interaction.user;
      await interaction.reply({ embeds: [generateAvatarEmbed(user)] });
    }
  },
  {
    // User context menu command: "Avatar"
    data: new ContextMenuCommandBuilder()
      .setName('Avatar')
      .setType(ApplicationCommandType.User),
    
    async execute(interaction) {
      const user = interaction.targetUser;
      await interaction.reply({ embeds: [generateAvatarEmbed(user)] });
    }
  }
];

// Shared helper function to create the embed
function generateAvatarEmbed(user) {
  return new EmbedBuilder()
    .setTitle(`${user.username}'s Avatar`)
    .setImage(user.displayAvatarURL({ size: 1024, dynamic: true }))
    .setColor(0x5865F2)
    .setTimestamp();
}
