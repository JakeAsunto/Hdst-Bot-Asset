module.exports.config = {
	name: 'adminUpdate',
	eventType: ['log:thread-admins','log:thread-name', 'log:user-nickname','log:thread-icon','log:thread-color'],
	version: '1.0.1',
	credits: 'Mirai Team',
	description: 'Update team information quickly',
	envConfig: {
		needsDataFetching: true
	}
};

module.exports.run = async function ({ event, api, GroupData, Utils, Threads, Users }) {
	
	const fs = require('fs');
    const { threadID, logMessageType, logMessageData } = event;

    const data = GroupData.data;
    
    if (!data.adminUpdate) return;

    try {
    	
        let dataThread = GroupData.threadInfo;
        
        switch (logMessageType) {
        	
            case 'log:thread-admins':
            	
            	const user = await Users.getNameUser(logMessageData.TARGET_ID);
            
            	if (logMessageData.ADMIN_EVENT == 'add_admin') {
                	
                    dataThread.adminIDs.push({ id: logMessageData.TARGET_ID })
						
					api.sendMessage(
						Utils.textFormat('group', 'groupGroupUpdatePromote', user || logMessageData.TARGET_ID),
						threadID,
					);
                    
                } else if (logMessageData.ADMIN_EVENT == 'remove_admin') {
                	
                    dataThread.adminIDs = dataThread.adminIDs.filter(item => item.id != logMessageData.TARGET_ID);
                    
					api.sendMessage(
						Utils.textFormat('group', 'groupGroupUpdateDemote', user || logMessageData.TARGET_ID),
						threadID,
                    );
                }
                break;

            case 'log:thread-name':
            
                dataThread.threadName = event.logMessageData.name || 'No name';
				api.sendMessage(
					Utils.textFormat('group', 'groupGroupUpdateGroupName', dataThread.threadName),
					threadID
                );
                break;
                
        }
        await Threads.setData(threadID, { threadInfo: dataThread });
        
    } catch (e) { console.log(e) };
}