module.exports.config = {
	name: 'group-set',
	version: '1.0.0',
	hasPermssion: 3,
	commandCategory: 'group',
	description: 'Sets specific type for a group/thread',
	usages: '[ name | admin ] < ... >',
	credits: 'Hadestia',
	cooldowns: 10,
	aliases: [ 'group' ],
	envConfig: {
		requiredArgument: 2
	}
}

const validTypes = [
	'setting',
	'admin',
	'name'
];

module.exports.handleReply = async function ({ api, event, returns }) {
	
}

module.exports.run = async function ({ api, args, alias, event, returns, textFormat, Threads }) {
	
	const { threadID, messageID, senderID } = event;
	
	// return if thread is not a group
	if (!event.isGroup) return api.sendMessage(global.textFormat('cmd', 'cmdGroupThreadNotGroup'), threadID, messageID);
	
	const commandType = args.shift();
	
	if (!commandTypeValid(commandType)) return api.sendMessage(global.textFormat('group', 'groupCmdGroupInvalidCommandType', validTypes.join(' | ')), threadID, messageID);
	
	// get group data
	const GROUP_DATA = await Threads.getData(threadID);
	const threadInfo = GROUP_DATA.threadInfo;
	
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
		default:
			break;
			
	}
	
}

// =============== CHECKER FUNCTIONS =============== // 

function commandTypeValid(cmd) {
	return validTypes.includes(cmd)
}



// =============== COMMANDS FUNCTIONS =============== //

async function setAdminStatus({ threadInfo, returns, api, args, event }) {
	
	const { threadID, messageID, senderID } = event;
	const user_is_admin = threadInfo.adminIDs.find(i => i.id == event.senderID);
	const bot_is_admin = threadInfo.adminIDs.find(i => i.id == global.botUserID);
	
	
	let matchedState = (args.join(' ').toLowerCase()).match(/add|remove|promote|demote/g);
	// if no matching state
	if (!matchedState) {
		returns.remove_usercooldown();
		return api.sendMessage(global.textFormat('group', 'groupCmdGroupInvalidAdminState'), threadID, messageID);
	}
	
	let state = (['promote', 'add'].includes(matchedState[0])) ? true :
		(['demote', 'remove'].includes(matchedState[0])) ? false : undefined;
	
	// return if command user is not an admin
	if (!user_is_admin) {
		api.sendMessage(global.textFormat('cmd', 'cmdPermissionNotEnough', 'Group Administrators'), event.threadID, event.messageID);
		return returns.remove_usercooldown();
	} else if (!bot_is_admin) {
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