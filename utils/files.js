const fs = require('fs');

function base64_encode(file) {
    // read binary data
    const bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}

function base64_decode(base64str) {
  return new Promise((resolve, reject) => {
    // create buffer object from base64 encoded string
    const bitmap = new Buffer(base64str, 'base64');
    resolve(bitmap);
  })
}

function localUploadFile(filePath, fileData) {
  fs.writeFileSync(filePath, fileData);
}

module.exports = {
  base64_encode,
  base64_decode,
  localUploadFile
}