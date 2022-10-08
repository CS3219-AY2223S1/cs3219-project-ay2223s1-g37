/**
 * Match requires info abt...
 * User1 - username
 * User2 - username
 * current total rounds in the session
 * difficulty of qns
 * matching start time
 */

// Rounds are temporarily put in match model, can be shifted to room model
let MatchModelSchema = (sequelize, DataTypes) =>
  sequelize.define("Match", {
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
    },
  });

export default MatchModelSchema;
