const { DataTypes } = require('sequelize');
const usersDB = require('../config/usersDB');

const Users = usersDB.define('users',{
    uuid:{
        type: DataTypes.STRING,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        validate:{
            notEmpty: true
        }
    },
    name:{
        type: DataTypes.STRING,
        allowNull: false,
        validate:{
            notEmpty: true,
            len: [3, 100]
        }
    },
    email:{
        type: DataTypes.STRING,
        allowNull: false,
        validate:{
            notEmpty: true,
            isEmail: true
        }
    },
    password:{
        type: DataTypes.STRING,
        allowNull: false,
        validate:{
            notEmpty: true
        }
    },
    role:{
        type: DataTypes.STRING,
        allowNull: false,
        validate:{
            notEmpty: true
        }
    },
    profileImage: {  // New column for profile image
        type: DataTypes.STRING,
        allowNull: true // It can be null if the user hasn't uploaded an image yet
       
    }

},{
    freezeTableName: true
});

module.exports =  Users;