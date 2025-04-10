"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "users",
      [
        {
          name: "John Doe",
          password: "password1",
          createdAt: new Date(),
        },
        {
          name: "Robbin Schrijver",
          password: "password2",
          createdAt: new Date(),
        },
        {
          name: "Richard Karpivikovskiskividaski",
          password: "password3",
          createdAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", null, {});
  },
};
