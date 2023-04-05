module.exports.config = {
	name: 'log',
	eventType: ['log:unsubscribe','log:subscribe','log:thread-name'],
	version: '1.0.2',
	credits: 'Mirai Team', // modified by Hadestia
	description: 'Record bot activity notifications.',
    dependencies: {
    	'moment-timezone': ''
    },
    envConfig: {
		needGroupData: true
	}
};

module.exports.run = async function({ api, event, Utils, Users, Threads, Banned }) {
	
	const moment = require('moment-timezone');
	
    const threadInfo = await api.getThreadInfo(event.threadID);
    
	const date = moment.tz('Asia/Manila').format('MM/DD/YYYY');
	const time = moment.tz('Asia/Manila').format('HH:mm:ss');
	const res = await api.getUserInfo(event.author);
	const { threadID, author } = event;
	
	let action;
	
	try { 
   	 switch (event.logMessageType) {
    	
     	   case 'log:thread-name':
				const threadData = await Threads.getData(event.threadID);
        		const oldInfo = threadData.threadInfo;
				
      	      action = `Update the group name from '${oldInfo.threadName}' to '${threadInfo.threadName}'`;
   	         await Threads.setData(threadID, { threadInfo });
   
				const ban = await Banned.getData(threadID);
				if (ban) {
					const data = ban.data;
					data.name = threadInfo.threadName;
					await Banned.setData(threadID, { data });
				}
   	         break;
        
  	      case 'log:subscribe':
        
   	         if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
					action = 'User added bot to the group';
				}
 	           break;
        
  	      case 'log:unsubscribe':
        
   	         if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) {
					action = 'User kicked bot out of the group';
					// # Moved to event.antiOut
					// try { await Threads.delData(threadID); } catch (e) { console.log(e) }
				}
    	        break;
        
   	     default: 
        
    	        break;
  	  }
    
 	   if (action) {
  	  	const messageBody = Utils.textFormat('events', 'eventBotLogs', date, threadID, threadInfo.threadName, threadInfo.participantIDs.length, action, res.name || author, author);
			for (const adminID of global.HADESTIA_BOT_CONFIG.ADMINBOT) {
    			api.sendMessage(
					messageBody,
					adminID,
					(err) => {
						if (err) return Utils.logger('event_botLog.js ' + err, 'error');
					}
				);
			}
		}
    } catch (err) {
    	console.log(err);
    	Utils.logModuleErrorToAdmin(err, __filename, event);
    }
}