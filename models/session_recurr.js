'use strict';
module.exports = (sequelize, DataTypes) => {
  const Session_recurr = sequelize.define('session_recurr', {
    id: {
      type: DataTypes.STRING(100),
      unique: true,
      primaryKey: true
    },
    pro_id: DataTypes.STRING(100),
    patient_id: DataTypes.STRING(100),
    recurrence: DataTypes.ENUM('Jamais', 'Quotidien', 'Hebdomadaire', 'Mensuel')

  }, {freezeTableName: true,
    timestamps: false});
  Session_recurr.associate = function(models) {
    // associations can be defined here
    Session_recurr.belongsTo(models.Pro);
    Session_recurr.belongsTo(models.Patient);
  };
  return Session_recurr;
};
