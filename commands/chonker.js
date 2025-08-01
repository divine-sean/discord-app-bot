import { SlashCommandBuilder, EmbedBuilder, InteractionContextType } from 'discord.js';
import fetch from 'node-fetch';

export default {
  data: new SlashCommandBuilder()
    .setName('chomnker')
    .setDescription('fat cat ;(')
    .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const apiKey = process.env.PIXABAY_API_KEY;
      if (!apiKey) {
        return interaction.editReply('Pixabay API key is not configured.');
      }

      const query = 'cat+fat';
      const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&image_type=photo&safesearch=true&per_page=50`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Pixabay API error: ${res.status}`);

      const data = await res.json();

      // Filter out snow leopards if any sneak in the results (by tags)
      const leopardImages = data.hits.filter(img =>
        !img.tags.toLowerCase().includes('snow') &&
        !img.tags.toLowerCase().includes('snow leopard')
      );

      if (!leopardImages.length) {
        return interaction.editReply('No normal leopard images found at the moment. Try again later.');
      }

      const image = leopardImages[Math.floor(Math.random() * leopardImages.length)];

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
        .setTitle('Random Leopard Image')
        .setURL(image.pageURL)
        .setImage('attachment://leopard.jpg')
        .setColor(0xFFC107)
        .setFooter(footerOptions);

      await interaction.editReply({
        embeds: [embed],
        files: [{ attachment: imgBuffer, name: 'leopard.jpg' }]
      });
    } catch (error) {
      console.error(error);
      await interaction.editReply('Failed to fetch leopard images. Please try again later.');
    }
  }
};
