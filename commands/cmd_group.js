module.exports.config = {
	name: 'group-set',
	version: '2.0.0',
	hasPermssion: 3,
	commandCategory: 'group',
	description: 'Sets specific type for a group/thread',
	usages: '\n[ name | admin | auto-response | anti-change | anti-join | anti-out ] [ ... ]',
	credits: 'Hadestia',
	cooldowns: 10,
	aliases: [ 'group' ],
	envConfig: {
		requiredArgument: 1,
		groupCommandOnly: true
	}
}

const validTypes = [
	'auto-response',
	'anti-change',
	'anti-join',
	'anti-out',
	'setting',
	'admin',
	'name',
	'add'
];

module.exports.handleReply = async function ({ api, args, event, returns, textFormat, Prefix }) {
	
}

module.exports.run = async function ({ api, args, alias, event, returns, textFormat, Threads, Prefix }) {
	
	const { threadID, messageID, senderID } = event;
	
	const threadInfo = await api.getThreadInfo(threadID);
	const commandType = args.shift();
	
	if (!commandTypeValid(commandType)) return api.sendMessage(global.textFormat('group', 'groupCmdGroupInvalidCommandType', validTypes.join(' | ')), threadID, messageID);
	
	// get group data
	const GROUP_DATA = (await Threads.getData(threadID)).data;	
	//console.log(GROUP_DATA)
	// execute switch statement 
	switch (commandType) {
		// group name
		case 'name':
			api.setTitle(
				args.join(' '),
				threadID,
				(err) => {
					if (err) {
						global.sendReaction.failed(api, event);
						global.logModuleErrorToAdmin(err, __filename, threadID, senderID);
						return api.sendMessage(textFormat('error', 'errCmdExceptionError', err), threadID, messageID);
					}
					global.sendReaction.success(api, event);
				}
			);
			break;
		// group admin
		case 'admin':
			setAdminStatus({ threadInfo, returns, api, args, event });
			break;
			
		// add user to the group
		case 'add':
			handleAddUserToGroup({ threadInfo, api, args, event, returns, textFormat, Prefix })
			break;
			
		// set nickname
		case 'set-nn':
		
			break;
		
		// group settings (SEE GROUP SETTINGS)
		case 'settings':
		
			break;
			
		// anti out state
		case 'anti-out':
			GROUP_DATA.antiout = !GROUP_DATA.antiout;
			(GROUP_DATA.antiout) ?
				api.sendMessage(textFormat('success', 'successfulFormat', 'Anti out mode was turned on.'), threadID, global.autoUnsend, messageID) :
				api.sendMessage(textFormat('error', 'errOccured', 'Anti out mode was turned off.'), threadID, global.autoUnsend, messageID);
			break;
		case 'anti-join':
			GROUP_DATA.antijoin = !GROUP_DATA.antijoin;
			(GROUP_DATA.antijoin) ?
				api.sendMessage(textFormat('success', 'successfulFormat', 'Anti join mode was turned on.'), threadID, global.autoUnsend, messageID) :
				api.sendMessage(textFormat('error', 'errOccured', 'Anti join mode was turned off.'), threadID, global.autoUnsend, messageID);
			break;
			
		case 'auto-response':
			GROUP_DATA.auto_response_listener = !GROUP_DATA.auto_response_listener;
			api.sendMessage(
				textFormat('cmd', `eventAutoResponse${(GROUP_DATA.auto_response_listener) ? 'On' : 'Off'}`),
				threadID,
				global.autoUnsend,
				messageID
			);
			break;
			
		case 'anti-change':
			GROUP_DATA.guard = !GROUP_DATA.guard;
			(GROUP_DATA.guard) ?
				api.sendMessage(textFormat('success', 'successfulFormat', 'Anti group change mode was turned on.'), threadID, global.autoUnsend, messageID) :
				api.sendMessage(textFormat('error', 'errOccured', 'Anti group change mode was turned off.'), threadID, global.autoUnsend, messageID);
			break
		default:
			break;
			
	}
	await Threads.setData(threadID, { data: GROUP_DATA });
	global.data.threadData.set(event.threadID, data);
}

// =============== CHECKER FUNCTIONS =============== // 

