'use strict';
module.exports = (sequelize, DataTypes) => {
  const Obj_sport = sequelize.define('obj_sport', {
    reporting_date: DataTypes.DATE(),
    duration: DataTypes.TIME(),
    description: DataTypes.STRING(1024),
    patient_id: DataTypes.STRING(100),
    is_finished: DataTypes.BOOLEAN
  }, {freezeTableName: true,
    timestamps: false});
  Obj_sport.associate = function(models) {
    // associations can be defined here
    Obj_sport.belongsTo(models.Patient);
  };
  return Obj_sport;
};
