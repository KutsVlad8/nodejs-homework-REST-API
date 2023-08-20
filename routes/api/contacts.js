const express = require("express");

const ctrl = require("../../controllers/contacts");

const { isValidId, authenticate } = require("../../middlewares");

const router = express.Router();

router.get("/", authenticate, ctrl.getAll);

router.get("/:contactId", authenticate, isValidId, ctrl.getContactById);

router.post("/", authenticate, ctrl.create);

router.put("/:contactId", authenticate, isValidId, ctrl.updateContact);

router.patch(
  "/:contactId/favorite",
  authenticate,
  isValidId,
  ctrl.updateFavorite
);

router.delete("/:contactId", authenticate, isValidId, ctrl.remove);

module.exports = router;
