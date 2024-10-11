'use strict';
module.exports = (sequelize, DataTypes) => {
  const Subscription = sequelize.define('subscription', {
    name: DataTypes.STRING(50),
    price: DataTypes.DECIMAL,
    max_patients: DataTypes.INTEGER,
    creation_date: DataTypes.DATE
  }, {freezeTableName: true,
    timestamps: false});
  Subscription.associate = function(models) {
  };
  return Subscription;
};
