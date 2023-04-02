 module.exports.config = {
	name: 'help',
	version: '1.1.4',
	hasPermssion: 0,
	credits: 'Hadestia',
	description: 'Listing of all categories and commands.',
	commandCategory: 'system',
	usages: '[ all | usage | <module name> | <page number> ]',
	cooldowns: 5,
	aliases: [ 'menu' ],
	envConfig: {
		autoUnsend: true,
		delayUnsend: 180
	}
};

module.exports.run = async function({ api, event, args, Utils, Prefix }) {
	
	const { commands, commandAliases, mainPath } = global.HADESTIA_BOT_CLIENT;
	const categoryReference = require(`${mainPath}/json/commandCategories.json`);

	const { threadID, messageID } = event;
	
	// fetch specific command if requested
	const command = commands.get((commandAliases.get(args[0]) || args[0] || '').toLowerCase());
	
	async function autoUnsent(err, info) {
		if (err) console.log(err);
		const { autoUnsend, delayUnsend } = module.exports.config.envConfig;
		if (autoUnsend) {
			await new Promise(resolve => setTimeout(resolve, delayUnsend * 1000));
			return api.unsendMessage(info.messageID);
		}
		return;
	}
	
	try {
		// request a command usage?
		if (args.join().indexOf('usage') !== -1) {
			return api.sendMessage(Utils.textFormat('cmd', 'cmdHelpUsageSyntax', Prefix, global.botName), threadID, messageID);
		}
		
		// User typed "help all"? (Display all commands)
		const requestPage = (/\d+/g).test(args.join());
		if (requestPage || args.join().indexOf('all') !== -1) {
			
			const arrayInfo = [];
        	const itemPerPage = 15;
       	 const requestPage = parseInt(args[0]) || 1;
        
        	let index = 0;
        
        	for (const [ name, value ] of (commands)) {
        		const cmd = commands.get(name);
        		const cat = (cmd.config.commandCategory).toLowerCase();
        		if (cat !== 'hidden' && !cmd.config.hidden) {
        			arrayInfo.push(name);
				}
        	}
      	  arrayInfo.sort((a, b) => { return (a > b) ? 1 : -1 });
        
      	  const totalPages = Math.ceil(arrayInfo.length/itemPerPage);
       	 const page = (requestPage > totalPages) ? 1 : requestPage;
       	 const pageSlice = itemPerPage * page - itemPerPage;
        	const returnArray = arrayInfo.slice(pageSlice, pageSlice + itemPerPage);

        	let messageListBody = '';
      	  index = pageSlice;
        
       	 for (let item of returnArray) {
       	 	index += 1;
				const cmdName = commands.get(item).config.name;
				const cmdDesc = commands.get(item).config.description;
				const fontedName = await Utils.fancyFont.get(cmdName, 6);
        		messageListBody += '' + Utils.textFormat('cmd', 'cmdListCmd', Prefix, fontedName) + '\n\n';
    	    }
        	const messageBody = Utils.textFormat('cmd', 'cmdAllListFormat', page, totalPages, messageListBody, Prefix);
			return api.sendMessage(messageBody, threadID, autoUnsent, messageID);
		}
		
		// Request via Command Category
		const requestCategory = (args.join(' ') || '').replace(' ', '_').toLowerCase();
		if (categoryReference[requestCategory]) {
			
			const categoryCommands = [];
			let msgBodyList = '';

			for (const cmd of commands.values()) {
				if (cmd.config.commandCategory.toLowerCase() == requestCategory) {
					const name = await Utils.fancyFont.get(`${Prefix}${cmd.config.name}`, 6);
					categoryCommands[categoryCommands.length] = {
						name: name,
						desc: cmd.config.description || '<no description>',
						aliases: cmd.config.aliases || []
					}
				}
			}
			
			categoryCommands.sort((a, b) => {
				return (a.name > b.name) ? 1 : -1;
			});
			
			categoryCommands.forEach( async (item) => {
				const alias = (command.config.aliases) ? `[ ${ await item.aliases.join(', ')} ]` : 'none',
				msgBodyList = msgBodyList + (Utils.textFormat('cmd', 'cmdListCatCmd', item.name, item.desc, alias)) + '\n\n';
			});
			
			if (categoryCommands.length == 0) {
				msgBodyList = '`No Available Commands`';
			}
			
			const categoryItem = categoryReference[requestCategory];
			const catName = await Utils.fancyFont.get(`${categoryItem.icon}${requestCategory.charAt(0).toUpperCase() + requestCategory.slice(1)}`, 1);
			return api.sendMessage(
				Utils.textFormat('cmd', 'cmdCatCommandsFormat', catName, msgBodyList, Prefix),
				threadID, autoUnsent, messageID
			);
		}
	
		// User just typed "help" only?
		if (!command) {
			// Display all CATEGORIES and category description
			let msgBody = '';
		
			for (const catName in categoryReference) {
				const data = categoryReference[catName];
				const categoryName = await Utils.fancyFont.get((catName.charAt(0).toUpperCase() + catName.slice(1)).replace('_', ' '), 1);
				console.log(data);
				msgBody += '' + Utils.textFormat('cmd', 'cmdListCategory', `${data.icon}${categoryName}`, data.description ) + '\n\n';
			}
			
			return api.sendMessage(
				Utils.textFormat('cmd', 'cmdListCategoryFormat', Prefix, msgBody),
				threadID,
				autoUnsent,
				messageID
			);
		}
		
		const permssion = Utils.textFormat('system', `perm${command.config.hasPermssion || 0}`);
		const commandUsage = `${Prefix}${command.config.name} ${command.config.usages || ''}`;
		const cooldown = (command.config.cooldowns && command.config.cooldowns > 1) ? `${command.config.cooldowns} seconds` : 'no cooldown';
		const commandReplyUsage = (command.config.replyUsages) ? `\n● reply usage:\n${command.config.replyUsages}` : '';
		const commandName = await Utils.fancyFont.get(command.config.name, 1);
	
		const messageBody = Utils.textFormat(
			'cmd', 'cmdShowInfo',
			`${Prefix}${commandName}`,
			command.config.description,
			commandUsage,
			commandReplyUsage,
			command.config.commandCategory,
			cooldown,
			permssion,
			(command.config.aliases) ? `\n[ ${command.config.aliases.join(', ')} ]` : 'none',
			command.config.credits || 'ctto'
		);
		
		return api.sendMessage( messageBody, threadID, autoUnsent, messageID);
	
	} catch (err) {
		Utils.sendRequestError(err, event, Prefix);
		Utils.logModuleErrorToAdmin(err, __filename, event);
	}
}

