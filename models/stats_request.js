'use strict';
module.exports = (sequelize, DataTypes) => {
  const StatsRequests = sequelize.define('stats_requests', {
    global_stats_id: DataTypes.INTEGER,
    total_nb_req: DataTypes.INTEGER,
    interface: DataTypes.ENUM('Pro', 'Patient', 'Admin'),
    cutoff_date: DataTypes.DATEONLY
  }, {freezeTableName: true,
    timestamps: false});
    StatsRequests.associate = function(models) {
      models.StatsRequests.belongsTo(models.GlobalStats, { foreignKey: 'global_stats_id'});
  };
  return StatsRequests;
};
