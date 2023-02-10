module.exports.config = {
	name: 'bible',
	version: '1.0.0',
	hasPermssion: 0,
	commandCategory: 'other',
	description: 'Send random bible verse or turn on automatic bible verse sending',
	usages: '[ auto ]',
	credits: 'Hadestia',
	dependencies: {
		'axios': ''
	}
}

module.exports.run = async function ({ api, args, event, textFormat }) {
	
	const { threadID, messageID } = event;
	const axios = require('axios');
	
	
	
}