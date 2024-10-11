'use strict';
module.exports = (sequelize, DataTypes) => {
  const Patient_Likes = sequelize.define('patient_likes', {
    patient_id: DataTypes.STRING(100),
    recipe_id: DataTypes.STRING(100),
  }, {freezeTableName: true,
          timestamps: false
      });
    Patient_Likes.associate = function (models) {
    // associations can be defined here
        Patient_Likes.belongsTo(models.Recipes);
        Patient_Likes.belongsTo(models.Patient);
    };
    return Patient_Likes;
};
