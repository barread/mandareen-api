'use strict';
module.exports = (sequelize, DataTypes) => {
  const Objectives = sequelize.define('objectives', {
    patient_id: DataTypes.STRING(100),
    obj_sleep: DataTypes.INTEGER,
    obj_cal: DataTypes.INTEGER,
    obj_sport: DataTypes.INTEGER,
    nb_sleep: DataTypes.INTEGER,
    nb_cal: DataTypes.INTEGER,
    nb_sport: DataTypes.INTEGER,
    due_date: DataTypes.DATEONLY
  }, {freezeTableName: true,
    timestamps: false});
  Objectives.associate = function(models) {
    models.Objectives.belongsTo(models.Patient, {
      foreignKey: 'patient_id'
    });
  };
  return Objectives;
};
