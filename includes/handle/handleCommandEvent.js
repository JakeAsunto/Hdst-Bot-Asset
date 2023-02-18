module.exports = function({ api, models, Users, Threads, Currencies }) {
	
	const cache = require('../../utils/cache.js');
    const logger = require("../../utils/log.js");
    const textFormat = require("../../utils/textFormat.js");

    return function({ event }) {
    	
    	const dateNow = Date.now();

        const { allowInbox } = global.config;

        const { userBanned, threadBanned } = global.data;

        const { cooldowns, commands, eventRegistered } = global.client;

        var { senderID, threadID, senderID } = event;

        var senderID = String(senderID);

        var threadID = String(threadID);

        if (userBanned.has(senderID) || threadBanned.has(threadID) || allowInbox == !![] && senderID == threadID) return;

        for (const eventReg of eventRegistered) {

            const cmd = commands.get(eventReg);

            var getText2;
            
            if (!client.cooldowns.has(cmd.config.name)) {
				client.cooldowns.set(cmd.config.name, new Map());
			}

            if (cmd.languages && typeof cmd.languages == 'object')

                getText2 = (...values) => {

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

            else getText2 = () => {};
            
            const returns = {};
            
            returns.handleTimestamps = function () {
            	const timestamps = client.cooldowns.get(cmd.config.name);
            	const expirationTime = (cmd.config.cooldowns || 1) * 1000;
        		const userCooldown = timestamps.get(senderID) + expirationTime;
        
        		if (timestamps.has(senderID) && dateNow < userCooldown) {
        	
					const duration = moment.duration(moment(userCooldown).diff(moment(dateNow)));
					let CD = '';
			
					if (duration.minutes() > 0) {
						CD = `${duration.minutes()} minute(s) and ${duration.seconds()} second(s)`;
					} else {
						CD = `${duration.seconds()} second(s)`;
					}
			
					api.sendMessage(
						textFormat('cmd', 'cmdUserCooldown', CD),
						event.threadID,
						(err, info) => {
							if (err) return;
							// remove after 5 seconds
							setTimeout(function () { api.unsendMessage(info.messageID); }, 5000);
						},
						event.messageID
					);
            		return api.setMessageReaction(textFormat('reaction', 'userCmdCooldown'), event.messageID, err => (err) ? logger('unable to setMessageReaction for Cooling down command use user', '[ Reactions ]') : '', !![]);
				} else {
					return timestamps.set(senderID, dateNow);
				}
            }

            try {

                const Obj = {};

                Obj.event = event

                Obj.api = api

                Obj.models = models

                Obj.Users = Users

                Obj.Threads = Threads

                Obj.Currencies = Currencies

                Obj.getText = getText2

				Obj.Cache = cache
                
                Obj.textFormat = textFormat

				Obj.returns = returns

                if (cmd) cmd.handleEvent(Obj);

            } catch (error) {

                logger(global.getText('handleCommandEvent', 'moduleError', cmd.config.name), 'error');

            }

        }

    };

};