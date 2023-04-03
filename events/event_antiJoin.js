module.exports.config = {
	name: 'antijoin',
	eventType: ['log:subscribe'],
	version: '1.0.0',
	credits: 'Hadestia',
	description: 'prevent new members to join',
	envConfig: {
		needsDataFetching: true
	}
};

module.exports.run = async function ({ event, api, Utils, Threads, Users }) {
	
	const threadData = await Threads.getData(event.threadID);
	const threadInfo = threadData.threadInfo;
	const data = threadData.data;

	if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
		return;
	} else if (data.antijoin) {
		
		const bot_is_admin = threadInfo.adminIDs.find(e => e.id == api.getCurrentUserID());
		if (!bot_is_admin) {
			return api.sendMessage(
				Utils.textFormat('error', 'errOccured', 'Unable to perform "Anti Join Mode"\n● reason: Bot needs to be an admin.'),
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
					if (err) return api.sendMessage(Utils.textFormat('group', 'groupAntiJoinError'), event.threadID, ()=>{});
				}
			);
		}
    }
}