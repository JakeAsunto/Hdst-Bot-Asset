module.exports = function ({ models, api }) {
	const Users = models.use('Users');
	const axios = require('axios');
	
	async function getInfo(id) {
		return (await api.getUserInfo(id))[id];
	}

	async function getNameUser(id) {
		try {
			const data = await getData(id) || {};
			return data.name || `@user${id}`;
		}
		catch (e) { return `@user${id}`; }
	}

	async function getAll(...data) {
		var where, attributes;
		for (const i of data) {
			if (typeof i != 'object') throw 'Needs Object or Array';
			if (Array.isArray(i)) attributes = i;
			else where = i;
		}
		try {
			return (await Users.findAll({ where, attributes })).map(e => e.get({ plain: true }));
		}
		catch (error) {
			console.error(error);
			throw new Error(error);
		}
	}
	
	async function hasRecord(userID) {
		try {
			const data = await Users.findOne({ where: { userID } });
			return (data) ? true : false;
		} catch (error) {
			console.error(error);
			throw new Error(error);
		}
	}

	async function getData(userID) {
		try {
			const data = await Users.findOne({ where: { userID } });
			if (data) return data.get({ plain: true });
			else return false;
		}
		catch(error) {
			console.error(error);
			throw new Error(error);
		}
	}

	async function setData(userID, options = {}) {
		if (typeof options != 'object' && !Array.isArray(options)) throw 'Needs Object';
		try {
			(await Users.findOne({ where: { userID } })).update(options);
			return true;
		}
		catch (error) {
			try {
				await createData(userID, options);
			} catch (error) {
				console.error(error);
				throw new Error(error);
			}
		}
	}

	async function delData(userID) {
		try {
			(await Users.findOne({ where: { userID } })).destroy();
			return true;
		}
		catch (error) {
			console.error(error);
			throw new Error(error);
		}
	}

	async function createData(userID, defaults = {}) {
		if (typeof defaults != 'object' && !Array.isArray(defaults)) throw 'Needs Object';
		try {
			await Users.findOrCreate({ where: { userID }, defaults });
			//console.log(`Created DB for user ${userID}`);
			return true;
		}
		catch (error) {
			console.error(error);
			throw new Error(error);
		}
	}

	return {
		getInfo,
		getNameUser,
		getAll,
		hasRecord,
		getData,
		setData,
		delData,
		createData
	};
};