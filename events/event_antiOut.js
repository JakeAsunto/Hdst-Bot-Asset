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
			await Threads.delData(event.threadID);
		} catch {}
		return;
	}
	
	const name = global.data.userName.get(event.logMessageData.leftParticipantFbId) || await Users.getNameUser(event.logMessageData.leftParticipantFbId);
	const type = (event.author == event.logMessageData.leftParticipantFbId) ? 'self-separation' : 'kicked' ;
 
	if (type == 'self-separation' && data.antiout) {
		
		try {
			api.addUserToGroup(
				event.logMessageData.leftParticipantFbId,
				event.threadID,
				(error, info) => {
					if (error) {
						//removeUserEconomy(event.logMessageData.leftParticipantFbId);
    					return api.sendMessage(global.textFormat('group', 'groupAntiOutFailed', name), event.threadID)
					}
					api.sendMessage(global.textFormat('group', 'groupAntiOutSuccess', name), event.threadID);
				}
			);
		} catch (e) {
			
		}
		
	} else if (type == 'kicked') {
		
		return api.sendMessage(
			global.textFormat('group', 'groupAntiOutKicked', name),
			event.threadID
		);
	}
}
