module.exports = function({ api, models, Utils, Users, Threads, Banned }) {
	
    return async function({ event }) {
    		
    	const dateNow = Date.now();

        const { allowInbox, PREFIX } = global.HADESTIA_BOT_CONFIG;

        const { cooldowns, commands, eventRegistered } = global.HADESTIA_BOT_CLIENT;

        let { senderID, threadID } = event;
        
        senderID = String(senderID);
        threadID = String(threadID);
        
        const bannedUserData = await Banned.getData(senderID);
        const bannedGroupData = await Banned.getData(threadID);
        const groupData = await Threads.getData(threadID);
        const userData = await Users.getData(senderID);
        
		const prefix = (groupData) ? groupData.data.PREFIX || PREFIX : PREFIX;
        // LEGACY CODE: if (bannedUsers.has(senderID) || bannedThreads.has(threadID) || allowInbox == !![] && senderID == threadID) return;

        for (const eventReg of eventRegistered) {
        	
            const command = commands.get(eventReg);
			const config = command.config.envConfig || {};
			
			// allow ban User
			let pass1 = (!config.handleEvent_allowBannedUsers) ? (bannedUserData) ? false : true : true;
			// allow ban threads
			let pass2 = (!config.handleEvent_allowBannedThreads) ? (bannedGroupData) ? false : true : true;
			// allow direct message
			let pass3 = (!config.handleEvent_allowDirectMessages) ? (senderID == threadID) ? false : true : true;
			// needs group data or user data
			let pass4 = (config.needGroupData) ? (groupData) ? true : false : true;
			let pass5 = (config.needUserData) ? (userData) ? true : false : true;
			
			// PATCH: 6.10.3 @Hadestia
			// checks whether command's handleEvent can interact with banned users/groups or even direct messages
			if (pass1 && pass2 && pass3 && pass4 && pass5) {
				
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
                
                	Obj.Prefix = prefix;
                
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