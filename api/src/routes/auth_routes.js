
const express = require("express");
const router = express.Router();
const { cadastro, login } = require("../controllers/auth_controller");

router.post("/cadastro", cadastro);
router.post("/login", login);

module.exports = router;
