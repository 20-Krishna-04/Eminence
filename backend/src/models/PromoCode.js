const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PromoCode = sequelize.define('PromoCode', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    set(val) {
      if (val) this.setDataValue('code', val.trim().toUpperCase());
    }
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  discountType: {
    type: DataTypes.ENUM('FLAT', 'PERCENTAGE'),
    defaultValue: 'FLAT',
  },
  discountValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 100.0,
  },
  maxDiscount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  minOrderValue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.0,
  },
  maxUses: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  usedCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }
}, {
  timestamps: true,
});

module.exports = PromoCode;
