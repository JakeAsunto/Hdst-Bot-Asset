module.exports = function({ Utils, Users, Threads, Banned }) {
	
	const databaseSystem = require(`${__dirname}/../../json/databaseConfig.json`); 
	const economySystem = require(`${__dirname}/../../json/economySystem.json`); 
    const chalk = require("chalk");
    
	// nothing special here just a random hex color for console logging
    let job = ["FF9900", "FFFF33", "33FFFF", "FF99FF", "FF3366", "FFFF66", "FF00FF", "66FF99", "00CCFF", "FF0099", "FF0066", "008E97", "F58220", "38B6FF", "7ED957", "97FFFF", "00BFFF", "76EEC6", "4EEE94", "98F5FF", "AFD788", "00B2BF", "9F79EE", "00FA9A"];
    
    return async function({ event }) {
    	
		const { updatedThreadDatabase } = global.HADESTIA_BOT_DATA;
		// check if automatic DB creation was set
        if (!global.HADESTIA_BOT_CONFIG.autoCreateDB) { return; }
        
        let { senderID, threadID } = event;

        senderID = String(senderID);
		threadID = String(threadID);
		
		const threadData = await Threads.getData(threadID);
		const userData = await Users.getData(senderID);
		
		const bannedGroupData = await Banned.getData(threadID);
		const bannedUserData = await Banned.getData(senderID);
		
        try {
			const inputData = {
				job,
				threadID,
				senderID,
				bannedGroupData,
				databaseSystem,
				economySystem,
				Utils,
				Users,
				Threads,
				Banned
			}
		    
			// ####### IF GROUP CHAT ####### //
			if (event.isGroup && !threadData) {
				await handleGroupData(null, inputData);
            }
			
            if (!userData) {
            	await handleUserData(null, inputData);
            }
            
            return;

        } catch (err) {  	
			console.log(err);
			throw err;
        }
    }
}

async function handleUserData(oldData, { job, senderID, bannedUserData, databaseSystem, economySystem, Utils, Users, Threads, Banned }) {
	
	const chalk = require('chalk');
	
	const init = oldData || {};
	const random = job[Math.floor(Math.random() * job.length)];
    const random1 = job[Math.floor(Math.random() * job.length)];
    const random2 = job[Math.floor(Math.random() * job.length)];

	const userName = await Users.getNameUser(senderID);
    
    const data = {};
    
    const USER_ALL_DATA = {};
    USER_ALL_DATA.name = infoUsers.name;
    
    for (const key in databaseSystem.user_data_config) {
    	if (typeof(data[key]) == 'undefined') {
			data[key] = databaseSystem.user_data_config[key];
		}
    }
    USER_ALL_DATA.data = data;
    
	// IF USER WAS BANNED
	if (bannedUserData) {
		const bd = bannedUserData.data || {};
		const banned = {
			name: userName,
			caseID: bd.caseID || -1,
			reason: bd.reason || databaseSystem.user_data_config.banned.reason,
			dateIssued: bd.dateIssued || databaseSystem.user_data_config.banned.dateIssued
		}
		USER_ALL_DATA.data.banned = banned;
		await Banned.setData(senderID, { data: banned });
	}
	// SAVE
	await Users.setData(senderID, USER_ALL_DATA);
    Utils.logger(Utils.getText('handleCreateDatabase', 'newUser', chalk.hex("#" + random)(`New users: `) + chalk.hex("#" + random1)(`${infoUsers.name}`) + " || " + chalk.hex("#" + random2)(`${senderID}`)), '[ USER ]');
    
    return;
}


