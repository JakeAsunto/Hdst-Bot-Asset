module.exports.config = {
	name: 'translate',
	version: '1.0.1',
	hasPermssion: 0,
	credits: 'Mirai Team', // beautify by Hadestia
	commandCategory: 'media',
	description: 'Translate text to a given language, if no given language it will translated to English as default.\n To translate text to specific language your request must include \'<space>-><space>\' followed by requested language to process.',
	usages: '[ text | @message reply ] [ -> <language e.g(fil/en)> ]',
	cooldowns: 5,
	aliases: [ 'trans' ],
	dependencies: {
		'axios': ''
	}
};

module.exports.run = async ({ api, event, args, Utils }) => {
	
	const axios = require('axios');
	
	var content = args.join(' ');
	
	if (content.length == 0 && event.type != 'message_reply')
	
	var translateThis = content.slice(0, content.indexOf(' ->'));
	
	var lang = content.substring(content.indexOf(' -> ') + 4);
	
	if (event.type == 'message_reply') {
		
		translateThis = event.messageReply.body
		if (content.indexOf('-> ') !== -1) lang = content.substring(content.indexOf('-> ') + 3);
		else lang = global.HADESTIA_BOT_CONFIG.language;
		
	}
	
	else if (content.indexOf(' -> ') == -1) {
		translateThis = content.slice(0, content.length)
		lang = global.HADESTIA_BOT_CONFIG.language;
	}
	
	return axios.get(encodeURI(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${translateThis}`)).then((res) => {
		
		var retrieve = JSON.parse(res.data);
		var text = '';
			
		retrieve[0].forEach(item => (item[0]) ? text += item[0] : '');
			
		var fromLang = (retrieve[2] === retrieve[8][0][0]) ? retrieve[2] : retrieve[8][0][0];
			
		api.sendMessage(
			Utils.textFormat('cmd', 'cmdTranslationFormat', text, fromLang, lang),
			event.threadID, event.messageID
		);
	}).catch((err) => {
		return api.sendMessage(Utils.textFormat('error', 'errCmdExceptionError', 'Unable to process your request.'), event.threadID, event.messageID);
	});
}
