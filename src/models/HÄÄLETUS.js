const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('HÄÄLETUS', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    kasutaja_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'KASUTAJAD',
        key: 'id'
      }
    },
    eesnimi: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    perenimi: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    'hääletuse_aeg': {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    otsus: {
      type: DataTypes.ENUM('poolt','vastu'),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'HÄÄLETUS',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "kasutaja_id",
        using: "BTREE",
        fields: [
          { name: "kasutaja_id" },
        ]
      },
    ]
  });
};
