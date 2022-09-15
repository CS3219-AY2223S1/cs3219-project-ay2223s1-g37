/**
 * Match requires info abt...
 * User1 - username
 * User2 - username
 * difficulty of qns
 * matching start time
 */

let MatchModelSchema = (sequelize, DataTypes) => sequelize.define('Match', {
    username1: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    username2: {
        type: DataTypes.STRING,
    },
    difficulty: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    startTime: {
        type: DataTypes.DATE,
        // allowNull: false,
        defaultValue: DataTypes.NOW,
    }
});
 
export default MatchModelSchema
 