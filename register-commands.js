import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = [];

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const commandModule = await import(`file://${filePath}`);
	const exported = commandModule.default;

	if (Array.isArray(exported)) {
		for (const command of exported) {
			if ('data' in command && 'execute' in command) {
				commands.push(command.data.toJSON());
			} else {
				console.warn(`[WARNING] The command in array at ${filePath} is missing "data" or "execute".`);
			}
		}
	} else if ('data' in exported && 'execute' in exported) {
		commands.push(exported.data.toJSON());
	} else {
		console.warn(`[WARNING] The command at ${filePath} is missing "data" or "execute".`);
	}
}

const rest = new REST().setToken(process.env.TOKEN);

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		await rest.put(
			Routes.applicationCommands(process.env.CLIENT_ID),
			{ body: [] }
		);


		const data = await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
			{ body: commands }
		);

		console.log(`✅ Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		console.error('❌ Failed to reload commands:', error);
	}
})();
