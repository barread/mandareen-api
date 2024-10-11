'use strict';
var crypt = require('../utils/encryption');

module.exports = (sequelize, DataTypes) => {
    var Sessions = sequelize.define('sessions', {
        patient_id: DataTypes.STRING(100),
        text_situation: {
            type: DataTypes.TEXT,
            unique: false,
            allowNull: true,
            set(val) {
                this.setDataValue('text_situation', crypt.Encrypt(val));
            },
            get() {
                if (this.getDataValue('text_situation')) {
                    try {
                        return crypt.Uncrypt(this.getDataValue('text_situation'));
                    }
                    catch (e) {
                        return this.getDataValue('text_situation');
                    }
                }
            }
        },
        text_mood: {
            type: DataTypes.TEXT,
            unique: false,
            allowNull: true,
            set(val) {
              this.setDataValue('text_mood', crypt.Encrypt(val));
            },
            get(){
              if (this.getDataValue('text_mood')) {
              try{
              return crypt.Uncrypt(this.getDataValue('text_mood'));
              }
              catch (e){
                return this.getDataValue('text_mood');
              }
            }}
          },
        mood_global_degree: DataTypes.INTEGER,
        text_automatic: {
            type: DataTypes.TEXT,
            unique: false,
            allowNull: true,
            set(val) {
              this.setDataValue('text_automatic', crypt.Encrypt(val));
            },
            get(){
              if (this.getDataValue('text_automatic')) {
              try{
              return crypt.Uncrypt(this.getDataValue('text_automatic'));
              }
              catch (e){
                return this.getDataValue('text_automatic');
              }
            }
          }
          },
        automatic_global_degree: DataTypes.INTEGER,
        text_rational: {
            type: DataTypes.TEXT,
            unique: false,
            allowNull: true,
            set(val) {
              this.setDataValue('text_rational', crypt.Encrypt(val));
            },
            get(){
              if (this.getDataValue('text_rational')) {
              try{
              return crypt.Uncrypt(this.getDataValue('text_rational'));
              }
              catch (e){
                return this.getDataValue('text_rational');
              }
            }
          }
          },
        rational_global_degree: DataTypes.INTEGER,
        text_result: {
            type: DataTypes.TEXT,
            unique: false,
            allowNull: true,
            set(val) {
              this.setDataValue('text_result', crypt.Encrypt(val));
            },
            get(){
              if (this.getDataValue('text_result')) {
              try{
              return crypt.Uncrypt(this.getDataValue('text_result'));
              }
              catch (e){
                return this.getDataValue('text_result');
              }
            }
          }
          },
        result_global_degree: DataTypes.INTEGER,
        status: DataTypes.INTEGER,
        creation_date: DataTypes.DATEONLY
    }, {
        freezeTableName: true,
        timestamps: false
    });
    Sessions.associate = function(models) {
        models.Sessions.belongsTo(models.Patient, {foreignKey: 'patient_id'});
    };
    return Sessions;
};
