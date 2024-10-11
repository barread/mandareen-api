'use strict';
module.exports = (sequelize, DataTypes) => {
    const Followup = sequelize.define('followup', {
        care_id: DataTypes.STRING(100),
        pro_id: DataTypes.STRING(100),
        patient_id: DataTypes.STRING(100),
        is_active: DataTypes.BOOLEAN,
        date_inactive: DataTypes.DATEONLY
    }, {
        freezeTableName: true,
        timestamps: false
    });
    Followup.associate = function(models) {
        Followup.belongsTo(models.Patient, { foreignKey: 'patient_id' });
        Followup.belongsTo(models.Pro, { foreignKey: 'pro_id' });
        Followup.belongsTo(models.Care, { foreignKey: 'care_id' });
    };
    return Followup;
};
