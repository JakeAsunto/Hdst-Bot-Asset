module.exports.config = {
	name: 'banned',
	version: '1.0.0',
	credits: 'Hadestia',
	cooldowns: 0,
	hasPermssion: 2,
	commandCategory: 'system',
	description: 'Handle banned database.',
	usages: '[ ban-user | ban-group | unban-user | unban-group | check | list ] [ id | this-group | @mention ] | [ ... ]',
	envConfig: {
		requiredArgument: 1
	}
}

const databaseConfig = require(`${global.client.mainPath}/json/databaseConfig.json`);

module.exports.run = async function ({ api, args, event, textFormat, Users, Banned, Threads }) {
	
	const timezone = require('moment-timezone').tz('Asia/Manila').format('MM-DD-YYYY @HH:mm A');
	const { threadID, messageID, mentions } = event;
	const command = args.shift(); // get command type

	function send (msg) {
		api.sendMessage(msg, threadID, messageID);
	}
	
	function sendBanNotice(msg, reason, id) {
		api.sendMessage(textFormat('banned', 'bannedNoticeMessage', msg, (reason) ? `reason: "${reason}."` : ''), id, (e, i) => {});
	}

	if (!['ban-user', 'ban-group', 'unban-user', 'unban-group', 'check', 'list'].includes(command)) {
		return send(composeError('Invalid command type.'));
	}
	
	switch (command) {
		////////// BAN USER //////////
		case 'ban-user':
			// return if no reason detected
			if (!(args.join(' ')).match(/\|/g)) return send(composeError('Reason cannot found.'));
			const successProcess = []; //, failProcess = [];
			const splitInput = args.join(' ').split('|');
			const reason = splitInput.pop();
			const isError = false;
			// if mention
			if (Object.keys(mentions).length > 0) {
				
				for (const userID in mentions) {
					const userName = (mentions[userID]).replace('@', '');
					try {
						await setBan(userID, userName, reason, false, Banned, Users, Threads);
						sendBanNotice('You have been banned from using this bot.', reason, userID);
						successProcess.push(userName);
					} catch (err) {
						//failProcess.push(userName);
						send(composeError(err));
						isError = true
						break;
					}
				}
			// if by id
			} else {
				const targets = (((splitInput[0]).replace('ban-user', '')).trim()).split(/\s+/g);
				for (const targetID of targets) {
					try {
						if (!parseInt(targetID)) {
							send(composeError(`Invalid, expected User ID, got string: ${targetID}`));
							break;
						}
						
						let userInfo = await api.getUserInfoV2(targetID);
						let userName = (userInfo) ? userInfo.name : 'Facebook User';
						
						await setBan(targetID, userName, reason, false, Banned, Users, Threads);
						sendBanNotice('You have been banned from using this bot.', reason, userID);
						successProcess.push(userName);
					} catch (err) {
						send(composeError(err));
						isError = true
						break;
					}
				}
			}
			
			if (!isError) {
				api.sendMessage(textFormat('success', 'successfulFormat', `Successfully banned user(s):\n-${await successProcess.join('\n-')}`), threadID, messageID);
			}
			break;
		////////// BAN GROUP //////////
		case 'ban-group':
			// return if no reason detected
			if (!(args.join(' ')).match(/\|/g)) return send(composeError('Reason cannot found.'));
			const successProcess = []; //, failProcess = [];
			const splitInput = args.join(' ').split('|');
			const reason = splitInput.pop();
			const isError = false;
			
			const targets = (((splitInput[0]).replace('ban-group', '')).trim()).split(/\s+/g);
			for (const targetID of targets) {
				try {
					if (!parseInt(targetID)) {
						send(composeError(`Invalid, expected Group ID, got string: ${targetID}`));
						break;
					}
					let threadInfo = await Threads.getInfo(targetID);
					let threadName = (threadInfo) ? threadInfo.threadName : 'No Group Name';
					await setBan(targetID, threadName, reason, true, Banned, Users, Threads);
					sendBanNotice('An Admin just this group from using this bot.', reason, targetID);
					successProcess.push(threadName);
				} catch (err) {
					send(composeError(err));
					isError = true
					break;
				}
			}
			
			if (!isError) {
				api.sendMessage(textFormat('success', 'successfulFormat', `Successfully banned user(s):\n-${await successProcess.join('\n-')}`), threadID, messageID);
			}
		
			break;
		////////// UNBAN USER //////////
		case 'unban-user':
			const successProcess = [];
			const isError = false;
			
			if (Object.keys(mentions).length > 0) {
				
				for (const userID in mentions) {
					const userName = (mentions[userID]).replace('@', '');
					try {
						await deleteBan(userID, false, Banned, Users, Threads);
						sendBanNotice('An Admin just unbanned you from using this bot.', null, userID);
						successProcess.push(userName);
					} catch (err) {
						//failProcess.push(userName);
						send(composeError(err));
						isError = true
						break;
					}
				}
			// if by id
			} else {
				const targets = (((splitInput[0]).replace('unban-user', '')).trim()).split(/\s+/g);
				for (const targetID of targets) {
					try {
						if (!parseInt(targetID)) {
							send(composeError(`Invalid, expected User ID, got string: ${targetID}`));
							break;
						}
						
						await deleteBan(targetID, false, Banned, Users, Threads);
						sendBanNotice('An Admin just unbanned you from using this bot.', null, targetID);
						successProcess.push(userName);
					} catch (err) {
						send(composeError(err));
						isError = true
						break;
					}
				}
			}
			
			if (!isError) {
				api.sendMessage(textFormat('success', 'successfulFormat', `Successfully unban user(s):\n-${await successProcess.join('\n-')}`), threadID, messageID);
			}
			
			break;
		default:
			break;
	}
}

