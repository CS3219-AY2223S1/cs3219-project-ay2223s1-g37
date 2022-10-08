/**
 * Room requires info abt...
 * User1 - username
 * User2 - username
 * current total rounds in the session
 * difficulty of qns
 * time room is entered
 */

let RoomModelSchema = (sequelize, DataTypes) =>
  sequelize.define("Room", {
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
    rounds: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

export default MatchModelSchema;
