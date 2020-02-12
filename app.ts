import Discord from 'discord.js';
import { log } from './logger';
import moduleConsolidator from './moduleConsolidator';

const client = new Discord.Client();

const listOfModuleFunctions: Function[] = moduleConsolidator();

const passMessageToModules = (msg: Discord.Message): void => listOfModuleFunctions.forEach((func) => func(msg));

const disconnectingActions = async (): Promise<void> => {
  console.log('do nothing for now');
};

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', (msg) => {
  passMessageToModules(msg);
});

client.login('token');

client.on('error', (error) => log.error(error));

process.on('SIGINT', async () => {
  log.info('Received SIGINT... Shutting down');
  await disconnectingActions();
  await client.destroy();
  process.exit(0);
});

process.on('uncaughtException', async (error) => {
  console.log(`Caught exception: ${error}`);
  log.error(error);
  process.exit(0);
});
