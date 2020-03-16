'use strict';

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const Files = require('../../models/files');
const config = require('../../config');
const { base64_encode, base64_decode } = require('../../utils/files');

const production = config.env === 'production';
const uploadUrl =  production ? `${config.apiUrl}/uploads` : `/uploads`;;

const sendFiles = (req, res, next) => {
  try {
    const files = req.files;
    res.json({ files });
  } catch (error) {
    return next(error);
  }
};

const downloadFile = (req, res) => {
  const { fileName } = req.body;
  const filePath = `${uploadUrl}/${fileName}`;
  res.json({ filePath });
};

const processFile = async (req, res, next) => {
  try {
    const { filename } = req.file;
    const filePath = `${uploadUrl}/${filename}`;
    console.log('filePath >>>>>>>>>>>>>> ', filePath)
    const dataApiUrl = `${config.dataApiUrl}/getEmentas2`;

    const params = {
      'pdf': base64_encode(filePath),
      'factor': 7,
      'words': 15,
      'max_diff': 0.2,
      'min_sim' : 0.6
    }

    const response = await fetch(dataApiUrl, {
      method: 'POST',
      body: JSON.stringify(params)
    });

    const result = await response.json();
    // Update /uploads with the processed file
    base64_decode(result.pdf, filePath);
    await Files.findOneAndUpdate(
      { email: req.user.email },
      { email: req.user.email, $addToSet: { files: {...req.file, loading: 'processed'} } },
      { upsert: true, new: true }
    ).exec();

    res.json({ file: req.file, success: true });
    res.status(200);

  } catch (err) {
    next(err);
  }
}

const getProcessedFiles = async (req, res, next) => {
  try {
    const processedFiles = await Files.findOne(
      { email: req.user.email },
      'email files',
      { _id: 0, __v: 0 }
    ).exec();

    res.status(200);
    const newFiles = processedFiles ? processedFiles.toObject() : {};
    const response = {...newFiles, success: true };
    res.json(response);
  } catch (err) {
    next(err);
  }
};

const deleteProcessedFile = async (req, res, next) => {
  try {
    const { filename } = req.body;
    console.log('>>> ', filename);
    await Files.updateOne(
      { email: req.user.email},
      { $pull: { 'files': { loading: 'processed', filename } } },
      { _id: 0, __v: 0 }
    ).exec();

    const filePath = path.join(__dirname, '../..', 'uploads', filename);

    fs.unlinkSync(filePath);
    res.status(200);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  sendFiles,
  downloadFile,
  getProcessedFiles,
  processFile,
  deleteProcessedFile
};
