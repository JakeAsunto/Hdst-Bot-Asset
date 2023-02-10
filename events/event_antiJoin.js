module.exports.config = {
 name: 'antijoin',
 eventType: ['log:subscribe'],
 version: '1.0.0',
 credits: 'Hadestia',
 description: 'prevent new members to join',
};

module.exports.run = async function ({ event, api, Threads, Users }) {
	
 	let data = (await Threads.getData(event.threadID)).data;
 
 	// set data state (should be don with cmd)
 	// if (typeof data.antijoin == 'undefined' || data.antijoin == false) data.antijoin = true; else data.antijoin = false;
 
 	if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
		return
	} else if (data.antijoin) {
		
		const memJoin = event.logMessageData.addedParticipants.map(info => info.userFbId);
		
		for (let idUser of memJoin) {
			
			await new Promise(resolve => setTimeout(resolve, 1000));
			api.removeUserFromGroup(
				idUser,
				event.threadID,
				async function (err) {
					
					if (err) {
						data.antijoin = false;
						console.log('Anti join module : ' + err);
						return api.sendMessage(global.textFormat('group', 'groupAntiJoinError'), event.threadID);
					}
				
					await Threads.setData(event.threadID, { data });
					global.data.threadData.set(event.threadID, data);
				}
			);
			
		}
    }
}