module.exports.run = async function ({ api, args, event }) {
	const axios = require('axios');
	const { threadID, messageID } = event;
	
	const task = `https://official-api-choru-tiktokers.ohio-final-boss542.repl.co/openai?ask=test${args.join(' ')}`;
	await axios.get(task).then(res => {
		const result = res.data
	
		return api.sendSendMessage(result.result, threadID, messageID);
	}).catch(err => {
		console.log(err);
	});
}	