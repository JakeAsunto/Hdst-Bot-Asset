/**
* @author ProCoderMew, fixed by Hadestia
* @warn Do not edit code or edit credits
*/

module.exports.config = {
	name: 'add-user',
	version: '2.4.4',
	hasPermssion: 0,
	credits: 'ProCoderMew', // fixed by Hadestia
	description: 'Add user to the group by link or id',
	commandCategory: 'group',
	usages: '< uid | link >',
	cooldowns: 60,
	envConfig: {
		requiredArgument: 1
	},
	dependencies: {
		'axios': ''
	}
};

async function getUID(link) {
	const axios = require('axios');
	
	const res = await axios.get(`https://api.phamvandien.xyz/finduid?url=${encodeURI(link)}`);
	if (res.data) {
		return res.data.id;
	} else {
		return null;
	}
}

module.exports.run = async function ({ api, event, args, textFormat }) {
	
	const { threadID, messageID } = event;
	const botID = api.getCurrentUserID();
	const out = msg => api.sendMessage(msg, threadID, messageID);
	var { participantIDs, approvalMode, adminIDs } = await api.getThreadInfo(threadID);
	var participantIDs = participantIDs.map(e => parseInt(e));
	
	if (!args[0]) return 'invalid_usage';

	const target_id = parseInt(args[0]) || null;
	
	if (!target_id) {
		try {
			
			var result = await getUID(args[0]);
			
			if (!result) {
				
				return out(textFormat('group', 'groupAddUserNotFound'))
				
			} else {
				
				await adduser(id);
				
			}
			
		} catch (e) {
			
			return out(`${e.name}: ${e.message}.`);
			
		}
	} else {
		if (args[0].length < 15) return out(textFormat('error', 'errInvalidUserID'));
		adduser(args[0]);
	}
	
	
	
	async function adduser(id) {
		
		const target = await api.getUserInfoV2(id);
		// id = parseInt(id);
	
		if (participantIDs.includes(id)) {
			
			return out(textFormat('group', 'groupAddUserAlreadyInGroup', target.name || 'user'));
			
		} else {
			
			var admins = adminIDs.map(e => parseInt(e.id));
			
			try {
				
				await api.addUserToGroup(id, threadID);
				
			} catch {
				
				return out(textFormat('group', 'groupAddUserAddedFailed', target.name || 'user'));
			}
			
			if (approvalMode === true && !admins.includes(botID)) {
				
				return out(textFormat('group', 'groupAddUserAddToPending', target.name || 'member'));
				
			} else {
				
				return out(textFormat('group', 'groupAddUserAddedSuccess', target.name || 'member'))
			}
		}
	}
}