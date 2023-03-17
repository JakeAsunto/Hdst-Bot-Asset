module.exports.config = {
	name: 'event_economyUserIO',
	eventType: ['log:subscribe', 'log:unsubscribe'],
	version: '1.0.3',
	credits: 'Hadestia',
	description: 'Set up user economy when joined or leave',
	dependencies: {
		'fs-extra': ''
	}
};

module.exports.run = async function({ api, event, Threads }) {
	
	const economySystem = require(`${global.client.mainPath}/json/economySystem.json`);
	const { threadID } = event;
	
	try {
		const threadData = await Threads.getData(threadID);
		const settings = threadData.data;
		const economy = threadData.economy;
		const inventory = threadData.inventory; 
	
		
		switch (event.logMessageType) {
			case 'log:subscribe':
				console.log(event.logMessageData.addedParticipants);
				for (const user of event.logMessageData.addedParticipants) {
					if (user.userFbId != global.botUserID) {
						economy[user.userFbId] = new Object(economySystem.userConfig);
						inventory[user.userFbId] = {};
						global.logger(`Initialize Economy for user ${user.userFbId}`, 'economy');
					}
				}
				break;
			case 'log:unsubscribe':
				if (event.logMessageData.leftParticipantFbId != global.botUserID) {
					delete economy[event.logMessageData.leftParticipantFbId];
					delete inventory[event.logMessageData.leftParticipantFbId];
					global.logger(`Delete Economy for user ${event.logMessageData.leftParticipantFbId}`, 'economy');
				}
				break;
			default:
				break;

		}
		await Threads.setData(threadID, { economy, inventory });
	} catch (err) {
		console.log(err);
	}
}