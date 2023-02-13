module.exports.config = {
	name: 'dictionary',
	version: '2.0.5',
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

module.exports.run = async function({ api, event, args, textFormat }) {
	
	const { threadID, messageID, senderID } = event;
	const fs = require('fs-extra');
	const axios = require('axios');
	
	const req = args.join(' ').toLowerCase();
	//const encodedUrl = encodeURI(`https://api.dictionaryapi.dev/api/v2/entries/en/${req}`);
	const encodedUrl = encodeURI(`https://api-dien.hdstteam.repl.co/googlethis?search=${req}`);
	global.sendReaction.inprocess(api, event);

	await axios.get(encodedUrl).then( async function (response){
		const dictionary = response.data.dictionary;
		// return if no definition found
		if (!dictionary.word) return api.sendMessage(textFormat('cmd', 'cmdDictionaryNotFound'), threadID, messageID);
		
		const word = await global.fancyFont.get(dictionary.word, 2);
		
		let definitions = '';
		// const examples = `● ${await global.fancyFont.get('examples:', 2)}\n${dictionary.examples.join(',\n')}`;
		
		for (const index in dictionary.definitions) {
		 	definitions += `${textFormat('cmd', 'cmdDictionaryDefFormat', dictionary.phonetic, dictionary.definitions[index], (dictionary.examples[index]) ? `\n● ${await global.fancyFont.get('examples:', 2)}\n${dictionary.examples[index]}` : '')}\n\n`;
		}
		// download pronunciation voicemail
		try {
			
			const path = `${__dirname}/../../cache/${(dictionary.audio).split('/').pop()}`;
			const voice = (await axios.get(`${dictionary.audio}`, { responseType: 'arraybuffer' })).data;
			fs.writeFileSync(path, Buffer.from(voice, 'utf-8'));
			
			return api.sendMessage(
				{
					body: textFormat('cmd', 'cmdDictionaryFormat', word, definitions ),
					attachment: fs.createReadStream(path)
				},
				threadID,
				() => {
					global.sendReaction.success(api, event);
					try { return fs.unlinkSync(path); } catch (e) {}
				},
				messageID
			);
			
		} catch (e) { 
			console.log(e);
			global.logModuleErrorToAdmin(e, __filename, threadID, senderID);
		}
		
		return api.sendMessage( textFormat('cmd', 'cmdDictionaryFormat', word, definitions ), threadID, () => global.sendReaction.success(api, event), messageID );
		
	}).catch(err => {
		console.log(err);
		global.sendReaction.failed(api, event);
		global.logModuleErrorToAdmin(err, __filename, event);
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