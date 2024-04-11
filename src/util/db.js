const { Sequelize, DataTypes } = require('sequelize');
const Hääletus = require('../models/HÄÄLETUS');
const Logi = require('../models/LOGI');
const Kasutajad = require('../models/KASUTAJAD');
const TULEMUSED = require('../models/TULEMUSED');
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
		this.tulemusedModel = TULEMUSED(this.sequelize, DataTypes);
	}
	async getUser(username, password) {
		if (!this.started) {
			throw new Error('Database not started');
		}
		const voted = Kasutajad(this.sequelize, DataTypes);
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

	async markAllUsersAsVoted() {
		if (!this.started) {
			throw new Error('Database not started');
		}
		const user = Kasutajad(this.sequelize, DataTypes);
		await user.update({ voted: true }, { where: {} });
	}

	async checkIfVoted(user) {
		if (!this.started) {
			throw new Error('Database not started');
		}
		const voted = Kasutajad(this.sequelize, DataTypes);
		const userData = await voted.findOne({ where: { id: user.id } });
		return userData ? userData.voted : false;
	}
	async addNewVotingTime(newVotingTime) {
		if (!this.started) {
			throw new Error('Database not started');
		}

		try {
			await this.tulemusedModel.create({ h_alguse_aeg: newVotingTime });
			const user = Kasutajad(this.sequelize, DataTypes);
			await user.update({ voted: false }, { where: {} });
		} catch (error) {
			throw new Error('Error adding new voting time:', error);
		}
	}


}

module.exports = DB;
