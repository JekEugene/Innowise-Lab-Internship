"use strict";
exports.__esModule = true;
exports.middleware = void 0;
var multer_1 = require("multer");
var cors_1 = require("cors");
var cookie_parser_1 = require("cookie-parser");
var path_1 = require("path");
var swagger_jsdoc_1 = require("swagger-jsdoc");
var swagger_ui_express_1 = require("swagger-ui-express");
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function middleware(app, express) {
    app.use(express.json());
    var corsOptions = {
        origin: "http://localhost:8080",
        methods: ["GET", "PUT", "POST", "PATCH", "DELETE", "OPTIONS"],
        optionsSuccessStatus: 204,
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Access-Control-Allow-Origin", "Origin", "Accept"]
    };
    app.use(cors_1["default"](corsOptions));
    app.use(cookie_parser_1["default"]());
    var storageConfig = multer_1["default"].diskStorage({
        destination: function (req, file, cb) {
            cb(null, "../client/static/videos");
        },
        filename: function (req, file, cb) {
            req.body.link = "VIDEO-" + Date.now() + path_1["default"].extname(file.originalname);
            cb(null, req.body.link);
        }
    });
    var fileFilter = function (req, file, cb) {
        console.log("hi");
        var videoTypes = ["video/mpeg", "video/mp4", "video/ogg", "video/quicktime",
            "video/webm", "video/x-ms-wmv", "video/x-flv", "video/x-msvideo", "video/3gpp", "video/3gpp2"];
        if (videoTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(null, false);
        }
    };
    app.use(express.static(__dirname));
    app.use(multer_1["default"]({ storage: storageConfig, fileFilter: fileFilter }).single("filedata"));
    var swaggerOptions = {
        swaggerDefinition: {
            info: {
                title: "Video Gallery API",
                version: "1.0.1"
            }
        },
        apis: ["./src/modules/video/video.controller.ts", "./src/modules/auth/authentication.controller.ts",
            "./src/modules/user/user.controller.ts",
        ]
    };
    var swaggerDocs = swagger_jsdoc_1["default"](swaggerOptions);
    app.use("/api-docs", swagger_ui_express_1["default"].serve, swagger_ui_express_1["default"].setup(swaggerDocs));
}
exports.middleware = middleware;
