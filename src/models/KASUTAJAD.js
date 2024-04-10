const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('KASUTAJAD', {
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
        kasutajanimi: {
            type: DataTypes.STRING(255),
            allowNull: true,
            unique: 'kasutajnimi',
        },
        parool: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        voted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    }, {
        sequelize,
        tableName: 'KASUTAJAD',
        timestamps: false,
        indexes: [
            {
                name: 'PRIMARY',
                unique: true,
                using: 'BTREE',
                fields: [
                    { name: 'id' },
                ],
            },
            {
                name: 'kasutajnimi',
                unique: true,
                using: 'BTREE',
                fields: [
                    { name: 'kasutajanimi' },
                ],
            },
        ],
    });
};
