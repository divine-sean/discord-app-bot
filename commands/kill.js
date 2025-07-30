// commands/ping.js
import { SlashCommandBuilder, InteractionContextType } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('killcosmic')
    .setDescription('kills cosmic (WORKING)')
    .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel),
  async execute(interaction) {
    console.log("cosmic kill");
    await interaction.reply('cosmic is dead now');
  }
};
