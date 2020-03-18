require('dotenv').config() // load .env file

module.exports = {
  port: process.env.PORT,
  app: process.env.APP,
  env: process.env.NODE_ENV,
  secret: process.env.APP_SECRET,
  apiUrl: process.env.API_URL,
  dataApiUrl: process.env.DATA_API_URL,
  mongo: {
    uri: process.env.MONGODB_URI,
    testURI: process.env.MONGOTESTURI
  },
  sendgrid: {
    apiKey: process.env.SEND_GRID_API,
    email: process.env.SEND_GRID_EMAIL,
    name: process.env.SEND_GRID_NAME
  },
  s3Bucket: process.env.S3_BUCKET,
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  awsPublicUrl: process.env.AWS_PUBLIC_URL,
  fileUrl: `${process.env.API_URL}/tmp`,
}
