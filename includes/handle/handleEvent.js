module.exports = function({ api, models, Users, Threads, Banned }) {
    	
    const logger = require("../../utils/log.js");

    const moment = require("moment");

    return function({ event }) {

        const timeStart = Date.now()

        const time = moment.tz("Asia/Manila").format("HH:MM:ss L");

		const { allowInbox, DeveloperMode } = global.config;

        const { bannedUsers, bannedThreads } = global.data;

        const { events } = global.client;

        var { senderID, threadID } = event;

        senderID = String(senderID);

        threadID = String(threadID);

        if (bannedUsers.has(senderID) || bannedThreads.has(threadID) || allowInbox == ![] && senderID == threadID) return;

        for (const [key, value] of events.entries()) {
			
			const evn = value.config.eventType
			
            if (evn.indexOf(event.logMessageType) !== -1) {

                const eventRun = events.get(key);

                try {

                    const Obj = {};

                    Obj.api = api;

                    Obj.event = event;

                    Obj.models = models;

                    Obj.Users = Users;

					Obj.Banned = Banned;

                    Obj.Threads = Threads;

                    eventRun.run(Obj);

                    if (DeveloperMode == !![])

                        logger(global.getText('handleEvent', 'executeEvent', time, eventRun.config.name, threadID, Date.now() - timeStart), '[ Event ]');

                } catch (error) {

                    logger(global.getText('handleEvent', 'eventError', eventRun.config.name, JSON.stringify(error)), "error");

                }

            }

        }

        return;

    };

}