function composeError (msg) {
	return global.textFormat('error', 'errOccured', msg);
}

function createCaseNum () {
	return Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
}

async function setBan(ID, name, reason, isGroup, Banned, Users, Threads) {
	try {
		if (isGroup) {
			let thread = await Threads.getData(ID);
			const data = thread.data;
			data.isBanned = true;
								
			data.banned.caseID = createCaseNum();
			data.banned.reason = reason;
			data.banned.dateIssued = timezone;
		
			const bannedData = data.banned;
			bannedData.name = name;
			bannedData.isGroup = true;
		
			await Threads.setData(ID, { data });
			await Banned.setData(ID, { data: bannedData });
			global.data.bannedThreads.set(ID, data.banned);
		} else {
			let user = await Users.getData(ID);
			const data = user.data;
			data.isBanned = true;
								
			data.banned.caseID = createCaseNum();
			data.banned.reason = reason;
			data.banned.dateIssued = timezone;
			
			const bannedData = data.banned;
			bannedData.name = name;
			bannedData.isGroup = false;
		
			await Users.setData(ID, { data });
			await Banned.setData(ID, { data: bannedData });
			global.data.bannedUsers.set(ID, data.banned);
		}
		return;
	} catch (e) {
		throw new Error(e);
	}
}

async function deleteBan (ID, isGroup, Banned, Users, Threads) {
	try {
		if (isGroup) {
			let thread = await Threads.getData(ID);
			const data = thread.data;
			data.isBanned = false;
			data.banned = new Object(databaseConfig.group_data_config.banned);
			
			await Threads.setData(ID, { data });
			await Banned.delData(ID);
			global.data.bannedThreads.delete(ID);
		} else {
			let user = await Users.getData(ID);
			const data = user.data;
			data.isBanned = false;
			data.banned = new Object(databaseConfig.user_data_config.banned);
			
			await Users.setData(ID, { data });
			await Banned.delData(ID);
			global.data.bannedUsers.delete(ID, data.banned);
		}
		return;
	} catch (e) {
		throw new Error(e);
	}
}