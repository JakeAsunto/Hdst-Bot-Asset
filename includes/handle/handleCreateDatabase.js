//Mod by Nhật Tân

// ################ ANALYZED & DOCUMENTED By HADESTIA  ################ //

module.exports = function({ Users, Threads }) {

	const databaseSystem = require(`${__dirname}/../../json/databaseConfig.json`); 
	const economySystem = require(`${__dirname}/../../json/economySystem.json`); 
    const logger = require("../../utils/log.js");
    const chalk = require("chalk");

    return async function({ event }) { // fetch messages events on message box ( group or dm message)
		
		// get tables from global data
        const {
			allUserID,
			allThreadID,
			userName,
			threadInfo,
		} = global.data;

		// check if automatic DB creation was set
        const { autoCreateDB } = global.config;
		
		// early return if not set
        if (autoCreateDB == ![]) { return; }

		// fetch special event
        var { senderID, threadID } = event;

		// convert senderID & threadID to string
        senderID = String(senderID);
		threadID = String(threadID);
		
		// nothing special here just a random hex color for console logging
        var job = ["FF9900", "FFFF33", "33FFFF", "FF99FF", "FF3366", "FFFF66", "FF00FF", "66FF99", "00CCFF", "FF0099", "FF0066", "008E97", "F58220", "38B6FF", "7ED957", "97FFFF", "00BFFF", "76EEC6", "4EEE94", "98F5FF", "AFD788", "00B2BF", "9F79EE", "00FA9A"];

        const chalk = require('chalk');

        var random = job[Math.floor(Math.random() * job.length)]

        var random1 = job[Math.floor(Math.random() * job.length)]

        var random2 = job[Math.floor(Math.random() * job.length)]

        try {
			
			// ####### IF GROUP CHAT ####### //
		    
			// check if this group chat does not exist from the table
            if (!allThreadID.includes(threadID) && event.isGroup == !![]) {

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
					
                    userName.set(String(singleData.id), singleData.name);

                    try {
						// update member data on User table if exist
						const uid = String(singleData.id);
                    	if (global.data.allUserID.includes(uid)) {
                    	
							await Users.setData(uid, { 'name': singleData.name });
								
							global.data.allUserID.push(uid);
							
						} else {
							const data = new Object(databaseSystem.user_data_config);
							// else: create data of a member for User table
							await Users.createData(uid, { 'name': singleData.name, 'data': data });
								
                            global.data.allUserID.push(uid);
                            
                            global.data.userName.set(uid, String(singleData.name));

                            logger(global.getText('handleCreateDatabase', 'newUser', chalk.hex("#" + random)(`New user:  `) + chalk.hex("#" + random1)(`${singleData.name}`) + "  ||  " + chalk.hex("#" + random2)(`${uid}`)), '[ USER ]');
                            
						}

                    } catch (e) {
                        console.log(e)
                    };

                }
                // save data to Thread DB
				await Threads.setData(threadID, THREAD_ALL_DATA);

                logger(global.getText('handleCreateDatabase', 'newThread', chalk.hex("#" + random)(`New group: `) + chalk.hex("#" + random1)(`${threadID}`) + "  ||  " + chalk.hex("#" + random2)(`${threadIn4.threadName}`)), '[ THREAD ]');

            }

            if (!allUserID.includes(senderID) || !userName.has(senderID)) {

                const infoUsers = await Users.getInfo(senderID);

                const USER_ALL_DATA = {};

                USER_ALL_DATA.name = infoUsers.name;
                
                USER_ALL_DATA.data = new Object(databaseSystem.user_data_config);
                await Users.createData(senderID, USER_ALL_DATA);

                allUserID.push(senderID)

                userName.set(senderID, infoUsers.name)

                logger(global.getText('handleCreateDatabase', 'newUser', chalk.hex("#" + random)(`New users: `) + chalk.hex("#" + random1)(`${infoUsers.name}`) + " || " + chalk.hex("#" + random2)(`${senderID}`)), '[ USER ]');

            }
            
            return;

        } catch (err) {

            return console.log(err);

        }

    };

}