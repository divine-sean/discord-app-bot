import { SlashCommandBuilder, InteractionContextType } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('remind')
    .setDescription('Sends you a reminder after a set duration.')
    .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Time until reminder (e.g. 10s, 5m, 1h)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Reminder message')
        .setRequired(true)),

  async execute(interaction) {
    const duration = interaction.options.getString('duration');
    const message = interaction.options.getString('message');
    const match = duration.match(/^(\d+)(s|m|h)$/);

    if (!match) {
      return interaction.reply({ content: 'Invalid time format. Use 10s, 5m, or 1h.', ephemeral: true });
    }

    const amount = parseInt(match[1]);
    const unit = match[2];
    const ms = unit === 's' ? amount * 1000 : unit === 'm' ? amount * 60000 : amount * 3600000;

    await interaction.reply(`I’ll remind you in ${duration}: "${message}"`);

    setTimeout(() => {
      interaction.user.send(`⏰ Reminder: ${message}`).catch(() => {});
    }, ms);
  }
};
