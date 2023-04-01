let autobanData;

module.exports.config = {
	name: 'auto-ban',
	version: '1.0.0',
	hasPermssion: 0,
	description: 'Event Listener to ban other bot',
	commandCategory: 'hidden',
	credits: 'Hadestia',
	usages: ''
}

module.exports.onLoad = function () {
	autobanData = require(`${global.client.mainPath}/json/autoResponse.json`);
}


module.exports.handleEvent = async function ({ api, event, Users, Banned }) {
	
	const { body, threadID, senderID, messageID } = event;
	
	if (!body) return;
	
	if (autobanData && autobanData.autoban_bot_checker) {
		for (const item of autobanData.autoban_bot_checker.matches) {
			if ((body.toLowerCase()).indexOf(item) !== -1) {
				
				try {
					const timezone = require('moment-timezone').tz('Asia/Manila').format('MM-DD-YYYY @HH:mm A');
				
					const userName = (global.data.userName).get(senderID) || 'Other Bot';
					const randomCaseID = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
					const userData = await Users.getData(senderID);
					if (!userData) { throw 'User not Initialize'; }
					const data = userData.data;
				
					data.banned = data.banned || {};
				
					data.isBanned = true;
					data.banned.caseID = randomCaseID;
					data.banned.reason = 'Suspected as other bot.';
					data.banned.dateIssued = timezone;
				
					global.data.bannedUsers.set(senderID, data.banned);
					
					const bannedData = data.banned;
					bannedData.isGroup = false;
					
					await Users.setData(senderID, { data });
					await Banned.setData(senderID, { data: bannedData });
				
					return api.sendMessage(
						{
							body: global.textFormat('events', 'eventOtherBotDetected', userName),
							mentions: [ { tag: userName, id: senderID }]
						},
						threadID,
						messageID
					)
				} catch (err) {
					console.log('AUTO BAN BOT', err);
				}
			}
		}
	}
}

module.exports.run = function () {}