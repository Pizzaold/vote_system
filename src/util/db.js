const { Sequelize, DataTypes } = require('sequelize');
const Hääletus = require('../models/HÄÄLETUS');
const Logi = require('../models/LOGI');
const kasutajad = require('../models/KASUTAJAD');
require('dotenv/config');

class DB {
	constructor() {
		this.started = false;
		this.sequelize = new Sequelize({
			dialect: 'mysql',
			database: 'Vote_system',
			host: process.env.DB_HOST,
			username: process.env.DB_USER,
			password: process.env.DB_PASS,
			timezone: 'Talline/Europe',
		});
	}
	async start() {
		try {
			await this.sequelize.authenticate();
			this.started = true;
			console.log('Connection has been established successfully.');
		} catch (error) {
			console.error('Unable to connect to the database:', error);
		}
	}
	async initializeModels() {
		if (!this.started) {
			throw new Error('Database not started');
		}
		this.HääletusModel = Hääletus(this.sequelize, DataTypes);
		this.LogiModel = Logi(this.sequelize, DataTypes);

		this.HääletusModel.addHook('afterUpdate', 'logUpdate', async (instance) => {
			const { kasutaja_id, otsus } = instance._previousDataValues;
			const tegevus_aeg = new Date();
			await this.LogiModel.create({ kasutaja_id, otsus, tegevus_aeg });
		});
	}
	async getUser(username, password) {
		if (!this.started) {
			throw new Error('Database not started');
		}
		const voted = kasutajad(this.sequelize, DataTypes);
		return await voted.findOne({ where: { kasutajanimi: username, parool: password } });
	}
	async logAction(kasutaja_id, otsus) {
		if (!this.started) {
			throw new Error('Database not started');
		}
		const tegevus_aeg = new Date();
		await this.LogiModel.create({ kasutaja_id, otsus, tegevus_aeg });
		await this.HääletusModel.update({ otsus }, { where: { kasutaja_id } });
		return await this.LogiModel.findAll();
	}
}

(async () => {
	const database = new DB();
	await database.start();
	await database.initializeModels();
	const log = await database.logAction(3, 'poolt');
	console.log(log);
})();

module.exports = DB;