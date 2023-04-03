module.exports.config = {
    name: 'guard',
    eventType: ['log:thread-admins'],
    version: '1.0.0',
    credits: 'Hadestia',
    description: 'Prevent admin changes',
};

module.exports.run = async function ({ event, api, GroupData, Utils, Threads, Users }) {
	
    const { logMessageType, logMessageData, senderID } = event;
	const data = GroupData.data;
	
	if (!data.guard) return;
	
    if (data.guard && logMessageType == 'log:thread-admins') {
    	
		function editAdminsCallback(err) {
			if (err) {
				return api.sendMessage(Utils.textFormat('group', 'groupAntiChangeError', err), event.threadID, event.messageID);
			}
			return api.sendMessage(Utils.textFormat('group', 'groupAntiChangeActiveResponse'), event.threadID, event.messageID);
		}
    	
		if (logMessageData.ADMIN_EVENT == 'add_admin') {
			
			if (event.author == api.getCurrentUserID()) return;
			if (logMessageData.TARGET_ID == api.getCurrentUserID()) return;

			api.changeAdminStatus(event.threadID, logMessageData.TARGET_ID, false, editAdminsCallback);

		} else if (logMessageData.ADMIN_EVENT == 'remove_admin') {
					
			if (event.author == api.getCurrentUserID()) return;
			if (logMessageData.TARGET_ID == api.getCurrentUserID()) return;
			
			api.changeAdminStatus(event.threadID, logMessageData.TARGET_ID, true, ()=>{});
		}
	}
}
