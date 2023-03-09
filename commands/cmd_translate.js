module.exports.config = {
	name: 'translate',
	version: '1.0.1',
	hasPermssion: 0,
	credits: 'Mirai Team', // beautify by Hadestia
	commandCategory: 'media',
	description: 'Translate text to a given language, if no given language it will translated to English as default.\n To translate text to specific language your request must include \'<space>-><space>\' followed by requested language to process.'
	usages: '[ text | @message reply ] [ -> <language e.g(fil/en)> ]'
	cooldowns: 5,
	aliases: [ 'trans' ],
	disabled: true,
	dependencies: {
		'request': ''
	}
};

module.exports.run = async ({ api, event, args, textFormat }) => {
	
	const request = require('request');
	
	var content = args.join(' ');
	
	if (content.length == 0 && event.type != 'message_reply') return global.utils.throwError(this.config.name, event.threadID,event.messageID);
	
	var translateThis = content.slice(0, content.indexOf(' ->'));
	
	var lang = content.substring(content.indexOf(' -> ') + 4);
	
	if (event.type == 'message_reply') {
		
		translateThis = event.messageReply.body
		if (content.indexOf('-> ') !== -1) lang = content.substring(content.indexOf('-> ') + 3);
		else lang = global.config.language;
		
	}
	
	else if (content.indexOf(' -> ') == -1) {
		translateThis = content.slice(0, content.length)
		lang = global.config.language;
	}
	
	return request(
		encodeURI(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${translateThis}`),
		(err, response, body) => {
			
			if (err) return api.sendMessage(textFormat('error', 'errCmdExceptionError', 'Unable to process your request.'), event.threadID, event.messageID);
			
			var retrieve = JSON.parse(body);
			var text = '';
			
			retrieve[0].forEach(item => (item[0]) ? text += item[0] : '');
			
			var fromLang = (retrieve[2] === retrieve[8][0][0]) ? retrieve[2] : retrieve[8][0][0];
			
			api.sendMessage(
				textFormat('cmd', 'cmdTranslationFormat', text, fromLang, lang),
				event.threadID, event.messageID
			);
		}
	);
}