/* LEGACY CODE
	if (args.join().indexOf('all') == 0) {
		const group = [];
		let messageListBody = '';
		let totalCat = 0, totalCmd = 0;
			
		for (const cmd of commands.values()) {
			
			const cat = (cmd.config.commandCategory).toLowerCase()
			if (cat !== 'hidden') {
				if (!group.some(item => item.group.toLowerCase() == cat)) {
					group.push({ group: cat, cmds: [cmd.config.name] });
				} else {
					if (!cmd.config.hidden) {
						group.find(item => item.group.toLowerCase() == cmd.config.commandCategory.toLowerCase()).cmds.push(cmd.config.name);
					}
				}
			}
		}
		
		group.sort((a, b) => {
			return (a.group > b.group) ? 1 : -1;
		});
			
		group.forEach(function (cmdGroupItem) {
			
			totalCat += 1;
			totalCmd += cmdGroupItem.cmds.length;
			
			const name = cmdGroupItem.group.charAt(0).toUpperCase() + cmdGroupItem.group.slice(1);
			const cmds = cmdGroupItem.cmds.join(' • ');
				
			const body = Utils.textFormat('cmd', 'cmdListCategoryCmd', name, cmds);
			messageListBody = messageListBody + body + '\n\n';
		});
			
		const messageBody = Utils.textFormat('cmd', 'cmdListCategoryFormat', messageListBody, totalCat, totalCmd);
			
		return api.sendMessage(messageBody, threadID, autoUnsent, messageID);
	}
    
	// shows all brief list of commands
	if (!command) {
		
		const arrayInfo = [];
        const itemPerPage = 5;
        const requestPage = parseInt(args[0]) || 1;
        
        let index = 0;
        
        for (const [ name, value ] of (commands)) {
        	const cmd = commands.get(name);
        	const cat = (cmd.config.commandCategory).toLowerCase();
        	if (cat != 'hidden' && !cmd.config.hidden) {
        		arrayInfo.push(name);
			}
        }
        
        arrayInfo.sort((a, b) => a.data - b.data);
        
        const totalPages = Math.ceil(arrayInfo.length/itemPerPage);
        const page = (requestPage > totalPages) ? 1 : requestPage;
        const pageSlice = itemPerPage * page - itemPerPage;
        const returnArray = arrayInfo.slice(pageSlice, pageSlice + itemPerPage);

        let messageListBody = '';
        
        index = pageSlice;
        
        for (let item of returnArray) {
        	index += 1;
			const cmdName = commands.get(item).config.name;
			const cmdDesc = commands.get(item).config.description;
			
        	const body = Utils.textFormat('cmd', 'cmdListCmd', index, prefix, cmdName, cmdDesc);
        	messageListBody = messageListBody + body + '\n\n';
        
        }
        
        const messageBody = Utils.textFormat('cmd', 'cmdListFormat', messageListBody, page, totalPages, prefix);
        
        return api.sendMessage(messageBody, threadID, autoUnsent, messageID);
        
	}
	
	// command = module + help: show command info
		
	const permssion = Utils.textFormat('system', `perm${command.config.hasPermssion || 0}`);
	const commandUsage = `${prefix}${command.config.name} ${command.config.usages || ''}`;
	const cooldown = (command.config.cooldowns && command.config.cooldowns > 1) ? `${command.config.cooldowns} seconds` : 'no cooldown';
	const commandReplyUsage = (command.config.replyUsages) ? `\n● usage reply:\n${command.config.replyUsages}` : '';
	const commandName = await Utils.fancyFont.get(command.config.name, 1);
	
	const messageBody = Utils.textFormat(
		'cmd', 'cmdShowInfo',
		`${prefix}${commandName}`,
		command.config.description,
		commandUsage,
		commandReplyUsage,
		command.config.commandCategory,
		cooldown,
		permssion,
		(command.config.aliases) ? `\n[ ${command.config.aliases.join(', ')} ]` : 'none',
		command.config.credits || 'ctto'
	);
		
	return api.sendMessage( messageBody, threadID, autoUnsent, messageID);
	*/