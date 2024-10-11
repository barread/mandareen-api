'use strict';
module.exports = (sequelize, DataTypes) => {
  const pro_bill = sequelize.define('pro_bill', {
    lastname: DataTypes.STRING(256),
    firstname: DataTypes.STRING(256),
    address: DataTypes.STRING(256),
    zipcode: DataTypes.STRING(50),
    city: DataTypes.STRING(100),
    sub_id: DataTypes.STRING(100)
  }, {freezeTableName: true,
    timestamps: false});
  pro_bill.associate = function(models) {
    models.pro_bill.belongsTo(models.Subs_pro, { foreignKey: 'sub_id'});
  };
  return pro_bill;
};
