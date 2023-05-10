const mongoose = require('mongoose');
const dotenv = require("dotenv");

class Database {
  // Private static variable to hold the single instance of the class
  static #instance = null;

  // Private constructor to prevent creating new instances from outside
  _Database() {
    if (Database.#instance) {
      return Database.#instance;
    }

    // Connect to the database
    dotenv.config()
    mongoose.connect(process.env.MONGO_URL)
      .then(() => console.log('Database connected'))
      .catch((err) => console.error('Error connecting to database', err));

    // Set the single instance of the class to the private static variable
    Database.#instance = this;
  }

  // Public static method to get the single instance of the class
  static getInstance() {
    if (!Database.#instance) {
      new Database()._Database();
    }

    return Database.#instance;
  }
}

module.exports = Database;

