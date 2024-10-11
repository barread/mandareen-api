'use strict';
var crypt = require('../utils/encryption');

module.exports = (sequelize, DataTypes) => {
  const Diary = sequelize.define('diary', {
    id: {
      type: DataTypes.STRING(100),
      unique: true,
      primaryKey: true
    },
    content: {
      type: DataTypes.TEXT,
      unique: false,
      allowNull: false,
      set(val) {
        this.setDataValue('content', crypt.Encrypt(val));
      },
      get() {
        if (this.getDataValue('content')) {
          try {
            return crypt.Uncrypt(this.getDataValue('content'));
          }
          catch (e) {
            const val = this.getDataValue('content');
            return val;
          }
        }
      }
    },
    patient_id: DataTypes.STRING(100),
  }, {
    freezeTableName: true,
      timestamps: false
    });
  Diary.associate = function (models) {
    Diary.belongsTo(models.Patient);
  };
  return Diary;
};