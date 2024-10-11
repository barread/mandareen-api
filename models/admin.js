'use strict';
var crypt = require('../utils/encryption');

module.exports = (sequelize, DataTypes) => {
  var Admin = sequelize.define('admin', {
    login: DataTypes.STRING(100),
    pass: DataTypes.STRING(200),
    email: {
      type: DataTypes.STRING(256),
      unique: true,
      allowNull: false,
      set(val) {
        this.setDataValue('email', crypt.Encrypt(val));
      },
      get() {
        if (this.getDataValue('email')) {
        try{
          const val = crypt.Uncrypt(this.getDataValue('email'));
          return val;
        }
        catch (e){
          var val = this.getDataValue('email');
          return val;
        }
      }}
    },
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
        var val = this.getDataValue('firstname');
        return val;
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
          try {
            return crypt.Uncrypt(this.getDataValue('lastname'));
          }
          catch (e){
            var val = this.getDataValue('lastname');
            return val;
          }
        }
      }
    },
    type: DataTypes.ENUM('Commercial', 'Admin', 'Super-Admin')
  }, {freezeTableName: true,
    timestamps: false});
  Admin.associate = function(models) {
    // associations can be defined here
  };
  return Admin;
};