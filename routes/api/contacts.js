const express = require("express");

const ctrl = require("../../controllers/contacts");

const isValidId = require("../../middlewares/isValidId");

const router = express.Router();

router.get("/", ctrl.getAll);

router.get("/:contactId", isValidId, ctrl.getContactById);

router.post("/", ctrl.create);

router.put("/:contactId", isValidId, ctrl.updateContact);

router.patch("/:contactId/favorite", isValidId, ctrl.updateFavorite);

router.delete("/:contactId", isValidId, ctrl.remove);

module.exports = router;
