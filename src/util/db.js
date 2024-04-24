const { Sequelize, DataTypes, Op } = require('sequelize');
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
	async countVotes() {
		try {
			const votes = await this.HääletusModel.findAll({
				attributes: [
					'otsus',
					[this.sequelize.fn('COUNT', this.sequelize.col('otsus')), 'count'],
				],
				where: {
					otsus: {
						[Op.not]: null,
					},
				},
				group: ['otsus'],
			});
			return votes;
		} catch (error) {
			console.error('Error counting votes:', error);
			throw error;
		}
	}

	async updateTulemused(votes) {
		try {
			let totalCount = 0;
			let pooltCount = 0;
			let vastuCount = 0;

			votes.forEach(vote => {
				const count = vote.dataValues.count;
				totalCount += count;
				if (vote.dataValues.otsus === 'poolt') {
					pooltCount += count;
				} else if (vote.dataValues.otsus === 'vastu') {
					vastuCount += count;
				}
			});
			const latestEntry = await this.tulemusedModel.findOne({
				order: [['h_alguse_aeg', 'DESC']],
			});
			await latestEntry.update({
				hääletanute_arv: totalCount,
				poolt_hääled: pooltCount,
				vastu_hääled: vastuCount,
			});
		} catch (error) {
			console.error('Error updating TULEMUSED table:', error);
			throw error;
		}
	}
	async addNewVotingTime(newVotingTime) {
		if (!this.started) {
			throw new Error('Database not started');
		}

		try {
			await this.tulemusedModel.create({ h_alguse_aeg: newVotingTime });
			await this.HääletusModel.update({ otsus: null }, { where: {} });
			const user = Kasutajad(this.sequelize, DataTypes);
			await user.update({ voted: false }, { where: {} });
		} catch (error) {
			throw new Error('Error adding new voting time:', error);
		}
	}

	async voteAction(kasutaja_id, otsus) {
		if (!this.started) {
			throw new Error('Database not started');
		}
		const hääletuse_aeg = new Date();
		await this.HääletusModel.update({ hääletuse_aeg, otsus }, { where: { kasutaja_id } });
		return await this.LogiModel.findAll();
	}
}

module.exports = DB;
