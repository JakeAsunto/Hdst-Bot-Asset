module.exports.config = {
	name: 'dictionary',
	version: '2.0.1',
	hasPermssion: 0,
	credits: 'DungUwU', // beautify by Hadestia
	description: 'Check definition of specific word.',
	usages: '<word>',
	aliases: [ 'dict', 'meaning' ],
	commandCategory: 'education',
	cooldowns: 5,
	envConfig: {
		requiredArgument: 1
	}
}

module.exports.run = function({ api, event, args, textFormat }) {
	
	const { threadID, messageID } = event;
	const fs = require('fs');
	const axios = require('axios');
	
	const encoded = encodeURI(`https://api.dictionaryapi.dev/api/v2/entries/en/${args.join(' ').trim().toLowerCase()}`);
	axios.get(encoded).then((res) => {
		
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
		
		meanings.forEach(items => {
			const example = (items.definitions[0].example) ? `(${items.definitions[0].example[0].toUpperCase() + items.definitions[0].example.slice(1)})` : '';
			const format = textFormat('cmd', 'cmdDictionaryDefFormat', items.partOfSpeech, `${items.definitions[0].definition[0].toUpperCase() + items.definitions[0].definition.slice(1)}`, example);
			msg_meanings += `${format}\n\n`;
		});
		
		const word = await global.fancyFont.get(data.word.charAt(0) + data.word.slice(1), 2);
		const messageBody = textFormat('cmd', 'cmdDictionaryFormat', word, msg_phonetics, msg_meanings);
		return api.sendMessage(messageBody, threadID, messageID);
		
    }).catch(err => {
		//console.log(err)
		if (err.response.status && err.response.status === 404) {
			return api.sendMessage(textFormat('cmd', 'cmdDictionaryNotFound'), threadID, messageID);
		}
	});
}