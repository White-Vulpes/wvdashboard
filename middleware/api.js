const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const hasura = require("../helpers/hasura");
const jwtHelper = require("../helpers/jwt");
const aws = require("../helpers/s3-client");
var _ = require("lodash");
const { v4: uuidv4 } = require("uuid");
const { AppError, ErrorTypes } = require("../types/errors");

const api = {
  login: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const result = await hasura.fetchAdminQueries(
        `query MyQuery($email: String = "") {
          auth(where: {email: {_eq: $email}}) {
            email
            hash_password
            id
            name
          }
        }`,
        {
          email: req.body.email,
        }
      );

      if (result.errors)
        throw new AppError(ErrorTypes.DATABASE_ERROR, result.errors[0].message);
      else if (result.data.auth.length > 0) {
        let token = "";
        (await bcrypt.compare(
          req.body.password,
          result.data.auth[0].hash_password
        ))
          ? ((token = jwtHelper.createToken({
              id: result.data.auth[0].id,
              email: result.data.auth[0].email,
              name: result.data.auth[0].name,
              "x-hasura-default-role": "user",
              "x-hasura-allowed-roles": ["user"],
              "X-Hasura-User-Id": result.data.auth[0].id,
            })),
            res.status(200).json({ token: token, success: true }))
          : (() => {
              throw new AppError(
                ErrorTypes.AUTHENTICATION_ERROR,
                "User Not Authorized"
              );
            })();
      }
    } catch (error) {
      error instanceof AppError
        ? error.sendResponse(res)
        : (() => {
            throw new AppError(
              ErrorTypes.SERVER_ERROR,
              "Internal Server Error"
            ).sendResponse(res);
          })();
    }
  },

  signup: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const result = await hasura.fetchAdminQueries(
        `mutation MyMutation($email: String = "", $hash_password: String = "", $name: String = "") {
            insert_auth(objects: {email: $email, hash_password: $hash_password, name: $name}) {
              affected_rows
              returning {
                id
              }
            }
          }`,
        {
          email: req.body.email,
          hash_password: bcrypt.hashSync(req.body.password, 10),
          name: req.body.name,
        }
      );

      if (result.errors)
        throw new AppError(ErrorTypes.DATABASE_ERROR, result.errors[0].message);
      else if (result.data.insert_auth.affected_rows > 0) {
        let token = "";
        token = jwtHelper.createToken({
          id: result.data.insert_auth.returning[0].id,
          email: req.body.email,
          name: req.body.name,
          "x-hasura-default-role": "user",
          "x-hasura-allowed-roles": ["user"],
          "x-hasura-user-id": result.data.insert_auth.returning[0].id,
        });
        res.status(200).json({ token: token, success: true });
      }
    } catch (error) {
      error instanceof AppError
        ? error.sendResponse(res)
        : (() => {
            throw new AppError(
              ErrorTypes.SERVER_ERROR,
              "Internal Server Error"
            ).sendResponse(res);
          })();
    }
  },

  getDashboard: async (req, res) => {
    try {
      const result = await hasura.fetchAdminQueries(
        `query MyQuery($id: uuid = "", $notifications_limit: Int = 10) {
          website(where: {id: {_eq: $id}}) {
            url
            plan_type
            website_dashboards {
              nav_path
              nav {
                id
                components
              }
            }
            notifications(limit: $notifications_limit) {
              id
              heading
              sub_heading
              logo
              unread
              created_at
            }
          }
        }`,
        {
          id: req.body.website_id,
          notifications_limit: 10,
        }
      );
      if (result.errors)
        throw new AppError(ErrorTypes.DATABASE_ERROR, result.errors[0].message);
      else if (result.data.website.length > 0) {
        let notifications = result.data.website[0].notifications;
        let website_dashboards = result.data.website[0].website_dashboards;
        res.status(200).json({
          plan_type: result.data.website[0].plan_type,
          url: result.data.website[0].url,
          dashboards: website_dashboards,
          notifications: notifications,
        });
      } else {
        throw new AppError(
          ErrorTypes.SERVICE_UNAVAILABLE,
          "No Components Defined"
        );
      }
    } catch (error) {
      error instanceof AppError
        ? error.sendResponse(res)
        : (() => {
            throw new AppError(
              ErrorTypes.SERVER_ERROR,
              "Internal Server Error"
            ).sendResponse(res);
          })();
    }
  },
  deleteThumbnails: async (req, res, next) => {
    try {
      const result = await aws.deleteMultipleFiles(
        "polaroidfiles",
        _.map(
          req.body.images,
          (i) => `THUMBNAIL/${i.category}_THUMBNAIL_${i.name}`
        )
      );
      next();
    } catch (error) {
      error instanceof AppError
        ? error.sendResponse(res)
        : (() => {
            throw new AppError(
              ErrorTypes.SERVER_ERROR,
              "Internal Server Error"
            ).sendResponse(res);
          })();
    }
  },
  deleteImages: async (req, res, next) => {
    try {
      const result = await aws.deleteMultipleFiles(
        "polaroidfiles",
        _.map(req.body.images, (i) => `${i.category}/${i.name}`)
      );
      req.body.affected_rows = result;
      next();
    } catch (error) {
      error instanceof AppError
        ? error.sendResponse(res)
        : (() => {
            throw new AppError(
              ErrorTypes.SERVER_ERROR,
              "Internal Server Error"
            ).sendResponse(res);
          })();
    }
  },

  deleteImagesDB: async (req, res) => {
    try {
      const result = await hasura.fetchAdminQueries(
        `mutation MyMutation($id: [uuid!] = "") {
        delete_images(where: {id: {_in: $id}}) {
          affected_rows
        }
      }`,
        {
          id: _.map(req.body.images, "id"),
        }
      );

      if (result.errors)
        res.status(500).json({
          errors: [
            {
              message: "Server Error",
            },
          ],
        });
      else if (result.data.delete_images.affected_rows > 0) {
        res.status(200).json({
          affected_rows: result.data.delete_images.affected_rows,
          anomaly: Math.abs(
            result.data.delete_images.affected_rows - req.body.affected_rows
          ),
        });
      } else throw new AppError(ErrorTypes.DATABASE_ERROR, "No Fields Found");
    } catch (error) {
      error instanceof AppError
        ? error.sendResponse(res)
        : (() => {
            throw new AppError(
              ErrorTypes.SERVER_ERROR,
              "Internal Server Error"
            ).sendResponse(res);
          })();
    }
  },
};

module.exports = api;
