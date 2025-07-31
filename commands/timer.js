import { SlashCommandBuilder, InteractionContextType } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('timer')
    .setDescription('Starts a countdown.')
    .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
    .addIntegerOption(option =>
      option.setName('seconds')
        .setDescription('Seconds to count down from')
        .setRequired(true)),

  async execute(interaction) {
    const seconds = interaction.options.getInteger('seconds');

    if (seconds < 1 || seconds > 3600) {
      return interaction.reply({ content: 'Please choose a value between 1 and 3600 seconds.', ephemeral: true });
    }

    await interaction.reply(`⏳ Timer started for ${seconds} seconds...`);

    setTimeout(() => {
      interaction.followUp(`${interaction.user}, your timer ended! ⏰`).catch(() => {});
    }, seconds * 1000);
  }
};
