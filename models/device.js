'use strict';
const debug = require("debug")("app:models:patient");
const bcrypt = require("bcrypt");

module.exports = (sequelize, DataTypes) => {
    const Device = sequelize.define('devices', {
        token: DataTypes.STRING,
        platform: DataTypes.STRING(45),
        app_version: DataTypes.STRING,
        version: DataTypes.STRING(45),
        manufacturer: DataTypes.STRING(45),
        model: DataTypes.STRING(45),
        uuid: DataTypes.STRING(45),
        patient_id: DataTypes.INTEGER
    }, {
        freezeTableName: true,
        timestamps: false
    });
    Device.associate = function(models) {
        Device.belongsTo(models.Patient);
    };

    return Device;
};
