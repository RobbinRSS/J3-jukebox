"use strict";
// NOTE sequelize is used for migrations

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // Deze functie wordt uitgevoerd wanneer je de migration toepast (via npx sequelize-cli db:migrate)
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  // Deze functie wordt uitgevoerd wanneer je de migration terugdraait (via npx sequelize-cli db:migrate:undo)
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("users");
  },
};
