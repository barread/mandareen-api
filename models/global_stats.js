'use strict';
module.exports = (sequelize, DataTypes) => {
  const GlobalStats = sequelize.define('global_stats', {
    nb_pro: DataTypes.INTEGER,
    nb_seance: DataTypes.INTEGER,
    pat_average: DataTypes.DECIMAL,
    nb_rapport: DataTypes.INTEGER,
    nb_patient: DataTypes.INTEGER,
    time_average: DataTypes.TIME,
    total_nb_req: DataTypes.INTEGER,
    total_nb_errors: DataTypes.INTEGER,
    cutoff_date: DataTypes.DATEONLY
  }, {freezeTableName: true,
    timestamps: false});
    GlobalStats.associate = function(models) {
  };
  return GlobalStats;
};
