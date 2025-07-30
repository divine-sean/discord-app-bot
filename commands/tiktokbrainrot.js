import { SlashCommandBuilder, InteractionContextType } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('tiktok-brainrot')
    .setDescription('Adds 🥀 💀 😭 to the end of your sentence.')
    .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
    .addStringOption(option =>
      option.setName('text')
        .setDescription('The sentence to emojify')
        .setRequired(true)
    ),

  async execute(interaction) {
    const input = interaction.options.getString('text');
    const emojified = `${input} 🥀 💀 😭`;
    await interaction.reply(emojified);
  }
};
