module.exports.config = {
	name: 'setup',
	eventType: ['log:subscribe'],
	version: '1.0.3',
	credits: 'Hadestia',
	description: 'Set up bot when connected to the group.',
	dependencies: {
		'fs-extra': ''
	}
};

module.exports.run = async function({ api, event }) {
	
	const { threadID } = event;
	
	// If joined user was this bot
	if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
		
		api.changeNickname(global.textFormat('system', 'botNicknameSetup', global.config.PREFIX, (!global.config.BOTNAME) ? ' ' : global.config.BOTNAME), threadID, api.getCurrentUserID());
		
		const messageBody = `${global.textFormat('events', 'eventBotJoinedConnected', global.config.BOTNAME, global.config.PREFIX)}\n\n${global.textFormat('cmd', 'cmdHelpUsageSyntax', global.config.PREFIX, global.botName)}`;
		// send a startup mesaage
		return api.sendMessage(
			messageBody,
			threadID,
			async (err, info) => {
				if (err) return;
				await new Promise(resolve => setTimeout(resolve, 300 * 1000));
				return api.unsendMessage(info.messageID);
			}
		);
	}
}