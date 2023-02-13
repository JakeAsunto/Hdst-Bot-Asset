const { readdirSync, readFileSync, createReadStream, writeFileSync, existsSync, unlinkSync, rm } = require('fs-extra');
const logger = require('../utils/log.js');


/////////////// GLOBAL VARIABLES 'N FUNCTIONS INITIALIZER ///////////////

logger.loader('Initializing Global Variables...');

global.client = new Object({

    commands: new Map(), // map for commands format: [ cmd name : requre (cmd ) ]
    
    commandsConfig: new Object(), // for quickly change command configurations
    
    commandAliases: new Map(), // for command aliases format: [ cmd aliase : cmd name (main) ]

    events: new Map(),
    
    cooldowns: new Map(),

    eventRegistered: new Array(),
    
    messageReplyRegistered: new Array(),

    handleSchedule: new Array(),

    handleReaction: new Array(),

    handleReply: new Array(),

    mainPath: process.cwd(),

    configPath: new String()

});

global.data = new Object({
	
	threadAllowNSFW: new Array(),
	
	threadBanned: new Map(),

    threadInfo: new Map(),

    threadData: new Map(),
    
    allThreadID: new Array(),
    
    userName: new Map(),

    userBanned: new Map(),
    
    allUserID: new Array(),

    commandBanned: new Map(),

    allCurrenciesID: new Array()

});

global.utils = require('../utils');

global.nodemodule = new Object();

global.config = new Object();

global.otherConfig = new Object();

global.configModule = new Object();

global.moduleData = new Array();

global.language = new Object();

global.logger = logger;

global.textFormat = textFormat;

global.sendReaction = require('../utils/sendReaction.js');

global.fancyFont = require('../utils/localFont.js');

// ## Find and get variable from Config ## //

var configValue;

try {

    global.client.configPath = join(global.client.mainPath, 'json/config.json');
    configValue = require(global.client.configPath);
    logger.loader('Found file config: config.json');

} catch {

    if (existsSync(global.client.configPath.replace(/\.json/g, '') + '.temp')) {

        configValue = readFileSync(global.client.configPath.replace(/\.json/g, '') + '.temp');
        configValue = JSON.parse(configValue);
        logger.loader(`Found: ${global.client.configPath.replace(/\.json/g,'') + '.temp'}`);

    } else return logger.loader('config.json not found!', 'error');

}

// saving configuration to global

try {

    for (const key in configValue) global.config[key] = configValue[key];

    logger.loader('Config Loaded!');

} catch {

    return logger.loader('Can\'t load file config!', 'error');
}

// Load language Used

const langFile = (readFileSync(`${__dirname}/../languages/${global.config.language || 'en'}.lang`, { encoding: 'utf-8' })).split(/\r?\n|\r/);

const langData = langFile.filter(item => item.indexOf('#') != 0 && item != '');

for (const item of langData) {

    const getSeparator = item.indexOf('=');
    const itemKey = item.slice(0, getSeparator);
    const itemValue = item.slice(getSeparator + 1, item.length);
    const head = itemKey.slice(0, itemKey.indexOf('.'));
    const key = itemKey.replace(head + '.', '');
    const value = itemValue.replace(/\\n/gi, '\n');

    if (typeof global.language[head] == 'undefined') global.language[head] = new Object();

    global.language[head][key] = value;

}

/////////////// GLOBAL FUNCTIONS ///////////////
// some are located near the bottom of the main script
// due to it requires fca api to work.

// get text (from language)
global.getText = function(...args) {

    const langText = global.language;
    if (!langText.hasOwnProperty(args[0])) throw `${__filename} - Not found key language: ${args[0]}`;
    
    var text = langText[args[0]][args[1]];

    for (var i = args.length - 1; i > 0; i--) {

        const regEx = RegExp(`%${i}`, 'g');
        text = text.replace(regEx, args[i + 1]);

    }

    return text;

}