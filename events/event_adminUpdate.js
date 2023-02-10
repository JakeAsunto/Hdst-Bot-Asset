module.exports.config = {
	name: 'adminUpdate',
	eventType: ['log:thread-admins','log:thread-name', 'log:user-nickname','log:thread-icon','log:thread-color'],
	version: '1.0.1',
	credits: 'Mirai Team',
	description: 'Update team information quickly',
    envConfig: {
        sendNoti: true
    }
};

module.exports.run = async function ({ event, api, Threads, Users }) {
	
	const fs = require('fs');
	// var iconPath = __dirname + '/emoji.json';
	
	//if (!fs.existsSync(iconPath)) fs.writeFileSync(iconPath, JSON.stringify({}));
	
    const { threadID, logMessageType, logMessageData } = event;
    const { setData, getData } = Threads;

    const thread = global.data.threadData.get(threadID) || {};
    
    if (typeof thread['adminUpdate'] != 'undefined' && thread['adminUpdate'] == false) return;

    try {
    	
        let dataThread = (await getData(threadID)).threadInfo;
        
        switch (logMessageType) {
        	
            case 'log:thread-admins':
            	
            	const target = await api.getUserInfoV2(logMessageData.TARGET_ID);
            
            	if (logMessageData.ADMIN_EVENT == 'add_admin') {
                	
                    dataThread.adminIDs.push({ id: logMessageData.TARGET_ID })
                    
                    if (global.configModule[this.config.name].sendNoti) {
						
						api.sendMessage(
							global.textFormat('group', 'groupGroupUpdatePromote', target.name || logMessageData.TARGET_ID),
							threadID,
							async (error, info) => {
                        		if (global.configModule[this.config.name].autoUnsend) {
                                	await new Promise(resolve => setTimeout(resolve, global.configModule[this.config.name].timeToUnsend * 1000));
                                    return api.unsendMessage(info.messageID);
                                }
                        	}
						);
                    }
                    
                } else if (logMessageData.ADMIN_EVENT == 'remove_admin') {
                	
                    dataThread.adminIDs = dataThread.adminIDs.filter(item => item.id != logMessageData.TARGET_ID);
                    
                    if (global.configModule[this.config.name].sendNoti) {
						api.sendMessage(
							global.textFormat('group', 'groupGroupUpdateDemote', target.name || logMessageData.TARGET_ID),
							threadID,
							async (error, info) => {
								if (global.configModule[this.config.name].autoUnsend) {
									await new Promise(resolve => setTimeout(resolve, global.configModule[this.config.name].timeToUnsend * 1000));
									return api.unsendMessage(info.messageID);
								}
							}
                    	);
                	}
                }
                
                break;

            case 'log:thread-name':
            
                dataThread.threadName = event.logMessageData.name || 'No name';
                
                if (global.configModule[this.config.name].sendNoti) {
					api.sendMessage(
						global.textFormat('group', 'groupGroupUpdateGroupName', dataThread.threadName),
						threadID,
						async (error, info) => {
                    		if (global.configModule[this.config.name].autoUnsend) {
                        		await new Promise(resolve => setTimeout(resolve, global.configModule[this.config.name].timeToUnsend * 1000));
                        		return api.unsendMessage(info.messageID);
                       	 }
						}
                	);
                }
                break;
                
        }
        await setData(threadID, { threadInfo: dataThread });
        
    } catch (e) { console.log(e) };
}