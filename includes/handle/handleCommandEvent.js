module.exports = function({ api, models, Utils, Users, Threads, Banned }) {
	
    return function({ event, bannedUserData, bannedGroupData, groupData, userData }) {
    	
    	if (!groupData || !userData) return;
    	
    	const dateNow = Date.now();

        const { allowInbox } = global.HADESTIA_BOT_CONFIG;

        const { cooldowns, commands, eventRegistered } = global.HADESTIA_BOT_CLIENT;

        let { senderID, threadID } = event;

        senderID = String(senderID);
        threadID = String(threadID);
		
        // LEGACY CODE: if (bannedUsers.has(senderID) || bannedThreads.has(threadID) || allowInbox == !![] && senderID == threadID) return;

        for (const eventReg of eventRegistered) {
        	
			let pass1 = true; // user pass
			let pass2 = true; // group pass
			let pass3 = true; // PM pass
			
            const command = commands.get(eventReg);
			const config = command.config.envConfig || {};
			const allowBannedUser = config.handleEvent_allowBannedUsers || false;
			const allowBannedGroup = config.handleEvent_allowBannedThreads || false;
			const allowDirectMessage = config.handleEvent_allowDirectMessages || false;
			
			if (bannedUserData && !allowBannedUser) { pass1 = false; }
			if (bannedGroupData && !allowBannedGroup) { pass2 = false; }
			if (senderID == threadID && !allowDirectMessage) { pass3 = false; }
			// PATCH: 6.10.3 @Hadestia
			// checks whether command's handleEvent can interact with banned users/groups or even direct messages
			if (pass1 && pass2 && pass3) {
				
            	if (!HADESTIA_BOT_CLIENT.cooldowns.has(command.config.name)) {
					HADESTIA_BOT_CLIENT.cooldowns.set(command.config.name, new Map());
				}
				
          	  try {

               	 const Obj = {};
               
					Obj.api = api;

              	  Obj.event = event;

               	 Obj.models = models;
               
					Obj.Utils = Utils;

                	Obj.Users = Users;
                
                	Obj.Banned = Banned;
	
                	Obj.Threads = Threads;
                
               	 Obj.getText = Utils.getModuleText(command, event);
               
               	 if (command) command.handleEvent(Obj);

            	} catch (error) {
					console.log(error);
               	 Utils.logger(Utils.getText('handleCommandEvent', 'moduleError', command.config.name, error), 'error');

           	 }
       	 }
		}
    }
}


function allowDirectMessage(enable = false, senderID, threadID) {
	return enable && senderID == threadID;
}