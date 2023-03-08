module.exports = function({ api, models, Users, Threads }) {
	
	const cache = require('../../utils/cache.js');
    const logger = require("../../utils/log.js");
    const textFormat = require("../../utils/textFormat.js");

    return function({ event }) {

        const { allowInbox } = global.config;

        const { threadData, bannedUsers, bannedThreads } = global.data;

        const { commands, handleReply, messageReplyRegistered } = global.client;

        const { body, messageID, senderID, threadID, messageReply } = event;
        
        const threadSetting = threadData.get(threadID) || {};
        
        const botPrefix = (threadSetting.hasOwnProperty('PREFIX')) ? threadSetting.PREFIX : global.config.PREFIX;
        
        // do not track replies from command that has handleReply event && replies that has bot prefix
        if ((handleReply.findIndex(e => e => e.messageID == messageReply.messageID)) !== -1 || body.startsWith(botPrefix)) return;
		
        //var senderID = String(senderID);

        //var threadID = String(threadID);

        // if (bannedUsers.has(senderID) || bannedThreads.has(threadID) || allowInbox == !![] && senderID == threadID) return;

        for (const mrReg of messageReplyRegistered) {

            const cmd = commands.get(mrReg);

            var getText;

            if (cmd.languages && typeof cmd.languages == 'object')

                getText = (...values) => {

                    const commandModule = cmd.languages || {};

                    if (!commandModule.hasOwnProperty(global.config.language))

                        return api.sendMessage(global.getText('handleCommand', 'notFoundLanguage', cmd.config.name), threadID, messengeID);

                    var lang = cmd.languages[global.config.language][values[0]] || '';

                    for (var i = values.length; i > 0x16c0 + -0x303 + -0x1f * 0xa3; i--) {

                        const expReg = RegExp('%' + i, 'g');

                        lang = lang.replace(expReg, values[i]);

                    }

                    return lang;

                };

            else getText = () => {};

            try {

                const Obj = {};

                Obj.event = event;

                Obj.api = api;

                Obj.models = models;

                Obj.Users = Users;

                Obj.Threads = Threads;

                Obj.getText = getText;

				Obj.Cache = cache;
                
                Obj.textFormat = textFormat;

                if (cmd) cmd.handleMessageReply(Obj);

            } catch (error) {

                logger(global.getText('handleCommandEvent', 'moduleError', cmd.config.name), 'error');

            }

        }

    };

};