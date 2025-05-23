"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("playlist_songs", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      playlistId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "playlists",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      songId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "songs",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      songTitle: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      songDuration: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      songGenre: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("playlist_songs");
  },
};
