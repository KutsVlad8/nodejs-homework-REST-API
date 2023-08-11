const express = require("express");
const ctrl = require("../../controllers/contacts");

const router = express.Router();

router.get("/", ctrl.getAll);

router.get("/:contactId", ctrl.getContactById);

router.post("/", ctrl.create);

router.put("/:contactId", ctrl.updadeContact);

router.delete("/:contactId", ctrl.remove);

module.exports = router;
