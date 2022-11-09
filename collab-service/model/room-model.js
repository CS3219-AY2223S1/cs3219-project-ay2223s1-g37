/**
 * Room requires info abt...
 * User1 - username
 * User2 - username
 * current total rounds in the session
 * difficulty of qns
 * time room is entered
 * time allocated based on difficulty
 * code entered
 */

let RoomModelSchema = (sequelize, DataTypes) =>
  sequelize.define("Room", {
    username1: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username2: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    interviewer: {
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
    allocatedTime: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    code: {
      type: DataTypes.STRING,
    },
    question: {
      type: DataTypes.JSON,
      defaultValue: null,
    },
    questionHistory: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
  });

export default RoomModelSchema;
