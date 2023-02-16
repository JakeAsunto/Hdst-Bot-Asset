module.exports.config = {
	name: 'pending',
	version: '1.2.3',
	credits: 'Hadestia',
	hasPermssion: 2,
	usages: '< thread | user >',
	replyUsages: '< c | cancel > < all | position | [positions] >\n< a | accept > < all | position | [positions] >',
	description: 'Manage bot\'s pending messages',
	commandCategory: 'system',
	cooldowns: 0,
	hidden: true,
	envConfig: {
		requiredArgument: 1,
		inProcessReaction: true
	}
}

module.exports.handleReply = async function({ api, event, returns, handleReply }) {
	
    if (event.senderID !== handleReply.author) {
		return api.sendMessage(global.textFormat('error', 'errCommandReplyInteractionFailed'), event.threadID, (err, info) => { global.autoUnsend(err, info, 5) }, event.messageID);
    }
    
    const { body, threadID, messageID } = event;
    let items = [];
    
    const args = body.split(' ');
    const mode = (args.shift()).toLowerCase();
    
    let seeLog = false;
    // get option if want to return the log
    if (args.indexOf('-log:true') !== -1) {
		//args.splice(args.indexOf('-log:true'), 1);
		seeLog = true;
	}
    // ['1'[, ...n]] or 'all' or null
    let task = (args.join(' ').match(/(\d+)/g) !== null) ? args.join(' ').match(/(\d+)/g) : (args.includes('all')) ? 'all' : null;
    
    if (args.length === 0 || task === null) {
    	global.sendReaction.failed(api, event);
		return returns.invalid_reply_syntax();
	}
    // CANCEL ///////
	if (['c', 'cancel'].indexOf(mode) !== -1) {
	    if (typeof(task) === 'object') {
			// loop through selected indexes to cancel
			for (const index of task) {
				const position = parseInt(index);
				if (!isValidPosition(position)) return api.sendMessage(`position out of range: ${position}`, threadID);
				//console.log(position)
				const data = handleReply.pending[position - 1];
				disconnectBot(data, data.isGroup);
				items.push(data.name);
			}
		} else {
			if (task === 'all') {
				for (const index in handleReply.pending) {
					const data = handleReply.pending[index];
					disconnectBot(data, data.isGroup)
					items.push(data.name);
				}
			}
		}
		if (items.length != 0) {
			if (seeLog) {
				api.sendMessage(
					global.textFormat('system', 'botMessagePendingRefused', (handleReply.isGroup) ? ((items.length > 1) ? 'Groups' : 'Group') : ((items.length > 1) ? 'Users' : 'User'), items.join('\n')),
					threadID, messageID
				);
			}
			global.sendReaction.success(api, event);
			return returns.delete_data();
		}
	// ACCEPT ////////
	} else if (['a', 'accept'].indexOf(mode) !== -1) {
		if (typeof(task) === 'object') {
			// loop through selected indexes to accept
			for (const index of task) {
				const position = parseInt(index);
				if (!isValidPosition(position)) return api.sendMessage(`position out of range: ${position}`, threadID);
				//console.log('positiob ' + position);
				const data = handleReply.pending[position - 1];
				connectBot(data, data.isGroup);
				items.push(data.name);
			}
		} else {
			if (task === 'all') {
				for (const index in handleReply.pending) {
					const data = handleReply.pending[index];
					connectBot(data, data.isGroup);
					items.push(data.name);
				}
			}
		}
		if (items.length != 0) {
			if (seeLog) {
				api.sendMessage(
					global.textFormat('system', 'botMessagePendingApproved', (handleReply.isGroup) ? ((items.length > 1) ? 'Groups' : 'Group') : ((items.length > 1) ? 'Users' : 'User'), items.join('\n')),
					threadID, messageID
				);
			}
			global.sendReaction.success(api, event);
			return returns.delete_data();
		}
	} else {
		global.sendReaction.failed(api, event);
		return returns.invalid_reply_syntax();
	}
    
    function isValidPosition(pos) {
    	return pos >= 1 && pos <= handleReply.pending.length;
    }
    
    function connectBot(obj) {
    	api.sendMessage(`${global.textFormat('events', 'eventBotJoinedConnected', global.config.BOTNAME, global.config.PREFIX)}\n\n${global.textFormat('cmd', 'cmdHelpUsageSyntax')}`, obj.threadID );
    }
    
    async function disconnectBot(obj, isGroup) {
    	if (isGroup) {
    		await api.sendMessage(global.textFormat('events', 'eventBotDeclinedGroup'), obj.threadID);
    		return api.removeUserFromGroup(api.getCurrentUserID(), obj.threadID);
    	}
    	return api.deleteThread(obj.threadID);
    }
}

module.exports.run = async function({ api, args, event, returns, textFormat }) {
	
	const { threadID, messageID, senderID } = event;
    const commandName = this.config.name;
    const mode = args.shift().toLowerCase();
    const replyTimeout = Date.now() + 60000;   
    
    var msg_item = '', index = 0;
	
	if (!['thread', 'user'].includes(mode)) return returns.invalid_usage();
	
    try {
		var spam = await api.getThreadList(100, null, ['OTHER']) || [];
		var pending = await api.getThreadList(100, null, ['PENDING']) || [];
	} catch (e) {
		api.sendMessage(e, threadID, messageID);
		global.logModuleErrorToAdmin(e, __filename, threadID, senderID);
		//return api.sendMessage(getText('cantGetPendingList'), threadID, messageID)
		return global.sendReaction.failed(api, event);
	}
	
	if (mode == 'thread') {
		
		const list = [...spam, ...pending].filter(group => group.isSubscribed && group.isGroup);

    	for (const single of list) {
    		index += 1;
    		msg_item += `${textFormat('system', 'botMessagePendingItemFormat', index, single.threadID, single.name)}\n\n`;
		}
	
  	  if (list.length != 0) {
			return api.sendMessage(
				textFormat('system', 'botMessagePendingListFormat', msg_item, list.length),
				threadID,
				(err, info) => {
					if (err) return console.log(err);
					global.client.handleReply.push({
            			name: commandName,
            			messageID: info.messageID,
            			author: event.senderID,
            			pending: list,
            			isGroup: true,
            			timeout: replyTimeout
					});
					global.autoUnsend(err, info, 60);
				},
				messageID
			);
		} else {
			return api.sendMessage(textFormat('system', 'botMessagePendingNoData'), threadID, messageID);
		}
		
	} else if (mode === 'user') {
		
		const list = [...spam, ...pending].filter(group => !group.isGroup);
		
    	for (const single of list) {
    		const user = await api.getUserInfoV2(single.threadID);
    		//console.log(single);
    		index += 1;
    		// const user = await api.getUserInfoV2(single.threadID) || {};
    		msg_item += `${textFormat('system', 'botMessagePendingItemFormat', index, single.threadID, user.name || 'Facebook User')}\n\n`;
		}
	
  	  if (list.length != 0) {
			return api.sendMessage(
				textFormat('system', 'botMessagePendingListFormat', msg_item, list.length),
				threadID,
				(err, info) => {
					if (err) return console.log(err);
					global.client.handleReply.push({
            			name: commandName,
            			messageID: info.messageID,
            			author: event.senderID,
            			pending: list,
            			isGroup: false,
            			timeout: replyTimeout
					});
					global.autoUnsend(err, info, 60);
				},
				messageID
			);
		} else {
			return api.sendMessage(textFormat('system', 'botMessagePendingNoData'), threadID, messageID);
		}
		
	}
}