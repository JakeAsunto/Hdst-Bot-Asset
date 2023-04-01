///// LISTEN TO OTHERS THREAD BY HADESTIA /////
module.exports.config = {
	name: 'listen-thread',
	credits: 'Hadestia',
	version: '1.0.0',
	hasPermssion: 2,
	commandCategory: 'tools',
	description: 'Listen to other group threads given by a thread ID.',
	usages: '[ add | stop | clear all ] < thread ID >',
	envConfig: {
		requiredArgument: 1
	}
}

module.exports.onLoad = function () {
	global.adminListenToThread = new Map();
}

// an event that will listen to the thread
module.exports.handleEvent = async function ({ api, event, textFormat }) {
	
	const { body, threadID, messageID, senderID } = event;
	
	if (global.adminListenToThread || global.adminListenToThread.has(threadID)) {
		// START FORWARDING
	}
	
}

