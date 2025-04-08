"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("saved_playlists", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      playlist_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "playlists", // Naam van de tabel die we als referentie gebruiken
          key: "id", // De primaire sleutel van de playlists tabel
        },
      },

      songId: {
        type: Sequelize.INTEGER,
        references: {
          model: "songs",
          key: "id",
        },
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
