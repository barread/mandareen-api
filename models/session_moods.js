'use strict';
module.exports = (sequelize, DataTypes) => {
    const Session_moods = sequelize.define('session_moods', {
        sessions_id: DataTypes.STRING(100),
        mood_name: DataTypes.STRING(100),
        mood_degree: DataTypes.INTEGER,
        result_mood_degree: DataTypes.INTEGER
    }, {
        freezeTableName: true,
            timestamps: false
        });
    Session_moods.associate = function (models) {
        // associations can be defined here
    };
    return Session_moods;
};
