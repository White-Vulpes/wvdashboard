const sharp = require("sharp");

const utils = {
  dataURItoBuffer: (dataURI) => {
    const base64Data = dataURI.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");
    return buffer;
  },

  resizeImage: async (imgBuffer) => {
    const { width, height } = await sharp(imgBuffer).metadata();
    const resizedBuffer = await sharp(imgBuffer)
      .resize(Math.trunc(width / 9), Math.trunc(height / 9))
      .jpeg({ quality: 90 })
      .toBuffer();
    return resizedBuffer;
  },
};

module.exports = utils;
