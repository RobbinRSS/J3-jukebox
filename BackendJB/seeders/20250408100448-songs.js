"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "songs",
      [
        { song_title: "cool song", song_duration: "210", genre: "Pop" },
        { song_title: "cool song 2", song_duration: "160", genre: "Hardstyle" },
        { song_title: "cool song 3", song_duration: "320", genre: "Rap" },
        { song_title: "chill song", song_duration: "180", genre: "Jazz" },
        { song_title: "dance anthem", song_duration: "210", genre: "EDM" },
        { song_title: "party track", song_duration: "150", genre: "Hip-hop" },
        { song_title: "classic hits", song_duration: "240", genre: "Rock" },
        { song_title: "relax beats", song_duration: "200", genre: "Lo-fi" },
        { song_title: "summer vibes", song_duration: "210", genre: "Pop" },
        { song_title: "epic song", song_duration: "300", genre: "Soundtrack" },
        { song_title: "indie track", song_duration: "180", genre: "Indie" },
        { song_title: "groovy tune", song_duration: "220", genre: "Funk" },
        { song_title: "mellow tune", song_duration: "190", genre: "R&B" },
        { song_title: "tech beats", song_duration: "230", genre: "Techno" },
        {
          song_title: "melancholy song",
          song_duration: "260",
          genre: "Alternative",
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("songs", null, {});
  },
};
