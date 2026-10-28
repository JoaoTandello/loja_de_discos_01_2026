const express = require("express");
const router = express.Router();
const { movimentarEstoque } = require("../controllers/movi_controller");

router.post("/adicionar", movimentarEstoque);

module.exports = router;