async function handleGroupData(oldData, { job, threadID, bannedGroupData, databaseSystem, economySystem, Utils, Users, Threads, Banned }) {
	
	const chalk = require('chalk');
	
	const init = oldData || {};
	const random = job[Math.floor(Math.random() * job.length)];
    const random1 = job[Math.floor(Math.random() * job.length)];
    const random2 = job[Math.floor(Math.random() * job.length)];
    
	// get group chat information
    const threadIn4 = await Threads.getInfo(threadID);

    const setting = {}
	// set initial data for thread information on DB
    setting.threadName = threadIn4.threadName;
	setting.adminIDs = threadIn4.adminIDs;
	setting.nicknames = threadIn4.nicknames;
	
	// set initial data for thread data on DB
    const THREAD_ALL_DATA = init;
    THREAD_ALL_DATA.data = init.data || {};           
    THREAD_ALL_DATA.threadInfo = setting;
    THREAD_ALL_DATA.inventory = init.inventory || {};
    THREAD_ALL_DATA.economy = init.economy || {};
	THREAD_ALL_DATA.afk = init.afk || {};
	
	// default config
	for (const item in databaseSystem.group_data_config) {
		if (typeof(THREAD_ALL_DATA.data[item]) == 'undefined') {
			THREAD_ALL_DATA.data[item] = databaseSystem.group_data_config[item];
		}
	}

	// default configuration for economy system for this group
	for (const item in economySystem.config) {
		if (typeof(THREAD_ALL_DATA.data[item]) == 'undefined') {
			THREAD_ALL_DATA.data[item] = economySystem.config[item];
		}
	}
				
	// IF THREAD WAS BANNED
	if (bannedGroupData) {
		const bd = bannedGroupData.data || {};
		const banned = {
			name: threadIn4.threadName,
			caseID: bd.caseID || -1,
			reason: bd.reason || databaseSystem.group_data_config.banned.reason,
			dateIssued: bd.dateIssued || databaseSystem.group_data_config.banned.dateIssued
		}
		THREAD_ALL_DATA.data.banned = banned;
		await Banned.setData(threadID, { data: banned });
	}
				
	for (singleData of threadIn4.userInfo) {
		// sets each member a initial data for economy & inventory
		const UID = String(singleData.id);
		
		const userEco = THREAD_ALL_DATA.economy[UID] || {};
		
		for (const key in economySystem.userConfig) {
			if (typeof(userEco[key]) == 'undefined') {
				userEco[key] = economySystem.userConfig[key];
			}
		}
		
		THREAD_ALL_DATA.economy[UID] = userEco;

        try {
			// update member data on User table if exist
			const thisGroupUserData = await Users.getData(UID);
            if (thisGroupUserData) {
            	
            	const data = thisGroupUserData.data || {};
            	for (const key in databaseSystem.user_data_config) {
            		if (typeof(data[key]) == 'undefined') data[key] = databaseSystem.user_data_config[key];
            	}
            	
				await Users.setData(UID, { 'name': singleData.name });
				
			} else {
				
				const data = new Object(databaseSystem.user_data_config);
				const thisUserBannedData = await Banned.getData(UID);
							
				// IF USER WAS BANNED
				if (thisUserBannedData) {
					
					const bd = thisUserBannedData.data || {};
					const banned = {
						name: singleData.name,
						caseID: bd.caseID || -1,
						reason: bd.reason || databaseSystem.user_data_config.banned.reason,
						dateIssued: bd.dateIssued || databaseSystem.user_data_config.banned.dateIssued
					}
					data.banned = banned;
					await Banned.setData(UID, { data: banned });
				}
							
				// SAVE
				await Users.setData(UID, { name: singleData.name, data: data });
				Utils.logger(Utils.getText('handleCreateDatabase', 'newUser', chalk.hex("#" + random)(`New user:  `) + chalk.hex("#" + random1)(`${singleData.name}`) + "  ||  " + chalk.hex("#" + random2)(`${UID}`)), '[ USER ]');
			}
		} catch (e) {
			console.log(e);
		}
	}
	// SAVE
	await Threads.setData(threadID, THREAD_ALL_DATA);
	// it means this was a new thread
	if (!oldData) {
		Utils.logger(Utils.getText('handleCreateDatabase', 'newThread', chalk.hex("#" + random)(`New group: `) + chalk.hex("#" + random1)(`${threadID}`) + "  ||  " + chalk.hex("#" + random2)(`${threadIn4.threadName}`)), '[ THREAD ]');
		return true;
	} else {
		Utils.logger(`Updated GROUP: ${threadIn4.threadName}(${threadID})`, 'database');
		return true;
	}
	return false;
}