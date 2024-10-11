'use strict';
module.exports = (sequelize, DataTypes) => {
  const Care = sequelize.define('care', {
    sickness_name: DataTypes.STRING(100)
  }, {timestamps: false});
  Care.associate = function(models) {
  };
  return Care;
};
