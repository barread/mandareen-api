'use strict';
module.exports = (sequelize, DataTypes) => {
    const Subs_pro = sequelize.define('subs_pro', {
        pro_id: DataTypes.STRING(100),
        sub_id: DataTypes.STRING(100),
        pending: DataTypes.ENUM('Yes', 'No'),
        date_sub_start: DataTypes.DATE,
        date_sub_end: DataTypes.DATE
    }, {
        freezeTableName: true,
        timestamps: false
    });
    Subs_pro.associate = function(models) {
        models.Subs_pro.belongsTo(models.Pro, { foreignKey: 'pro_id'});
        models.Subs_pro.belongsTo(models.Subscription, { foreignKey: 'sub_id'});
    };
    return Subs_pro;
};
