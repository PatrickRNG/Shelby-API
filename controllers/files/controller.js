'use strict';

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const Files = require('../../models/files');
const config = require('../../config');
const {
  base64_encode,
  base64_decode,
  localUploadFile
} = require('../../utils/files');
const { uploadFile, deleteFile, getFile } = require('../../services/s3');

const production = config.env === 'production';

const buildFilePath = fileName => ({
  localPath: path.join(__dirname, '../..', 'tmp', filename),
  herokuPath: path.join(__dirname, '../../..', 'tmp', filename)
});

const downloadFile = async (req, res, next) => {
  try {
    const { fileName } = req.body;
    const s3Object = await getFile(fileName);
    console.log('\n\n 111111 FILEEEEEEEEE >>>>>>>>>>>>>>>>>>>>>>>>> ', s3Object);
    const { herokuPath, localPath } = buildFilePath(fileName);

    production ? localUploadFile(herokuPath, s3Object) : localUploadFile(localPath, s3Object);
    
    const filePath = production ? herokuPath : localPath ;
    
    res.json({ filePath });
  } catch (err) {
    next(err);
  }
};

const processFile = async (req, res, next) => {
  try {
    const { filename } = req.file;
    console.log('\n\n FILEEEEEEEEE >>>>>>>>>>>>>>>>>>>>>>>>> ', req.file);

    const dataApiUrl = `${config.dataApiUrl}/getEmentas2`;
    const { herokuPath, localPath } = buildFilePath(filename);

    const filePath = production ? herokuPath : localPath;

    const params = {
      pdf: base64_encode(filePath),
      factor: 7,
      words: 15,
      max_diff: 0.2,
      min_sim: 0.6
    };

    const response = await fetch(dataApiUrl, {
      method: 'POST',
      body: JSON.stringify(params)
    });

    const result = await response.json();
    const processedFile = await base64_decode(result.pdf);
    
    console.log('\n\n DECODED BUFFER >>>>>>>>>>>>>>', processedFile);

    production ? uploadFile(processedFile, filename) : localUploadFile(filePath, processedFile);
    
    // Update database with file info
    await Files.findOneAndUpdate(
      { email: req.user.email },
      {
        email: req.user.email,
        $addToSet: { files: { ...req.file, loading: 'processed' } }
      },
      { upsert: true, new: true }
    ).exec();

    res.json({ file: req.file, success: true });
    res.status(200);
  } catch (err) {
    next(err);
  }
};

const getProcessedFiles = async (req, res, next) => {
  try {
    const processedFiles = await Files.findOne(
      { email: req.user.email },
      'email files',
      { _id: 0, __v: 0 }
    ).exec();

    res.status(200);
    const newFiles = processedFiles ? processedFiles.toObject() : {};
    const response = { ...newFiles, success: true };
    res.json(response);
  } catch (err) {
    next(err);
  }
};

const deleteProcessedFile = async (req, res, next) => {
  try {
    const { filename } = req.body;
    await Files.updateOne(
      { email: req.user.email },
      { $pull: { files: { loading: 'processed', filename } } },
      { _id: 0, __v: 0 }
    ).exec();

    const { herokuPath, localPath } = buildFilePath(filename);
    const filePath = production ? herokuPath : localPath;

    production ? await deleteFile(filename) : fs.unlinkSync(filePath);

    res.status(200);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  downloadFile,
  getProcessedFiles,
  processFile,
  deleteProcessedFile
};
