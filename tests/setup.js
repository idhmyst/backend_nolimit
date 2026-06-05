// Setup file untuk Jest
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Mock semua dependencies database sebelum import
jest.mock('sequelize', () => {
  const Sequelize = jest.requireActual('sequelize').Sequelize;
  return {
    Sequelize,
    DataTypes: jest.requireActual('sequelize').DataTypes,
  };
});

// Set test environment
process.env.NODE_ENV = 'test';
