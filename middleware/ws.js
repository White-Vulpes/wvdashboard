const auth = require("./auth");
const hasura = require("../helpers/hasura");
const aws = require("../helpers/s3-client");
const utils = require("../helpers/utils");
const sharp = require("sharp");

const wsapi = {
  upload: async (ws, req) => {
    let progress = 0;
    let totalProgress = 0;

    ws.on("message", async (msg) => {
      try {
        // if (!auth.checkAuthWs(ws, req)) return;

        const file = JSON.parse(msg);
        const [category, filename] = file.key.split("/");
        const imageBuffer = utils.dataURItoBuffer(file.content);
        const { width, height } = await sharp(imageBuffer).metadata();
        const thumbnailBuffer = await utils.resizeImage(imageBuffer);
        const { width: widthThumb, height: heightThumb } = await sharp(
          thumbnailBuffer
        ).metadata();

        totalProgress =
          Buffer.byteLength(imageBuffer) + Buffer.byteLength(thumbnailBuffer);

        const upload = await aws.createFile(
          file.bucketName,
          file.key,
          imageBuffer,
          file.type,
          { width: width.toString(), height: height.toString() }
        );
        const uploadThumb = await aws.createFile(
          file.bucketName,
          `THUMBNAIL/${category}_THUMBNAIL_${filename}`,
          thumbnailBuffer,
          file.type,
          { width: widthThumb.toString(), height: heightThumb.toString() }
        );

        upload.on("httpUploadProgress", (progressData) => {
          progress += progressData.loaded;
          ws.send(JSON.stringify({ loaded: progress, total: totalProgress }));
        });
        uploadThumb.on("httpUploadProgress", (progressData) => {
          progress += progressData.loaded;
          ws.send(JSON.stringify({ loaded: progress, total: totalProgress }));
        });

        const response = await hasura.fetchAdminQueries(
          `mutation MyMutation($objects: [images_insert_input!] = {}) {
                        insert_images(objects: $objects) {
                            affected_rows
                        }
                    }`,
          {
            objects: [
              {
                name: filename,
                category: category,
                url: `${process.env.AWS_CLOUDFRONT_URL}THUMBNAIL/${category}_THUMBNAIL_${filename}`,
                website_id: file.website_id,
              },
            ],
          }
        );
        if (response.errors) {
          ws.send(JSON.stringify({ error: "Upload failed" }));
          ws.close();
        } else if (response.data.insert_images.affected_rows > 0) {
          await upload.done();
          await uploadThumb.done();
          ws.send(JSON.stringify({ message: "Upload Successful" }));
        } else {
          ws.send(JSON.stringify({ error: "Upload failed" }));
          ws.close();
        }
      } catch (error) {
        console.error("Upload error:", error);
        ws.send(JSON.stringify({ error: "Upload failed" }));
        ws.close();
      }
    });

    ws.on("open", () => console.log("Connection established"));
    ws.on("close", () => console.log("WebSocket was closed"));
  },
};

module.exports = wsapi;
