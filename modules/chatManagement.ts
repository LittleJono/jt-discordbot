let path = require('path');
const logger = require('../functions/logger'); // Load the configuration from config.js
const config = require('../config/config');
import Discord from 'discord.js';

path = path.basename(__filename);

const wordsToDelete: string[] = ['http://', '.com', '.org', '.net', 'https://', 'www.'];

const requiredRoleID: string = config.notifyRequiredRoleID;

const guildID = '1';
const adminRoleID = '2';
const memberRoleID = '3';

const antiWord = {
  loadModule: (client:) => {
    client.on('message', (message: Discord.Message) => {
      try {
        const messageString = message.content.toLowerCase().split().join('');
        if (message.guild.member(message.author.id).roles.get(requiredRoleID) === undefined && !message.author.bot) {
          if (message.attachments.size > 0) {
            logger.log(`Message: ${message.content} from ${message.author.username} deleted.`, path);
            message.delete()
              .then((messageTwo) => { logger.log(`Message: ${messageTwo.content} from ${messageTwo.author.username} deleted.`, path); })
              .catch(console.error);
          } else {
            let deleted = 0;
            Object.values(wordsToDelete).forEach((string) => {
              if (messageString.indexOf(string) > -1) {
                if (deleted !== 1) {
                  deleted = 1;
                  message.delete()
                    .then((messageTwo) => { logger.log(`Message: ${messageTwo.content} from ${messageTwo.author.username} deleted.`, path); })
                    .catch(console.error);
                }
              }
            });
          }
        }
      } catch (err) {
        logger.log(err, path);
      }
    });
  }
};

const reduceMessage = (content: string): string => {
  // replace with regex.
  return content.toLowerCase().split(' ').join('');
}

const getMemberObject = (id: string, guildObject: Discord.Guild): Discord.GuildMember | undefined => {
  return guildObject && guildObject.member(id)
}

const getGuildObject = (client: Discord.Client): Discord.Guild | undefined => {
  return client.guilds.get(guildID);
}

const doesGuildMemberHaveRole = (guildMember: Discord.GuildMember, roleID: string): boolean => {
  return !!guildMember.roles.get(roleID);
}

const isUserBot = (user: Discord.User): boolean => {
  return !!user.bot
}

const doesMessageAuthorHaveRole = (user: Discord.User, client: Discord.Client, roleID: string): boolean => {
  const guildObject = getGuildObject(client);
  const memberObject = guildObject && getMemberObject(user.id, guildObject);
  const doesHaveRole = memberObject && doesGuildMemberHaveRole(memberObject, roleID);
  return !!doesHaveRole;
}

const doesUserHaveAdminPermissions = (): boolean => {
  return false;
}

const isUserAdmin = (user: Discord.User, client: Discord.Client) => {
  return doesMessageAuthorHaveRole(user, client, adminRoleID) &&
  doesUserHaveAdminPermissions();
}

const isUserMember = (user: Discord.User, client: Discord.Client): boolean => {
  return doesMessageAuthorHaveRole(user, client, requiredRoleID);
}

const doesMessageHaveAttachment = (message: Discord.Message): boolean => {
  return message.attachments.size > 0
}

const doesMessageHaveSubstring = (message: Discord.Message, arrayOfSubstrings: string[]): boolean => {
  arrayOfSubstrings.map((substring) => {
    return message.content.indexOf(substring) > -1;
  })
}

const deleteAndLogMessage = async (message: Discord.Message): Promise<void> => {
  const deletedMessage = await message.delete()
  log.info(`Message: ${deletedMessage.content} from ${deletedMessage.author.username} deleted.`);
}

const automaticallyRemoveWord = (client: Discord.Client) => {
  client.on('message', async (message) => {
    const reducedMessage = reduceMessage(message.content);
    if (isUserMember(message.author, client) || isUserBot(message.author) || isUserAdmin(message.author, client)) {
      return;
    }
    if (doesMessageHaveAttachment(message) || doesMessageHaveSubstring(message)) {
      return await deleteAndLogMessage(message);
    }
  });
}

export const handleClientEventFunctions = [];
