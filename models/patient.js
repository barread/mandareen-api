"use strict";
const debug = require("debug")("app:models:patient");
const bcrypt = require("bcrypt");
const oneSignal = require("../libs/oneSignal");
var crypt = require("../utils/encryption");

module.exports = (sequelize, DataTypes) => {
  const Patient = sequelize.define(
    "patient",
    {
      email: {
        type: DataTypes.STRING(256),
        unique: true,
        allowNull: false,
        set(val) {
          this.setDataValue("email", crypt.Encrypt(val));
        },
        get() {
          if (this.getDataValue("email")) {
            try {
              return crypt.Uncrypt(this.getDataValue("email"));
            } catch (e) {
              return this.getDataValue("email");
            }
          }
        }
      },
      pass: DataTypes.STRING(200),
      civ: DataTypes.ENUM("M", "Mme"),
      firstname: {
        type: DataTypes.STRING(256),
        unique: true,
        allowNull: false,
        set(val) {
          this.setDataValue("firstname", crypt.Encrypt(val));
        },
        get() {
          if (this.getDataValue("firstname")) {
            try {
              return crypt.Uncrypt(this.getDataValue("firstname"));
            } catch (e) {
              return this.getDataValue("firstname");
            }
          }
        }
      },
      lastname: {
        type: DataTypes.STRING(256),
        unique: true,
        allowNull: false,
        set(val) {
          this.setDataValue("lastname", crypt.Encrypt(val));
        },
        get() {
          if (this.getDataValue("firstname")) {
            try {
              return crypt.Uncrypt(this.getDataValue("lastname"));
            } catch (e) {
              return this.getDataValue("lastname");
            }
          }
        }
      },
      birthdate: DataTypes.DATEONLY
    },
    {
      freezeTableName: true,
      timestamps: false
    }
  );
  Patient.associate = function(models) {
    Patient.hasOne(models.Fav_recipes);
    models.Report_pro.belongsTo(models.Patient, {
      foreingKey: {
        allowNull: false
      }
    });
    Patient.hasMany(models.Device);
    Patient.hasMany(models.Objectives);
    // associations can be defined here
  };

  Patient.prototype.resetPassword = function() {
    const characters = "1234567890";
    const length = 4;
    let newPassword = "";
    let self = this;
    for (let i = 0; i < length; i++) {
      newPassword += characters[Math.floor(Math.random() * characters.length)];
    }
    debug("reset password", this.email, newPassword);

    bcrypt.hash(newPassword, 5, function(err, bcryptedPassword) {
      return self.update({ pass: bcryptedPassword });
    });
    return newPassword;
  };

  Patient.prototype.sendNotification = function(notification) {
    const self = this;
    return this.getDevices({ attributes: ["uuid"] })
      .then(function(devices) {
        if (devices.length === 0) {
          return;
        }
        notification.tokens = devices.map(function(device) {
          return device.uuid;
        });
        return oneSignal.sendNotification(notification);
      })
      .then(function() {
        return { id: self.id, success: true };
      })
      .catch(function(err) {
        debug("notification err", err);
        return { id: self.id, success: false, err: err };
      });
  };
  return Patient;
};
