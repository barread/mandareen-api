'use strict';
module.exports = (sequelize, DataTypes) => {
  const Stats = sequelize.define('stats', {
    id_patient: DataTypes.STRING(100),
    report_date: DataTypes.DATEONLY,
    app_time: DataTypes.TIME,
    recipe_time: DataTypes.TIME,
    diary_time: DataTypes.TIME,
    music_genre: DataTypes.STRING(255)
  }, {freezeTableName: true,
    timestamps: false});
  Stats.associate = function(models) {
    // associations can be defined here
  };
  return Stats;
};
