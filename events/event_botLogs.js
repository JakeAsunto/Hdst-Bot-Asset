module.exports.config = {
	name: "log",
	eventType: ["log:unsubscribe","log:subscribe","log:thread-name"],
	version: "1.0.2",
	credits: "Mirai Team", // modified by Hadestia
	description: "Record bot activity notifications.",
    dependencies: {
    	'moment-timezone': ''
    }
};

module.exports.run = async function({ api, event, Utils, Users, Threads, Banned }) {
	
    const threadInfo = await api.getThreadInfo(event.threadID);
    const moment = require('moment-timezone');

	const date = moment.tz("Asia/Manila").format("MM/DD/YYYY");
	const time = moment.tz("Asia/Manila").format("HH:mm:ss");
	const res = await api.getUserInfo(event.author);
	const { threadID, author } = event;
	
	let action;
	
	try { 
   	 switch (event.logMessageType) {
    	
     	   case "log:thread-name":
        		const oldInfo = await Threads.getData(threadID);
				
      	      action = `Update the group name from '${oldInfo.threadInfo.threadName}' to '${threadName}'`;
   	         await Threads.setData(threadID, { threadInfo });
   
				const ban = await Banned.getData(threadID);
				if (ban) {
					const data = ban.data;
					data.name = threadName;
					await Banned.setData(threadID, { data });
				}
   	         break;
        
  	      case "log:subscribe":
        
   	         if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
					action = "User added bot to the group";
					// try to intialize group data
					try {
						const handleDB = require(`${global.HADESTIA_BOT_CLIENT.mainPath}/includes/handle/handleCreateDatabase.js`)({ Utils, Users, Threads, Banned });
						await handleDB({ event });
					} catch (err) {}
				}
 	           break;
        
  	      case "log:unsubscribe":
        
   	         if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) {
					action = "User kicked bot out of the group";
					try { await Threads.delData(event.threadID); } catch {}
				}
    	        break;
        
   	     default: 
        
    	        break;
  	  }
    
 	   if (action) {
  	  	const messageBody = Utils.textFormat('events', 'eventBotLogs', date, threadID, threadInfo.threadName, threadInfo.participantIDs.length, action, res.name || author, author);
    		api.sendMessage(
				messageBody,
				global.HADESTIA_BOT_CONFIG.ADMINBOT[0],
				(err) => {
					if (err) return Utils.logger('event_botLog.js ' + err, 'error');
				}
			);
		}
    } catch (err) {
    	console.log(err);
    	Utils.logModuleErrorToAdmin(err, __filename, event);
    }
}