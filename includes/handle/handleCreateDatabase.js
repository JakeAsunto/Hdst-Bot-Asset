//Mod by Nhật Tân

// ################ ANALYZED & DOCUMENTED By HADESTIA  ################ //

module.exports = function({ Users, Threads, Currencies }) {

    const logger = require("../../utils/log.js");
    const chalk = require("chalk");

    return async function({ event }) { // fetch messages events on message box ( group or dm message)
		
		// get tables from global data
        const {
        	allCurrenciesID,
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

        var threadID = String(threadID);

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

				// nothing special here just a random hex color for console logging
                var job = ["FF9900", "FFFF33", "33FFFF", "FF99FF", "FF3366", "FFFF66", "FF00FF", "66FF99", "00CCFF", "FF0099", "FF0066", "008E97", "F58220", "38B6FF", "7ED957", "97FFFF", "00BFFF", "76EEC6", "4EEE94", "98F5FF", "AFD788", "00B2BF", "9F79EE", "00FA9A"];

                const chalk = require('chalk');

                var random = job[Math.floor(Math.random() * job.length)]

                var random1 = job[Math.floor(Math.random() * job.length)]

                var random2 = job[Math.floor(Math.random() * job.length)]

				// set initial data for thread data on DB
                const THREAD_ALL_DATA = {};
                
                THREAD_ALL_DATA.threadInfo = dataThread;

                THREAD_ALL_DATA.data = {
					'rob_fail_probability': 0.5
				};

                // HADESTIA ECO & INV IMPLEMENTATIONS //
                
                THREAD_ALL_DATA.economy = {};

				THREAD_ALL_DATA.inventory = {};

				
                for (singleData of threadIn4.userInfo) {
					
					// sets each member a initial data for economy & inventory
					THREAD_ALL_DATA.economy[String(singleData.id)] = { hand: 0, bank: 0};
					// "" nextWorkAvail -- next available time to do work commamd
					// "" nextRobAvail -- next available time to do rob command
					
					THREAD_ALL_DATA.inventory[String(singleData.id)] = {};
					
                    userName.set(String(singleData.id), singleData.name);

                    try {
						// update member data on User table if exist
                    	if (global.data.allUserID.includes(String(singleData.id))) {
                    	
							await Users.setData(String(singleData.id), { 'name': singleData.name });
								
							global.data.allUserID.push(singleData.id);
							
						} else {

							// else: create data of a member for User table
							await Users.createData(singleData.id, { 'name': singleData.name, 'data': {} });
								
                            global.data.allUserID.push(String(singleData.id));
                            
                            global.data.allUserID.push(String(singleData.name));

                            logger(global.getText('handleCreateDatabase', 'newUser', chalk.hex("#" + random)(`New user:  `) + chalk.hex("#" + random1)(`${singleData.name}`) + "  ||  " + chalk.hex("#" + random2)(`${singleData.id}`)), '[ USER ]');
                            
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

                USER_ALL_DATA.name = infoUsers.name

                await Users.createData(senderID, USER_ALL_DATA)

                allUserID.push(senderID)

                userName.set(senderID, infoUsers.name)

                logger(global.getText('handleCreateDatabase', 'newUser', chalk.hex("#" + random)(`New users: `) + chalk.hex("#" + random1)(`${infoUsers.name}`) + " || " + chalk.hex("#" + random2)(`${senderID}`)), '[ USER ]');

            }

            if (!allCurrenciesID.includes(senderID)) {

                const CURRENCY_ALL_DATA = {};

                CURRENCY_ALL_DATA.data = {}

                await Currencies.createData(senderID, CURRENCY_ALL_DATA)

                allCurrenciesID.push(senderID);

            }

            return;

        } catch (err) {

            return console.log(err);

        }

    };

}