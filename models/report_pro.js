'use strict';
var crypt = require('../utils/encryption');

module.exports = (sequelize, DataTypes) => {
  const Report_pro = sequelize.define('report_pro', {
    content: {
      type: DataTypes.STRING,
      unique: false,
      allowNull: false,
      set(val) {
        this.setDataValue('content', crypt.Encrypt(val));
      },
      get(){
        if (this.getDataValue('content')) {
        try{
        return crypt.Uncrypt(this.getDataValue('content'));
        }
        catch (e){
          return this.getDataValue('content');
        }
      }
    }
    },
    patient_id: DataTypes.STRING(100),
    pro_id: DataTypes.STRING(100),
    reporting_date: DataTypes.DATE()
  }, {freezeTableName: true,
    timestamps: false});
  Report_pro.associate = function(models) {
      // associations can be defined here
    models.Report_pro.belongsTo(models.Pro, {
      foreingKey: {
        allowNull: false
      }
    });

    models.Report_pro.belongsTo(models.Followup, {
      foreignKey: 'patient_id'
    });

    models.Report_pro.belongsTo(models.Followup, {
      foreignKey: 'pro_id'
    });

  };
  return Report_pro;
};
