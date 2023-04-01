module.exports.config = {
 name: 'antijoin',
 eventType: ['log:subscribe'],
 version: '1.0.0',
 credits: 'Hadestia',
 description: 'prevent new members to join',
};

module.exports.run = async function ({ event, api, Threads, Users }) {
	
	const threadInfo = await api.getThreadInfo(event.threadID);
	const threadData = await Threads.getData(event.threadID) || {};
	const data = threadData.data || {};
 	// set data state (should be on with cmd)
 	// if (typeof data.antijoin == 'undefined' || data.antijoin == false) data.antijoin = true; else data.antijoin = false;
 
 	if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
		return;
	} else if (data.antijoin) {
		
		const bot_is_admkn = threadInfo.adminIDs.find(e => e.id == api.getCurrentUserID());
		if (!bot_is_admin) {
			return api.sendMessage(
				global.textFormat('error', 'errOccured', 'Unable to perform "Anti Join Mode"\n● reason: Bot needs to be an admin.'),
				event.threadID
			);
		}
		
		const memJoin = event.logMessageData.addedParticipants;
		
		for (let user of memJoin) {
			
			await new Promise(resolve => setTimeout(resolve, 1000));
			api.removeUserFromGroup(
				user.userFbId,
				event.threadID,
				async function (err) {
					
					if (err) {
						data.antijoin = false;
						
						await Threads.setData(event.threadID, { data });
						global.data.threadData.set(event.threadID, data);
						
						console.log('Anti join module : ' + err);
						return api.sendMessage(global.textFormat('group', 'groupAntiJoinError'), event.threadID);
					}
				}
			);
		}
    }
}