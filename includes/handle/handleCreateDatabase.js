//Mod by Nhật Tân

// ################ ANALYZED & DOCUMENTED By HADESTIA  ################ //

module.exports = function({ Utils, Users, Threads, Banned }) {

	const databaseSystem = require(`${__dirname}/../../json/databaseConfig.json`); 
	const economySystem = require(`${__dirname}/../../json/economySystem.json`); 
    const chalk = require("chalk");
    
    // nothing special here just a random hex color for console logging
    let job = ["FF9900", "FFFF33", "33FFFF", "FF99FF", "FF3366", "FFFF66", "FF00FF", "66FF99", "00CCFF", "FF0099", "FF0066", "008E97", "F58220", "38B6FF", "7ED957", "97FFFF", "00BFFF", "76EEC6", "4EEE94", "98F5FF", "AFD788", "00B2BF", "9F79EE", "00FA9A"];
    
    return async function({ event, bannedUserData: userBannedData, bannedGroupData: groupBannedData }) {
    	
    	const random = job[Math.floor(Math.random() * job.length)];
        const random1 = job[Math.floor(Math.random() * job.length)];
        const random2 = job[Math.floor(Math.random() * job.length)];

		// check if automatic DB creation was set
        if (!global.HADESTIA_BOT_CONFIG.autoCreateDB) { return; }
        
        let { senderID, threadID } = event;

        senderID = String(senderID);
		threadID = String(threadID);
		
		const threadData = await Threads.getData(threadID);
		const userData = await Users.getData(senderID);
		
        try {
			
			// ####### IF GROUP CHAT ####### //
		    
			// check if this group chat does not exist from the table
            if (!threadData && event.isGroup == !![]) {

				// get group chat information
                const threadIn4 = await Threads.getInfo(threadID);

                const setting = {};
				// set initial data for thread information on DB
                setting.threadName = threadIn4.threadName

                setting.adminIDs = threadIn4.adminIDs

                setting.nicknames = threadIn4.nicknames;

                const dataThread = setting;

				// insert this group chat id to local table of all GCs
                allThreadID.push(threadID) // insert this group to 
				
				// insert this thread info. also in the local table of GCs infos.
                threadInfo.set(threadID, dataThread);

				// set initial data for thread data on DB
                const THREAD_ALL_DATA = {};
                
                THREAD_ALL_DATA.threadInfo = dataThread;

                THREAD_ALL_DATA.data = new Object(databaseSystem.group_data_config);
				
				// IF THREAD WAS BANNED
				if (groupBannedData) {
					const bd = groupBannedData.data || {};
					const banned = {
						caseID: bd.caseID || -1,
						reason: bd.reason || databaseSystem.group_data_config.banned.reason,
						dateIssued: bd.dateIssued || databaseSystem.group_data_config.banned.dateIssued
					}
					THREAD_ALL_DATA.data.banned = banned;
					global.HADESTIA_BOT_DATA.bannedThreads.set(threadID, banned);
				}
				
				// default configuration for economy system for this group
				for (const item in economySystem.config) {
					THREAD_ALL_DATA.data[item] = economySystem.config[item];
				}
			
                // HADESTIA IMPLEMENTATIONS //
                
                THREAD_ALL_DATA.economy = {};

				THREAD_ALL_DATA.inventory = {};
				
				THREAD_ALL_DATA.afk = {};

				//console.log(threadIn4);
				
                for (singleData of threadIn4.userInfo) {
					
					// sets each member a initial data for economy & inventory
					const userEco = economySystem.userConfig;
					// update user work cooldown to 1 minute so that data base for this group would be created first
					userEco.work_cooldown = Date.now() + 60000;
					THREAD_ALL_DATA.economy[String(singleData.id)] = userEco;
					THREAD_ALL_DATA.inventory[String(singleData.id)] = {};
					
                    try {
						// update member data on User table if exist
						const UID = String(singleData.id);
						const thisGroupUserData = await Users.getData(UID);
						
                    	if (thisGroupUserData) {
                    	
							await Users.setData(UID, { 'name': singleData.name });
								
							global.HADESTIA_BOT_DATA.allUserID.push(UID);
							
						} else {
							const data = new Object(databaseSystem.user_data_config);
							const thisUserBannedData = await Banned.getData(UID);
							
							// IF USER WAS BANNED
							if (thisUserBannedData) {
								const bd = thisUserBannedData.data || {};
								const banned = {
									caseID: bd.caseID || -1,
									reason: bd.reason || databaseSystem.user_data_config.banned.reason,
									dateIssued: bd.dateIssued || databaseSystem.user_data_config.banned.dateIssued
								}
								data.banned = banned;
							}
							
							// SAVE
							await Users.createData(UID, { 'name': singleData.name, 'data': data });
                            Utils.logger(global.getText('handleCreateDatabase', 'newUser', chalk.hex("#" + random)(`New user:  `) + chalk.hex("#" + random1)(`${singleData.name}`) + "  ||  " + chalk.hex("#" + random2)(`${UID}`)), '[ USER ]');
                            
						}

                    } catch (e) {
                        console.log(e);
                    }
                }
                // SAVE
				await Threads.setData(threadID, THREAD_ALL_DATA);
                Utils.logger(global.getText('handleCreateDatabase', 'newThread', chalk.hex("#" + random)(`New group: `) + chalk.hex("#" + random1)(`${threadID}`) + "  ||  " + chalk.hex("#" + random2)(`${threadIn4.threadName}`)), '[ THREAD ]');

            }

            if (!userData) {

                const infoUsers = await Users.getInfo(senderID);
                const USER_ALL_DATA = {};

                USER_ALL_DATA.name = infoUsers.name;
                
                USER_ALL_DATA.data = new Object(databaseSystem.user_data_config);
                
                // IF USER WAS BANNED
				if (userBannedData) {
					const bd = userBannedData.data || {};
					const banned = {
						caseID: bd.caseID || -1,
						reason: bd.reason || databaseSystem.user_data_config.banned.reason,
						dateIssued: bd.dateIssued || databaseSystem.user_data_config.banned.dateIssued
					}
					USER_ALL_DATA.data.banned = banned;
				}
                
                // SAVE
                await Users.createData(senderID, USER_ALL_DATA);
                Utils.logger(global.getText('handleCreateDatabase', 'newUser', chalk.hex("#" + random)(`New users: `) + chalk.hex("#" + random1)(`${infoUsers.name}`) + " || " + chalk.hex("#" + random2)(`${senderID}`)), '[ USER ]');

            }
            
            return;

        } catch (err) {

            return console.log(err);

        }

    };

}