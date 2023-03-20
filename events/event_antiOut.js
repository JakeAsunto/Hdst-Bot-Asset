module.exports.config = {
	name: 'antiout',
	eventType: ['log:unsubscribe'],
	version: '0.0.1',
	credits: 'Hadestia',
	description: 'try to add back users from the group'
};

module.exports.run = async function ({ event, api, Threads, Users }) {
	
	const threadData = await Threads.getData(event.threadID);
	const data = threadData.data;
	
	if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) {
		try {
			const index = (global.data.allThreadID).indexOf(event.threadID);
			(index !== -1) ? (global.data.allThreadID).splice(index, 1) : '';
			global.logger(`Bot leave group: ${event.threadID}, Deleting group database...`, 'warn');
			await Threads.delData(event.threadID);
		} catch {}
		return;
	}
	
	const name = global.data.userName.get(event.logMessageData.leftParticipantFbId) || await Users.getNameUser(event.logMessageData.leftParticipantFbId);
	const type = (event.author == event.logMessageData.leftParticipantFbId) ? 'self-separation' : 'kicked' ;
 

	try {
		if (type == 'self-separation') {
			if (data && data.antiout) {
				api.addUserToGroup(
					event.logMessageData.leftParticipantFbId,
					event.threadID,
					(error, info) => {
						if (error) {
							//removeUserEconomy(event.logMessageData.leftParticipantFbId);
    						return api.sendMessage(global.textFormat('group', 'groupAntiOutFailed', name), event.threadID)
						}
						api.sendMessage(global.textFormat('group', 'groupAntiOutSuccess', name, data.PREFIX || global.config.PREFIX), event.threadID);
						try {
							const ecoUIO = require('./event_economyUIO.js');
							ecoUIO.initUserEco({
								userID: event.logMessageData.leftParticipantFbId,
								threadID: event.threadID,
								Threads
							});
						} catch (err) {
							console.log(err);
						}
					}
				);
			}
		} else if (type == 'kicked') {
		
			return api.sendMessage(
				global.textFormat('group', 'groupAntiOutKicked', name),
				event.threadID
			);
		}
	} catch (err) {
		console.log(err);
		global.logModuleErrorToAdmin(err, __filename, event);
	}
}