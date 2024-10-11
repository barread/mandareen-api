'use strict';
module.exports = (sequelize, DataTypes) => {
  const Answer = sequelize.define('answers', {
    question: DataTypes.TEXT,
    answer: DataTypes.TEXT,
  }, {freezeTableName: true,
    timestamps: false});
  Answer.associate = function(models) {
   };
  return Answer;
};
