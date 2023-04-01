module.exports.config = {
	name: 'adminUpdate',
	eventType: ['log:thread-admins','log:thread-name', 'log:user-nickname','log:thread-icon','log:thread-color'],
	version: '1.0.1',
	credits: 'Mirai Team',
	description: 'Update team information quickly'
};

module.exports.run = async function ({ event, api, Utils, Threads, Users }) {
	
	const fs = require('fs');
    const { threadID, logMessageType, logMessageData } = event;

    const threadData = await Threads.getData(threadID);
    if (!threadData) return;
    
    const data = threadData.data;
    
    if (!data.adminUpdate) return;

    try {
    	
        let dataThread = threadData.threadInfo;
        
        switch (logMessageType) {
        	
            case 'log:thread-admins':
            	
            	let target = { name: 'A member' };
            	const user = await Users.getData(logMessageData.TARGET_ID);
				if (user) {
					target = user;
				}
				
            	if (logMessageData.ADMIN_EVENT == 'add_admin') {
                	
                    dataThread.adminIDs.push({ id: logMessageData.TARGET_ID })
						
					api.sendMessage(
						Utils.textFormat('group', 'groupGroupUpdatePromote', target.name || logMessageData.TARGET_ID),
						threadID,
					);
                    
                } else if (logMessageData.ADMIN_EVENT == 'remove_admin') {
                	
                    dataThread.adminIDs = dataThread.adminIDs.filter(item => item.id != logMessageData.TARGET_ID);
                    
					api.sendMessage(
						Utils.textFormat('group', 'groupGroupUpdateDemote', target.name || logMessageData.TARGET_ID),
						threadID,
                    );
                }
                break;

            case 'log:thread-name':
            
                dataThread.threadName = event.logMessageData.name || 'No name';
				api.sendMessage(
					global.textFormat('group', 'groupGroupUpdateGroupName', dataThread.threadName),
					threadID
                );
                break;
                
        }
        await Threads.setData(threadID, { threadInfo: dataThread });
        
    } catch (e) { console.log(e) };
}