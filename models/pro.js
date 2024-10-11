'use strict';
var crypt = require('../utils/encryption');

module.exports = (sequelize, DataTypes) => {
  var Pro = sequelize.define('pro', {
    id: {
      type: DataTypes.STRING(100),
      unique: true,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(256),
      unique: true,
      allowNull: false,
      set(val) {
        this.setDataValue('email', crypt.Encrypt(val));
      },
      get: function(){
        if (this.getDataValue('email')){
        try{
          return crypt.Uncrypt(this.getDataValue('email'));
        }
        catch (e){
          const val = this.getDataValue('email');
          return val;
        }
      }}
    },
    pass: DataTypes.STRING(200),
    civ: DataTypes.ENUM('M', 'Mme'),
    firstname: {
      type: DataTypes.STRING(256),
      unique: true,
      allowNull: false,
      set(val) {
        this.setDataValue('firstname', crypt.Encrypt(val));
      },
      get(){
        if (this.getDataValue('firstname')) {
        try{
        return crypt.Uncrypt(this.getDataValue('firstname'));
        }
        catch (e){
          return this.getDataValue('firstname');
        }
      }
    }
    },
    lastname: {
      type: DataTypes.STRING(256),
      unique: true,
      allowNull: false,
      set(val) {
        this.setDataValue('lastname', crypt.Encrypt(val));
      },
      get(){
        if (this.getDataValue('lastname')) {
        try{
        return crypt.Uncrypt(this.getDataValue('lastname'));
        }
        catch (e){
          return this.getDataValue('lastname');
        }
      }
    }
    },
    city: DataTypes.STRING(150),
    zipcode: DataTypes.STRING(150),
    adeli: DataTypes.STRING(256),
    phone: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      set(val) {
        this.setDataValue('phone', crypt.Encrypt(val));
      },
      get(){
        if (this.getDataValue('phone')) {
        try{
        return crypt.Uncrypt(this.getDataValue('phone'));
        }
        catch (e){
          return this.getDataValue('phone');
        }
      }
    }
    },
    type: DataTypes.ENUM('Psy', 'Doctor')
  }, {freezeTableName: true,
    timestamps: false});
  Pro.associate = function(models) {
    models.Pro.hasMany(models.Report_pro);
    models.Pro.hasMany(models.Followup);
  };
  return Pro;
};
