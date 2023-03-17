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
	
	const { threadID } = event;
	
	try {
		const threadData = await Threads.getData(threadID);
		const settings = threadData.data;
		const economy = threadData.economy;
		const inventory = threadData.inventory;
	
		
		switch (event.logMessageType) {
			case 'log:subscribe':
				//console.log(event.logMessageData.addedParticipants);
				for (const user of event.logMessageData.addedParticipants) {
					if (user.userFbId != global.botUserID) {
						this.initUserEco({
							userID: user.userFbId,
							threadID, Threads
						});
					}
				}
				break;
			case 'log:unsubscribe':
				if (event.logMessageData.leftParticipantFbId != global.botUserID) {
					this.delUserEco({
						userID: event.logMessageData.leftParticipantFbId,
						threadID, Threads
					})
				}
				break;
			default:
				break;

		}
	} catch (err) {
		console.log(err);
	}
}

module.exports.initUserEco = async function ( { userID, threadID, Threads }) {
	
	const economySystem = require(`${global.client.mainPath}/json/economySystem.json`);
	const threadData = await Threads.getData(threadID);
	const settings = threadData.data;
	const economy = threadData.economy;
	const inventory = threadData.inventory;
	
	economy[userID] = new Object(economySystem.userConfig);
	inventory[userID] = {};
	global.logger(`Initialize Economy for user ${userID}`, 'economy');
	
	await Threads.setData(threadID, { economy, inventory });
}

module.exports.delUserEco = async function ({ userID, threadID, Threads }) {
	
	const economySystem = require(`${global.client.mainPath}/json/economySystem.json`);
	const threadData = await Threads.getData(threadID);
	const settings = threadData.data;
	const economy = threadData.economy;
	const inventory = threadData.inventory;
	
	delete economy[userID];
	delete inventory[userID];
	global.logger(`Delete Economy for user ${userID}`, 'economy');
	
	await Threads.setData(threadID, { economy, inventory });
	
}