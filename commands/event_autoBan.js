module.exports.config = {
	name: 'event-auto-ban',
	version: '1.0.0',
	hasPermssion: 0,
	description: 'Event Listener to ban users.',
	commandCategory: 'hidden',
	credits: 'Hadestia',
	usages: ''
}

const autobanData = require(`${global.HADESTIA_BOT_CLIENT.mainPath}/json/autoResponse.json`);

module.exports.handleEvent = async function ({ api, event, Utils, Users, Banned }) {
	
	const { body, threadID, senderID, messageID } = event;
	
	if (autobanData && autobanData.autoban_bot_checker) {
		for (const item of autobanData.autoban_bot_checker.matches) {
			if ((body.toLowerCase()).indexOf(item) !== -1) {
				
				try {
					const timezone = require('moment-timezone').tz('Asia/Manila').format('MM-DD-YYYY @HH:mm A');
				
					const userName = Users.getNameUser(senderID);
					const randomCaseID = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
					const userData = await Users.getData(senderID);
					if (!userData) { throw 'User not Initialize'; }
					
					const data = userData.data;
					const banned = {};
					
					data.isBanned = true;
					banned.isGroup = false;
					banned.name = userName;
					banned.caseID = randomCaseID;
					banned.reason = 'Suspected as other bot.';
					banned.dateIssued = timezone;
					
					data.banned = banned;
					
					await Users.setData(senderID, { data });
					await Banned.setData(senderID, { data: banned });
				
					return api.sendMessage(
						{
							body: Utils.textFormat('events', 'eventOtherBotDetected', userName),
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