module.exports.config = {
	name: "log",
	eventType: ["log:unsubscribe","log:subscribe","log:thread-name"],
	version: "1.0.2",
	credits: "Mirai Team", // modified by Hadestia
	description: "Record bot activity notifications.",
    envConfig: {
        enable: true
    }
};

module.exports.run = async function({ api, event, Threads }) {
	
    // if (!global.configModule[this.config.name].enable) return;
    
    const logger = require(`${global.client.mainPath}/utils/log`);
    const { threadName, participantIDs, imageSrc } = await api.getThreadInfo(event.threadID);
    const moment = require('moment-timezone');

	const date = moment.tz("Asia/Manila").format("MM/DD/YYYY");
	const time = moment.tz("Asia/Manila").format("HH:mm:ss");
	const res = await api.getUserInfo(event.author);
	let action;
	
	try { 
   	 switch (event.logMessageType) {
    	
     	   case "log:thread-name":
        
   	         const oldInfo = (global.data.threadInfo).get(threadID) || {};
  	          const oldName = oldInfo.threadName || 'Unknown';
      	      action = `Update the group name from ${oldName} to '${threadName}'`;
   	        // await Threads.setData(event.threadID, { name: threadName })
   	         break;
        
  	      case "log:subscribe":
        
   	         if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
					action = "User added bot to the group";
				}
 	           break;
        
  	      case "log:unsubscribe":
        
   	         if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) {
					action = "User kicked bot out of the group";
					//try { await Threads.delData(event.threadID); } catch {}
				}
    	        break;
        
   	     default: 
        
    	        break;
  	  }
    
 	   if (action) {
  	  	const messageBody = global.textFormat('events', 'eventBotLogs', date, event.threadID, threadName, participantIDs.length, action, res.name || event.author, event.author);
    		api.sendMessage(
				messageBody,
				global.config.ADMINBOT[0],
				(err) => {
					if (err) return logger('event_botLog.js ' + err, 'error');
				}
			);
		}
    } catch (err) {
    	console.log(err);
    	global.logModuleErrorToAdmin(err, __filename, event);
    }
}