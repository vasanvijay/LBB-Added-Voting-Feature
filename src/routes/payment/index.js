const express = require("express");
const paymentCtrl = require("../../api/payment/payment.controller");
const Joi = require("joi");
const router = express.Router(); // eslint-disable-line new-cap
const { validate } = require("../../middlewares");
const passport = require("passport");


router.post("/pay",  paymentCtrl.pay);

module.exports = router;
