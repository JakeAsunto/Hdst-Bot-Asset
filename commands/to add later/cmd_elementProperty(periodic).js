module.exports.config = {
	name: 'element-property',
	usages: '< element name >',
	aliases: [ 'pt', 'element', 'chemical', 'chemical-property' ],
	version: '1.0.0',
	hasPermssion: 0,
	commandCategory: 'education',
	credits: 'API by: Choru Tiktokers',
	description: 'Send a random element from periodic table or view chemical properties given by a name.',
	cooldowns: 5,
	envConfig: {
		requiredArgument: 0
	},
	dependencies: {
		'axios': '',
		'fs-extra': ''
	}
}

module.exports.run = async function ({ api, args, event, returns, textFormat }) {
	
	const { threadID, messageID } = event;
	const axios = require ('axios'):
	const fs = require('fs-extra');
	
	/*awai axios.get(`https://b3feb162-bf04-4555-af3a-8963f6ca77bd.id.repl.co/element?search=${args[0]}`).then(async function(res) {
		const data = res.data;
		
		
		
		
	}).catch(err => {
		
	});*/
	
}