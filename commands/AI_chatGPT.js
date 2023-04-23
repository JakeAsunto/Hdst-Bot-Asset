module.exports.config = {
    name: 'open-ai',
    version: '2.0.0',
    hasPermssion: 0,
    credits: '© to rest API owner',
    description: 'An Artificial Intelligence from Open AI.',
    commandCategory: 'artificial_intellegence',
    usages: '<prompt>',
    aliases: [ 'ai' ],
    cooldowns: 60,
    envConfig: {
    	requiredArgument: 1
    },
    dependencies: {
        'axios': '',
    }
}

module.exports.run = async function ({ api, args, event, Utils }) {
	
	const axios = require('axios');
	const { threadID, messageID } = event;
	
	Utils.sendReaction.inprocess(api, event);
	await axios(
		{
			url: 'https://api.openai.com/v1/chat/completions',
			method: 'post',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${process.env.OPENAI_API}`
			},
			data: {
				'model': 'gpt-3.5-turbo',
				'messages': [
					{ 'role': 'user', 'content': `${args.join(' ')}` }
				],
				'temperature': 0
			}
		}
	).then((res) => {
		api.sendMessage(
			res.data.choices[0].message,
			threadID, 
			(err) => {
				(!err) ? Utils.sendReaction.success(api, event) : '';
			},
			messageID
		);
	}).catch((err) => {
		console.error(err);
		api.sendMessage(Utils.textFormat('error', 'errOccured', err), threadID, messageID);
		Utils.logModuleErrorToAdmin(err, __filename, event);
	});
}