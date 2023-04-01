module.exports.config = {
	name: 'baybayin',
	version: '1.0.0',
	hasPermssion: 0,
	credits: 'Joshua Sy',
	description: 'A Filipino ancient writing system, it translates text to Baybayin writings',
	usages: '<text>',
	commandCategory: 'education',
	cooldowns: 5,
	envConfig: {
		requiredArgument: 1
	}
}

module.exports.run = async ({ api, event, args }) => {
	
	const axios = require('axios');
	let text = args.join(' ');
	
	const res = await axios.get(`https://api-baybayin-transliterator.vercel.app/?text=${text}`);
	var a = res.data.baybay;
	
	api.sendMessage(`${a}`, event.threadID, event.messageID);
	return global.sendReaction.success(api, event);
}