function commandTypeValid(cmd) {
	return validTypes.includes(cmd)
}



// =============== COMMANDS FUNCTIONS =============== //

async function handleAddUserToGroup({ threadInfo, api, args, event, returns, textFormat, Prefix }) {
	
	const { threadID, messageID } = event;
	var { participantIDs, approvalMode, adminIDs } = threadInfo;
	var participantIDs = participantIDs.map(e => parseInt(e));
	
	
	// handle message reply// this is for when anti out was turned off and a user left the group and they want to add him/her back.
	// they don't need to get the id of that person and just proceed replying on his/her last chat and run the commnad.
	if (event.type === 'message_reply') {
		return adduser(event.messageReply.senderID);
	} else {
		if (args.length === 0) {
			// return invalid syntax
			return api.sendMessage(
				textFormat('group', 'groupCmdAddInvalidSyntax', Prefix),
				threadID, messageID
			);
		}
		
		for (const id of args) {
			adduser(id);
		}
	}
	
	// some detections
	async function adduser(id) {
		// check user id
		if (!id.length === 15) return api.sendMessage(textFormat ('error', 'errInvalidUserID'), threadID, messageID);
		
		const target = await api.getUserInfoV2(id);
		// id = parseInt(id);
		
		if (participantIDs.includes(id)) {
			
			return out(textFormat('group', 'groupAddUserAlreadyInGroup', target.name || 'user'));
			
		} else {
			
			const admins = adminIDs.map(e => parseInt(e.id));
			
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

async function setAdminStatus({ threadInfo, returns, api, args, event }) {
	
	const { threadID, messageID, senderID } = event;
	const admins = (threadInfo.adminIDs).map(e => parseInt(e.id));
	//const user_is_admin = admins.includes(event.senderID);
	const bot_is_admin = threadInfo.adminIDs.find(e => e.id == api.getCurrentUserID());
	
	
	let matchedState = (args.join(' ').toLowerCase()).match(/add|remove|promote|demote/g);
	// if no matching state
	if (!matchedState) {
		returns.remove_usercooldown();
		return api.sendMessage(global.textFormat('group', 'groupCmdGroupInvalidAdminState'), threadID, messageID);
	}
	
	let state = (['promote', 'add'].includes(matchedState[0])) ? true :
		(['demote', 'remove'].includes(matchedState[0])) ? false : undefined;
	
	// return if command user is not an admin
	/*if (!user_is_admin) {
		api.sendMessage(global.textFormat('cmd', 'cmdPermissionNotEnough', 'Group Administrators'), event.threadID, event.messageID);
		return returns.remove_usercooldown();
	}*/
	if (!bot_is_admin) {
		api.sendMessage(global.textFormat('group', 'groupBotNeedsAdminPerm', 'Group Administrators'), event.threadID, event.messageID);
		return returns.remove_usercooldown();
	}

	// promote user if message reply
	if (event.type == 'message_reply') {
		//const user_is_admin = threadInfo.adminIDs.find(i => i.id == event.messageReply.senderID);
		api.changeAdminStatus(
			threadID,
			event.messageReply.senderID, state,
			(err) => {
				if (err) {
					global.logModuleErrorToAdmin(err, __filename, threadID, senderID);
					return global.sendReaction.failed(api, event);
				}
				return global.sendReaction.success(api, event); 
			}
		);
		
	} else {

		// promote user(s) if mentioned
		if (Object.keys(event.mentions).length > 0) {
			
			// promote each users that are mention
			for (let i = 0; i < Object.keys(event.mentions).length; i++) {
			
				//const name = Object.values(event.mentions)[i].replace('@', '');
				const id = Object.keys(event.mentions)[i];
				
				api.changeAdminStatus(
					threadID,
					id, state,
					(err) => {
						if (err) {
							global.logModuleErrorToAdmin(err, __filename, threadID, senderID);
							return global.sendReaction.failed(api, event);
						}
						return global.sendReaction.success(api, event); 
					}
				);
				
			}
		} else {
			return api.sendMessage(global.textFormat('group', 'groupCmdGroupAdminNoParam'), threadID, messageID);
		}
		
	}
}