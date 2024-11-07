const sharp = require("sharp");

const utils = {
  dataURItoBuffer: (dataURI) => {
    try {
      const base64Data = dataURI.split(",")[1];
      const buffer = Buffer.from(base64Data, "base64");
      return buffer;
    } catch (e) {
      slack.sendErrorMessage(error, "utils.dataURItoBuffer", PRIORITY.HIGH);
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
      slack.sendErrorMessage(error, "utils.resizeImage", PRIORITY.HIGH);
    }
  },
};

module.exports = utils;
