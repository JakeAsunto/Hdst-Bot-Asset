module.exports.config = {
    name: 'guard',
    eventType: ['log:thread-admins'],
    version: '1.0.0',
    credits: 'Hadestia',
    description: 'Prevent admin changes',
};

module.exports.run = async function ({ event, api, Threads, Users }) {
	
    const { logMessageType, logMessageData, senderID } = event;
	let data = (await Threads.getData(event.threadID)).data

	if (data.guard == false) return;
	
    if (data.guard == true && logMessageType == 'log:thread-admins') {
    	
		function editAdminsCallback(err) {
			if (err) {
				return api.sendMessage(global.textFormat('group', 'groupAntiChangeError', err), event.threadID, event.messageID);
			}
			return api.sendMessage(global.textFormat('group', 'groupAntiChangeActiveResponse'), event.threadID, event.messageID);
		}
    	
		if (logMessageData.ADMIN_EVENT == 'add_admin') {
			
			if(event.author == api.getCurrentUserID()) return
			if(logMessageData.TARGET_ID == api.getCurrentUserID()) return

		} else if (logMessageData.ADMIN_EVENT == 'remove_admin') {
					
			if (event.author == api.getCurrentUserID()) return
			if (logMessageData.TARGET_ID == api.getCurrentUserID()) return

		} else {
					
			api.changeAdminStatus(event.threadID, event.author, false, editAdminsCallback)
			api.changeAdminStatus(event.threadID, logMessageData.TARGET_ID, true)
			
		}
	}
}
