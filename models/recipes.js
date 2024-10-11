'use strict';
module.exports = (sequelize, DataTypes) => {
  const Recipes = sequelize.define('recipes', {
    name: DataTypes.STRING(255),
    nb_cal: DataTypes.INTEGER,
    ingredients: DataTypes.STRING(255),
    description: DataTypes.STRING(2048),
    nb_likes: DataTypes.INTEGER,
    recipe_cooking_time: DataTypes.TIME,
    recipe_type: DataTypes.ENUM('Entree', 'Plat', 'Dessert', 'Sauce', 'Accompagnement', 'Boisson')
  }, {freezeTableName: true,
    timestamps: false});
  Recipes.associate = function(models) {
    // associations can be defined here
    Recipes.hasOne(models.Fav_recipes);
  };
  return Recipes;
};
