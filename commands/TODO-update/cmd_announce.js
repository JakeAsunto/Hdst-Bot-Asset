module.exports.config = {
	name: 'announce',
	version: '1.0.0',
	credits: 'Hadestia',
	hasPermssion: 2,
	commandCategory: 'system',
	cooldowns: 0,
	description: 'announce a message to a all groups or on a specified one.',
	usages: '[ all | group id ] | <author> | <message>',
	aliases: [ 'announcement' ],
	hidden: true,
	envConfig: {
		requiredArgument: 3
	}
}

module.exports.run = async function ({ api, args, event, returns, textFormat }) {
	
	const { threadID, messageID } = event;
	const body = args.join(' ');
	
	let dividerCount = body.match(/\|/g);
	if (!dividerCount || dividerCount.length < 2) {
		return returns.invalid_usage();
	}
	
	const arg = (body).split('|');
	const target_id = arg[0].trim();
	const codename = arg[1].trim();
	
	// if specific thread
	if (target_id !== 'all') {
		// if valid thread id
		if (target_id.length === 16) {
			return api.sendMessage(
				textFormat('cmd', 'cmdAnnounceFormat', codename, arg[2].trim()),
				target_id,
				(err) => {
					if (err) return console.log(err);
					// return api.sendMessage(textFormat('cmd', 'cmdAnnounceSentSuccess'), threadID, messageID);
					return global.sendReaction.success(api, event);
				}
			);
		}
		// send invalid id
		return api.sendMessage(textFormat('cmd', 'cmdAnnounceInvalidThreadID'), threadID, logMessageError, messageID);
	
	// send to all thread
	} else {
		global.data.allThreadID.forEach(function (id) {
			api.sendMessage(textFormat('cmd', 'cmdAnnounceFormat', codename, arg[2].trim()), id, (err)=> { if (err) return console.log(err) });
		});
		
		return global.sendReaction.success(api, event);
		// return api.sendMessage(textFormat('cmd', 'cmdAnnounceSentSuccess'), threadID, messageID);
	}
	
}