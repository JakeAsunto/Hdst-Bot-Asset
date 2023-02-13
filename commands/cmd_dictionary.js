module.exports.config = {
	name: 'dictionary',
	version: '2.0.3',
	hasPermssion: 0,
	credits: 'Hadestia',
	description: 'Check definition of specific word.',
	usages: '<word>',
	aliases: [ 'dict', 'meaning' ],
	commandCategory: 'education',
	cooldowns: 5,
	envConfig: {
		requiredArgument: 1
	},
	dependencies: {
		'axios': '',
		'fs-extra': '',
		'request': ''
	}
}

module.exports.run = function({ api, event, args, textFormat }) {
	
	const { threadID, messageID, senderID } = event;
	const fs = require('fs-extra');
	const axios = require('axios');
	
	const req = args.join(' ')".toLowerCase();
	//const encodedUrl = encodeURI(`https://api.dictionaryapi.dev/api/v2/entries/en/${req}`);
	const encodedUrl = encodeURI(`https://api-dien.hdstteam.repl.co/googlethis?search=${req}`);
	global.sendReaction.inprocess(api, event);

	await axios.get(encodedUrl).then( async (response) => {
		const dictionary = response.data.dictionary;
		const pronunciation = [];
		
		const word = await global.fancyFont.get(dictionary.word, 2);
		
		// download pronunciation voicemail
		try {
			
			const path = `${__dirname}/../../cache/${(dictionary.voice).split('/').pop}`;
			await axios axios.get(dictionary.voice, { responseType: 'arraybuffer' });
			fs.writeFileSync(path, Buffer.from(getDown, 'utf-8'));
			
			return api.sendMessage(
				{
					body: textFormat('cmd', 'cmdDictionaryFormat', word, textFormat('cmd', 'cmdDictionaryDefFormat', dictionary.phonetic, dictionary.definitions[0], dictionary.examples.join(',\n'))),
					attachment: fs.createReadStream(path)
				},
				threadID,
				() => {
					try { return fs.unlinkSync(path); } catch (e) {}
				},
				messageID
			
			);
			
		} catch (e) {}
		
		return api.sendMessage( textFormat('cmd', 'cmdDictionaryFormat', word, textFormat('cmd', 'cmdDictionaryDefFormat', dictionary.phonetic, dictionary.definitions[0], dictionary.examples.join(',\n'))), threadID, messageID );
		
	}).catch(err => {
		console.log(err);
		global.sendReaction.failed(api, event);
		global.logModuleErrorToAdmin(err, __filename, threadID, senderID);
		return api.sendMessage(textFormat('cmd', 'cmdDictionaryNotFound'), threadID, messageID);
	});
	
	/* DEPRECATED
	axios.get(encodedUrl).then(async (res) => {
		const data = res.data[0];
		// let example = data.meanings[0].definitions.example;
		
		const phonetics = data.phonetics;
		const meanings = data.meanings
		
		let msg_meanings = '';
		let msg_phonetics = '';
 
		phonetics.forEach(items => {
			const text = (items.text) ? `${items.text}`: '';
			msg_phonetics += `${text}`;
		});
		
		meanings.forEach(async (items) => {
			const example = (items.definitions[0].example) ? `(${items.definitions[0].example[0].toUpperCase() + items.definitions[0].example.slice(1)})` : '';
			const format = textFormat('cmd', 'cmdDictionaryDefFormat', items.partOfSpeech, `${items.definitions[0].definition[0].toUpperCase() + items.definitions[0].definition.slice(1)}`, example);
			const synonyms = (items.synonyms.length > 0) ? `● ${await global.fancyFont.get('synonyms', 1)}: ${items.synonyms.join(', ')}` : '';
			const antonyms = (items.antonyms.length > 0) ? `● ${await global.fancyFont.get('antonyms', 1)}: ${items.antonyms.join(', ')}` : '';
			msg_meanings += `${format}${(synonyms !== '') ? `\n${synonyms}` : ''}${(antonyms !== '') ? `\n${antonyms}` : ''}\n\n`;
		});
		
		const word = await global.fancyFont.get(data.word.charAt(0).toUpperCase() + data.word.slice(1), 2);
		const messageBody = {
			body: textFormat('cmd', 'cmdDictionaryFormat', word, data.phonetic || msg_phonetics, msg_meanings),
			//attachment
		};
		
		
		return api.sendMessage( messageBody, threadID, () => global.sendReaction.success(api, event), messageID );
		
    }).catch(err => {
		console.log(err)
		//if (err.response.status && err.response.status === 404) {
			global.sendReaction.failed(api, event);
			return api.sendMessage(textFormat('cmd', 'cmdDictionaryNotFound'), threadID, messageID);
		//}
	});
	*/
}