module.exports = function({ api, models, Users, Threads, Currencies }) {

    const stringSimilarity = require('string-similarity'),

        escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),

        textFormat = require('../../utils/textFormat.js'),
        
        cache = require('../../utils/cache.js'),

        logger = require('../../utils/log.js');



    const moment = require('moment-timezone');

    return async function({ event }) {

        const dateNow = Date.now()

		//console.log(event.body)

        const time = moment.tz('Asia/Manila').format('HH:MM:ss DD/MM/YYYY');

        const { allowInbox, PREFIX, ADMINBOT, DeveloperMode, adminOnly } = global.config;

        const { userBanned, threadBanned, threadInfo, threadData, commandBanned } = global.data;

        const { commands, commandAliases, cooldowns } = global.client;

        var { body, mentions, senderID, threadID, messageID } = event;

        var senderID = String(senderID), threadID = String(threadID);

        const threadSetting = threadData.get(threadID) || {}

		//console.log('current-threadID: ' + threadID)
		const botMent = (mentions && Object.keys(mentions).length > 0 && Object.keys(mentions)[0] == global.botUserID) ? (Object.values(mentions)[0]).replace('@', '') : global.botUserID;
		
		let PREFIX_FINAL = (threadSetting.hasOwnProperty('PREFIX')) ? threadSetting.PREFIX : PREFIX;

        const prefixRegex = new RegExp(`^(<@!?${senderID}>|\@${botMent}|${escapeRegex(threadSetting.PREFIX || PREFIX)}|${escapeRegex(PREFIX)})\\s*`);
		
		if (!prefixRegex.test(body)) return;

        if (userBanned.has(senderID) || threadBanned.has(threadID) || allowInbox == ![] && senderID == threadID) {

            if (!ADMINBOT.includes(senderID.toString())) {

                if (userBanned.has(senderID)) {

                    const { reason, dateAdded } = userBanned.get(senderID) || {};

                    return api.sendMessage(textFormat('events', 'eventUserBannedForBot', reason, dateAdded), threadID, async (err, info) => {

                        await new Promise(resolve => setTimeout(resolve, 5 * 1000));

                        return api.unsendMessage(info.messageID);

                    }, messageID);

                } else {

                    if (threadBanned.has(threadID)) {

                        const { reason, dateAdded } = threadBanned.get(threadID) || {};

                        return api.sendMessage(textFormat('events', 'eventThreadBannedForBot', reason, dateAdded), threadID, async (err, info) => {

                            await new Promise(resolve => setTimeout(resolve, 5 * 1000));

                            return api.unsendMessage(info.messageID);

                        }, messageID);

                    }

                }

            }

        }
        
        const [matchedPrefix] = body.match(prefixRegex);
		const args = body.slice(matchedPrefix.length).trim().split(/ +/);
		
		if (Object.keys(mentions).length >= 1 && Object.keys(mentions)[0] === global.botUserID) {
			const ment = {};
			for (const id in mentions){
				if (id !== global.botUserID) {
					ment[id] = mentions[id]
				}
			}
			event.mentions = ment;
		}
		
		//console.log(event.mentions);
		// send under maintenance response
    	if (global.config.isMaintenance && !ADMINBOT.includes(senderID)) {
    		return api.sendMessage(textFormat('system', 'botUnderMaintenance'), threadID, messageID);
		}
		//console.log(args.length);
		if (args[0] === '' && !args[1]) {
			// response that's my prefix
			return api.sendMessage(textFormat('system', 'botPoked', global.config.PREFIX, global.config.PREFIX), threadID, messageID);
		}
        // accept command with spacing
        commandName = (args.length > 1 && args[0] === '') ? args[1] : args.shift().toLowerCase();
		
        var command = (commandAliases.has(commandName)) ? commands.get(commandAliases.get(commandName)) : commands.get(commandName);

        if (!command) {

            //var allCommandName = [];

            const commandValues = commands['keys']();

            //for (const cmd of commandValues) allCommandName.push(cmd)

            //const checker = stringSimilarity.findBestMatch(commandName, allCommandName);

           // if (checker.bestMatch.rating >= 0.9) command = client.commands.get(checker.bestMatch.target);
			// const rate = checker.bestMatch.rating;
			// console.log(rate);
            return api.sendMessage(textFormat('cmd', 'cmdNotFound', PREFIX_FINAL), threadID, messageID);

        }

        if (commandBanned.get(threadID) || commandBanned.get(senderID)) {

            if (!ADMINBOT.includes(senderID)) {

                const banThreads = commandBanned.get(threadID) || [],

                    banUsers = commandBanned.get(senderID) || [];

                if (banThreads.includes(command.config.name))

                    return api.sendMessage(textFormat('events', 'eventThreadBannedForCommand', command.config.name), threadID, async (err, info) => {

                        await new Promise(resolve => setTimeout(resolve, 5 * 1000))

                        return api.unsendMessage(info.messageID);

                    }, messageID);

                if (banUsers.includes(command.config.name))

                    return api.sendMessage(textFormat('events', 'eventUserBannedForCommand', command.config.name), threadID, async (err, info) => {

                        await new Promise(resolve => setTimeout(resolve, 5 * 1000));

                        return api.unsendMessage(info.messageID);

                    }, messageID);

            }

        }

        if (command.config.commandCategory.toLowerCase() == 'nsfw' && !global.data.threadAllowNSFW.includes(threadID) && !ADMINBOT.includes(senderID))

            return api.sendMessage(global.getText('handleCommand', 'threadNotAllowNSFW'), threadID, async (err, info) => {

                await new Promise(resolve => setTimeout(resolve, 5 * 1000))

                return api.unsendMessage(info.messageID);

            }, messageID);

        var threadInfo2;

        if (event.isGroup == !![])

            try {

                threadInfo2 = (threadInfo.get(threadID) || await Threads.getInfo(threadID))

                if (Object.keys(threadInfo2).length == 0) throw new Error();

            } catch (err) {

                logger(global.getText('handleCommand', 'cantGetInfoThread', 'error'));

            }

        var threadInfoo = (threadInfo.get(threadID) || await Threads.getInfo(threadID));
		var is_admin_bot = ADMINBOT.includes(senderID.toString());
		var is_admin_group = threadInfoo.adminIDs.find(el => el.id == senderID);
		
		var cmdPerm = command.config.hasPermssion;
		var requiredArgs = (command.config.envConfig) ? command.config.envConfig.requiredArgument || 0 : 0;
		var eligible = false;
		
		if ((command.config.disabled || command.config.underTest) && !is_admin_bot) {
			return api.sendMessage(textFormat('cmd', 'cmdWasDisabled'), threadID, messageID);
		}
		
		if (cmdPerm == 1) {
			eligible = (is_admin_group) ? true : false;
		} else if (cmdPerm == 2) {
			eligible = (is_admin_bot) ? true : false;
		} else if (cmdPerm == 3) {
			eligible = (is_admin_bot || is_admin_group) ? true : false;
		} else if (cmdPerm == 0) {
			eligible = true;
		}
		
		if (args.length < requiredArgs) {
			
			return api.sendMessage(
				textFormat('cmd', 'cmdWrongUsage', `${PREFIX_FINAL}${command.config.name} ${command.config.usages}`),
				event.threadID,
				(err, info) => {
					if (err) return;
					setTimeout(() => { api.unsendMessage(info.messageID) }, 10 * 1000);
				},
				event.messageID
			);
		}
		
		if (command.config.envConfig && command.config.envConfig.inProcessReaction) {
			global.sendReaction.inprocess(api, event);
		}
		
        if (!eligible) {
        	
        	const permTxt = textFormat('system', 'perm' + cmdPerm)
			return api.sendMessage(
				textFormat('cmd', 'cmdPermissionNotEnough', permTxt),
				event.threadID,
				(err, info) => {
					if (err) return logger(err, 'error');
					// remove after 5 seconds
					setTimeout(() => { api.unsendMessage(info.messageID) }, 5000);
				},
				event.messageID
			);
			
		}

        if (!client.cooldowns.has(command.config.name)) {
			client.cooldowns.set(command.config.name, new Map());
		}

        const timestamps = client.cooldowns.get(command.config.name);;

        const expirationTime = (command.config.cooldowns || 1) * 1000;
        
        const userCooldown = timestamps.get(senderID) + expirationTime

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
					setTimeout(function () {
							api.unsendMessage(info.messageID);
						},
						5000
					);
				},
				event.messageID
			);
            return api.setMessageReaction(textFormat('reaction', 'userCmdCooldown'), event.messageID, err => (err) ? logger('unable to setMessageReaction for Cooling down command use user', '[ Reactions ]') : '', !![]);
            
		}
		
        var getText2;

        if (command.languages && typeof command.languages == 'object' && command.languages.hasOwnProperty(global.config.language))

            getText2 = (...values) => {

                var lang = command.languages[global.config.language][values[0]] || '';

                for (var i = values.length; i > 0x2533 + 0x1105 + -0x3638; i--) {

                    const expReg = RegExp('%' + i, 'g');

                    lang = lang.replace(expReg, values[i]);

                }

                return lang;

            };

        else getText2 = () => {};
        
        const logMessageError = (err) => {
        	if (err) return logger (`${command.config.name}: ${err}`, 'error');
        }

        try {
        	
        	if (DeveloperMode) {
				
				const now = Date.now();
				const userInfo = await api.getUserInfoV2(senderID);
				const threadInfo = await api.getThreadInfo(threadID);
				const time2 = moment.tz('Asia/Manila').format('HH:MM:ss MM/DD/YYYY');
				
                logger(global.getText('handleCommand', 'executeCommand', time2, commandName, senderID, threadID, args.join(' '), (now - dateNow)), '[ DEV MODE ]');
				//api.sendMessage(
					//textFormat('system', 'botLogCmd', time, threadInfo.name, userInfo.name || senderID, args.join(' ')),
					
				//);
			}
			
			const returns = {};
			
			returns.remove_usercooldown = function () {
				timestamps.delete(senderID);
			}
			
			returns.invalid_usage = function () {
				global.sendReaction.failed(api, event);
				api.sendMessage(
					textFormat('cmd', 'cmdWrongUsage', `\n${PREFIX_FINAL}${command.config.name} ${command.config.usages}\nAlternatively you can use "${PREFIX_FINAL}help ${command.config.name}" for more information.`),
					event.threadID,
					(err, info) => {
						if (err) return;
						setTimeout(() => { api.unsendMessage(info.messageID) }, 10 * 1000);
					},
					event.messageID
				);
			}
			
			returns.inaccessible_outside_gc = function () {
				global.sendReaction.failed(api, event);
				api.sendMessage(
					textFormat('system', 'commandAvailableOnGCOnly'),
					event.threadID,
					global.autoUnsend,
					event.messageID
				);
			}

            const Obj = {};

            Obj.api = api;

            Obj.event = event;

            Obj.args = args;

            Obj.models = models;

            Obj.Users = Users;

            Obj.Threads = Threads;

            Obj.Currencies = Currencies;

            Obj.getText = getText2;

            Obj.textFormat = textFormat;

			Obj.logger = logger;
			
			Obj.Prefix = PREFIX_FINAL;

			Obj.Cache = cache;

			Obj.returns = returns;
			
			Obj.alias = commandName; // to determine what alias user used to run this command
			
			Obj.logMessageError = logMessageError;

			timestamps.set(senderID, dateNow);
			
            command.run(Obj);

			return;

        } catch (e) {

			global.sendReaction.failed(api, event);
			
            return api.sendMessage(global.getText('handleCommand', 'commandError', commandName, e), threadID);

        }

    };

};