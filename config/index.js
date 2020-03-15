require('dotenv').config() // load .env file

module.exports = {
  port: process.env.PORT,
  app: process.env.APP,
  env: process.env.NODE_ENV,
  secret: process.env.APP_SECRET,
  apiUrl: process.env.API_URL,
  dataApiUrl: process.env.DATA_API_URL,
  mongo: {
    uri: process.env.MONGOURI,
    testURI: process.env.MONGOTESTURI
  },
  sendgrid: {
    apiKey: process.env.SEND_GRID_API,
    email: process.env.SEND_GRID_EMAIL,
    name: process.env.SEND_GRID_NAME
  }
}
