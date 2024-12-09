const sharp = require("sharp");
const { slack, PRIORITY } = require("./slack");
const { AppError, ErrorTypes } = require("../types/errors");

const utils = {
  dataURItoBuffer: (dataURI) => {
    try {
      const base64Data = dataURI.split(",")[1];
      const buffer = Buffer.from(base64Data, "base64");
      return buffer;
    } catch (e) {
      slack.sendErrorMessage(e, "utils.dataURItoBuffer", PRIORITY.HIGH);
      throw new AppError(ErrorTypes.SERVER_ERROR, "Internal Server Error");
    }
  },

  resizeImage: async (imgBuffer) => {
    try {
      const { width, height } = await sharp(imgBuffer).metadata();
      const resizedBuffer = await sharp(imgBuffer)
        .resize(Math.trunc(width / 9), Math.trunc(height / 9))
        .jpeg({ quality: 90 })
        .toBuffer();
      return resizedBuffer;
    } catch (e) {
      slack.sendErrorMessage(e, "utils.resizeImage", PRIORITY.HIGH);
      throw new AppError(ErrorTypes.SERVER_ERROR, "Internal Service Error");
    }
  },
};

module.exports = utils;
