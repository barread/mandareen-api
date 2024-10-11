'use strict';
module.exports = (sequelize, DataTypes) => {
  const Fav_recipes = sequelize.define('fav_recipes', {
    patient_id: DataTypes.STRING(100),
    recipe_id: DataTypes.STRING(100),
  }, {freezeTableName: true,
    timestamps: false});
  Fav_recipes.associate = function(models) {
    // associations can be defined here
    Fav_recipes.belongsTo(models.Recipes);
    Fav_recipes.belongsTo(models.Patient);
  };
  return Fav_recipes;
};
