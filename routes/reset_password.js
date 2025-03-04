const { User } = require("../models/User");
const router = require("express").Router();
const resetPasswordController = require("../controllers/resetPasswordController");

/**
 * @api {post} /forget_password Post/ forget_password
 * @apiName postForgetPassword
 * @apiGroup Forget-password Router
 * @apiVersion 1.0.0
 * @apiSuccess {String} message Reset Password email is sent successfully
 * @apiError (Error 500) internalServerError Error occured during the process from the server
 * @apiError (Error 404) UserNotFound Error occures if the user was deleted from the database
 * @apiBody {String} email The email of the user
 * @apiSampleRequest http://127.0.0.1:4000/api/forget_password
 */
router.post("/forget_password", resetPasswordController.postForgetPassword);

/**
 * @api {post} /reset Post/ reset
 * @apiName postResetPassword
 * @apiGroup Reset-password Router
 * @apiVersion 1.0.0
 * @apiSuccess {String} message Reset Password Success
 * @apiError (Error 500) internalServerError Error occured during the process from the server
 * @apiError (Error 400) valdiationError Something wrong with the body of the request
 * @apiBody {String} password The password of the user
 * @apiSampleRequest http://127.0.0.1:4000/api/reset
 */
router.post("/reset", resetPasswordController.postResetPassword);

module.exports = router;
