import { SlashCommandBuilder, InteractionContextType } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('restart')
    .setDescription('Restarts the bot. (Owner only)')
    .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel),

  async execute(interaction) {
    if (interaction.user.id !== process.env.BOT_OWNER_ID) {
      return interaction.reply({ content: 'You are not authorized to use this command.', ephemeral: true });
    }

    await interaction.reply('Restarting...');
    process.exit(0);
  }
};
