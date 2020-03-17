const AWS = require('aws-sdk');
const config = require('../config');

const ID = config.awsAccessKeyId;
const SECRET = config.awsSecretAccessKey;
const BUCKET = config.s3Bucket;

const s3 = new AWS.S3({
  accessKeyId: ID,
  secretAccessKey: SECRET
});

const uploadFile = (fileContent, fileName) => {
  // Setting up S3 upload parameters
  const params = {
    Bucket: BUCKET,
    Key: fileName,
    Body: fileContent
  };

  // Uploading files to the bucket
  s3.upload(params, function(err, data) {
    if (err) {
      throw err;
    }
    console.log(`File uploaded successfully. ${data.Location}`);
  });
};

const deleteFile = (fileName) => {
  // Read content from the file
  // const fileContent = fs.readFileSync(filePath);

  // Setting up S3 upload parameters
  const params = {
    Bucket: BUCKET,
    Key: fileName,
  };

  // Uploading files to the bucket
  s3.deleteObject(params, function(err, data) {
    if (err) {
      throw err;
    }
    console.log('File deleted successfully.', data);
  });
};


module.exports = {
  uploadFile,
  deleteFile
};
