import { config } from 'dotenv';
import { REST, Routes } from 'discord.js';

config();

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Deleting all global application commands...');
        // Clear global commands
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: [] }
        );

        // Clear guild commands (replace GUILD_ID)
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: [] }
        );


        console.log('All global commands deleted.');
    } catch (error) {
        console.error('Failed to delete commands:', error);
    }
})();
