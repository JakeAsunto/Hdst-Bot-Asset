module.exports.config = {
	name: 'pick-name',
	description: 'Picks a random name among members of a group chat like a roulette.',
	commandCategory: 'random',
	version: '1.0.0',
	hasPermssion: 0,
	usages: '',
	cooldowns: 0,
	credits: 'Hadestia',
	envConfig: {
		groupCommandOnly: true
	}
}

module.exports.run = async function ({ api, event, Utils, Users, Threads }) {
	
	try {
		const threadInfo = await Threads.getInfo(event.threadID); 
	
		const users = threadInfo.userInfo;
		let pick = { id: '4' };
		
		do {
			pick = users[Math.floor(Math.random() * users.length)];
		} while (pick.id == global.botUserID)
	
		api.sendMessage(
			{
				body: Utils.textFormat('cmd', 'cmdNameWheelResult', `@${pick.name}`),
				mentions: [{ tag: `@${pick.name}`, id: pick.id }]
			},
			event.threadID,
			event.messageID
		)
	} catch (e) {
		console.log(__filename, '\n\n', e)
	}
}