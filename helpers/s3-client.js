const {
  S3Client,
  ListBucketsCommand,
  DeleteObjectCommand,
  ListObjectsCommand,
  DeleteObjectsCommand,
} = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const { AppError, ErrorTypes } = require("../types/errors");
const { NodeHttpHandler } = require("@smithy/node-http-handler");

// TODO Redefine All error

const s3Client = new S3Client({
  region: "eu-north-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  requestHandler: new NodeHttpHandler(),
});

const aws = {
  listBuckets: async () => {
    try {
      const data = await s3Client.send(new ListBucketsCommand({}));
      return data.Buckets;
    } catch (error) {
      slack.sendErrorMessage(error, "aws.listBuckets", PRIORITY.HIGH);
      throw new AppError(ErrorTypes.DATABASE_ERROR, "Error Occured");
    }
  },

  deleteFile: async (bucketName, fileName) => {
    const params = {
      Bucket: bucketName,
      Key: fileName,
    };

    try {
      const data = await s3Client.send(new DeleteObjectCommand(params));
      console.log(
        `File '${fileName}' deleted successfully from bucket '${bucketName}'.`,
        data
      );
    } catch (error) {
      slack.sendErrorMessage(error, "aws.deleteFile", PRIORITY.HIGH);
      throw new AppError(ErrorTypes.DATABASE_ERROR, "Error Occured");
    }
  },

  createFile: async (bucketName, fileName, fileContent, mimeType, metadata) => {
    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: fileContent,
      ContentType: mimeType,
      Metadata: metadata,
    };

    try {
      const upload = new Upload({
        client: s3Client,
        params: params,
      });
      upload.on("error", (err) => {
        console.error("Upload error:", err);
      });
      return upload;
    } catch (error) {
      slack.sendErrorMessage(error, "aws.createFile", PRIORITY.HIGH);
      throw new AppError(ErrorTypes.DATABASE_ERROR, "Error Occured");
    }
  },

  getFiles: async (bucketName) => {
    const params = {
      Bucket: bucketName,
    };

    try {
      const data = await s3Client.send(new ListObjectsCommand(params));
      return data.Contents;
    } catch (error) {
      slack.sendErrorMessage(error, "aws.getFiles", PRIORITY.HIGH);
      throw new AppError(ErrorTypes.DATABASE_ERROR, "Error Occured");
    }
  },

  deleteMultipleFiles: async (bucketName, fileNames) => {
    const params = {
      Bucket: bucketName,
      Delete: {
        Objects: fileNames.map((fileName) => ({ Key: fileName })),
        Quiet: false,
      },
    };

    try {
      const data = await s3Client.send(new DeleteObjectsCommand(params));
      return data.Deleted.length;
    } catch (error) {
      slack.sendErrorMessage(error, "aws.deleteMultipleFiles", PRIORITY.HIGH);
      throw new AppError(ErrorTypes.EXTERNAL_SERVICE_ERROR, "Error Occured");
    }
  },
};

module.exports = aws;
