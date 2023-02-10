module.exports.config = {
	name: 'get-lyrics',
	version: '1.0.1',
	hasPermssion: 0,
	credits: 'LTChi, updated by Hadestia',
	description: 'Get the lyrics of a given song.',
	commandCategory: 'media',
	usages: '<title>',
	cooldowns: 10,
	envConfig: {
		requiredArgument: 1
	}
};

module.exports.run = async function ({ api, args, event, textFormat }) {
	
	const { threadID, messageID } = event;
	const title = args.join(' ');
	const lyricsFinder = require('lyrics-finder');
	const lyrics = await lyricsFinder(title) || 'error';
	
	if (lyrics == 'error') {
    	global.sendReaction.failed(api, event);
		return api.sendMessage(textFormat('cmd', 'cmdGetLyricsFailed', title), threadID, messageID);
	}
    global.sendReaction.success(api, event);
    return api.sendMessage(textFormat('cmd', 'cmdGetLyricsFormat', title, lyrics), threadID, messageID);
}