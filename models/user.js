'use strict';
const bcrypt = require('bcryptjs')


module.exports = function (sequelize, DataTypes) {
  var User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
      allowNull: false
    },
    username: DataTypes.STRING,
    passwordHash: DataTypes.STRING,
    password: {
      type:DataTypes.VIRTUAL,
      set: function (value) {
        const hash = bcrypt.hashSync(value, 8);
        this.setDataValue('passwordHash', hash);
      }
    }
  }, {
      
      classMethods: {
        associate: function (models) {
          // Does hashing happen here?

        }
      }
    });
  return User;
};