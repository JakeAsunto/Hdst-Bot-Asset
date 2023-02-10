const textFormat = require('./textFormat.js');

function inprocess (api, event) {
	return api.setMessageReaction(textFormat('reaction', 'inProcess'), event.messageID, err => (err) ? logger('unable to setMessageReaction for cmd_unsend command', '[ Reactions ]') : '', !![]);
}

function success (api, event) {
	return api.setMessageReaction(textFormat('reaction', 'execSuccess'), event.messageID, err => (err) ? logger('unable to setMessageReaction for cmd_unsend command', '[ Reactions ]') : '', !![]);
}

function failed (api, event) {
	return api.setMessageReaction(textFormat('reaction', 'execFailed'), event.messageID, err => (err) ? logger('unable to setMessageReaction for cmd_unsend command', '[ Reactions ]') : '', !![]);
}

function custom (api, event, emoji) {
	return api.setMessageReaction(emoji, event.messageID, err => (err) ? logger('unable to setMessageReaction for cmd_unsend command', '[ Reactions ]') : '', !![]);
}

function cooldown (api, event) {
	return api.setMessageReaction(textFormat('reaction', 'userCmdCooldown'), event.messageID, err => (err) ? logger('unable to setMessageReaction for cmd_unsend command', '[ Reactions ]') : '', !![]);
}

module.exports = {
	inprocess,
	cooldown,
	success,
	failed,
	custom
}