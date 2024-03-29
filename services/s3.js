const AWS = require('aws-sdk');
const fs = require('fs');
const config = require('../config');

const ID = config.awsAccessKeyId;
const SECRET = config.awsSecretAccessKey;
const BUCKET = config.s3Bucket;

const s3 = new AWS.S3({
  accessKeyId: ID,
  secretAccessKey: SECRET,
  region: 'us-east-2',
  signatureVersion: 'v4'
});

const uploadFile = async (fileContent, fileName) => {
  try {
    // Setting up S3 upload parameters
    const params = {
      Bucket: BUCKET,
      Key: fileName,
      Body: fileContent
    };

    // Uploading files to the bucket
    await s3.upload(params).promise();
  } catch (err) {
    throw new Error(`Could not upload file to S3: ${err.message}`);
  }
};

const deleteFile = async fileName => {
  try {
    // Setting up S3 upload parameters
    const params = {
      Bucket: BUCKET,
      Key: fileName
    };

    // Uploading files to the bucket
    await s3.deleteObject(params).promise();
  } catch (err) {
    throw new Error(`Could not delete file from S3: ${err.message}`);
  }
};

const getDownloadUrl = async fileName => {
  try {
    const params = {
      Bucket: BUCKET,
      Key: fileName
    };

    return await s3.getSignedUrlPromise('getObject', params);
  } catch (err) {
    throw new Error(`Could not retrieve file from S3: ${err.message}`);
  }
};

module.exports = {
  uploadFile,
  deleteFile,
  getDownloadUrl
};
