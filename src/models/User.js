// Requiring bcrypt for password hashing. Using the bcryptjs version as the regular bcrypt module sometimes causes errors on Windows machines
// eslint-disable-next-line no-undef
var bcrypt = require('bcryptjs');
var Sequelize = require('sequelize');

// Creating our User model
// eslint-disable-next-line no-undef
module.exports = function(sequelize, DataTypes) {
    let User = sequelize.define('User', {
    // The username cannot be null, and must be a proper email before creation  
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        // The password cannot be null
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        createdAt: {
            // eslint-disable-next-line no-undef
            type: DataTypes.DATE,
            defaultValue: Sequelize.literal('NOW()')
        },
        updatedAt: {
            // eslint-disable-next-line no-undef
            type: DataTypes.DATE,
            defaultValue: Sequelize.literal('NOW()')
        }
    }, {
        timestamps: false
    }, {
        freezeTableName: true
    });

    // for foreign key
    User.associate = function(models) {
        User.hasMany(models.Books, {
            onDelete: 'cascade'
        });
    };

    // Creating a custom method for our User model. This will check if an unhashed password entered by the user can be compared to the hashed password stored in our database
    User.prototype.validPassword = function(password) {
        return bcrypt.compareSync(password, this.password);
    };
    
    // Hooks are automatic methods that run during various phases of the User Model lifecycle
    // In this case, before a User is created, we will automatically hash their password
    User.addHook('beforeCreate', function(user) {
        user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10), null);
    });

    User.sync();
    
    return User;
};
