import { SlashCommandBuilder, InteractionContextType } from 'discord.js';
import fetch from 'node-fetch';

export default {
  data: new SlashCommandBuilder()
    .setName('translate')
    .setDescription('Translate text to another language.')
    .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
    .addStringOption(option => option.setName('text').setDescription('Text to translate').setRequired(true))
    .addStringOption(option => option.setName('lang').setDescription('Target language code (e.g. en, fr)').setRequired(true)),

  async execute(interaction) {
    const text = interaction.options.getString('text');
    const lang = interaction.options.getString('lang');

    try {
      const res = await fetch('https://libretranslate.de/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          q: text,
          source: 'auto',
          target: lang,
          format: 'text',
        }),
      });

      const contentType = res.headers.get('content-type');
      if (!res.ok || !contentType?.includes('application/json')) {
        const errText = await res.text();
        throw new Error(`Unexpected response: ${errText.slice(0, 100)}`);
      }

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      await interaction.reply(`Translation (${lang}): ${data.translatedText}`);
    } catch (err) {
      await interaction.reply(`Translation failed: ${err.message}`);
    }
  }
};
