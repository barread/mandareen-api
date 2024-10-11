'use strict';
module.exports = (sequelize, DataTypes) => {
  const Obj_meal = sequelize.define('obj_meal', {
    reporting_date: DataTypes.DATE(),
    description: DataTypes.STRING(1024),
    calories: DataTypes.INTEGER,
    patient_id: DataTypes.STRING(100),
    is_finished: DataTypes.BOOLEAN
  }, {freezeTableName: true,
    timestamps: false});
  Obj_meal.associate = function(models) {
    // associations can be defined here
    Obj_meal.belongsTo(models.Patient);
  };
  return Obj_meal;
};
