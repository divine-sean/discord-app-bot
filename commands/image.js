import { SlashCommandBuilder, EmbedBuilder, InteractionContextType } from 'discord.js';
import fetch from 'node-fetch';

export default {
  data: new SlashCommandBuilder()
    .setName('image')
    .setDescription('Search and send a random image from Pixabay. Syntax example: cat+snow')
    .addStringOption(option =>
      option
        .setName('query')
        .setDescription('What image do you want to search for?')
        .setRequired(false))
    .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const apiKey = process.env.PIXABAY_API_KEY;
      if (!apiKey) {
        return interaction.editReply('Pixabay API key is not configured.');
      }

      // Get the query from user input or fallback to 'cat'
      const query = interaction.options.getString('query')?.trim() || 'cat';

      const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&image_type=photo&safesearch=true&per_page=50`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Pixabay API error: ${res.status}`);

      const data = await res.json();

      if (!data.hits.length) {
        return interaction.editReply(`No images found for "${query}". Try a different search term.`);
      }

      const image = data.hits[Math.floor(Math.random() * data.hits.length)];

      // Download the image buffer
      const imgResponse = await fetch(image.webformatURL);
      if (!imgResponse.ok) throw new Error('Failed to download image from Pixabay.');

      const imgBuffer = await imgResponse.buffer();

      // Prepare footer options conditionally
      const footerOptions = { text: `👍 ${image.likes} | 📸 ${image.user}` };
      if (image.userImageURL && image.userImageURL.startsWith('http')) {
        footerOptions.iconURL = image.userImageURL;
      }

      // Build embed
      const embed = new EmbedBuilder()
        .setTitle(`Random image for "${query}"`)
        .setURL(image.pageURL)
        .setImage('attachment://image.jpg')
        .setColor(0xFFC107)
        .setFooter(footerOptions);

      await interaction.editReply({
        embeds: [embed],
        files: [{ attachment: imgBuffer, name: 'image.jpg' }]
      });
    } catch (error) {
      console.error(error);
      await interaction.editReply('Failed to fetch images. Please try again later.');
    }
  }
};
