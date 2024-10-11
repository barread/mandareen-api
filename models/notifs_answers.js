'use strict';
module.exports = (sequelize, DataTypes) => {
  const Notifs_Answers = sequelize.define('notifs_answers', {
      objectives_id: DataTypes.STRING(100),
      content: DataTypes.STRING
  }, {freezeTableName: true,
    timestamps: false});
    Notifs_Answers.associate = function(models) {
    // associations can be defined here
        Notifs_Answers.belongsTo(models.Objectives);
  };
    return Notifs_Answers;
};
