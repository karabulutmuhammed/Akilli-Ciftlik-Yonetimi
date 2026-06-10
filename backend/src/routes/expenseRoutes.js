const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const controller = require("../controllers/expenseController");
router.use(auth);
router.get("/", controller.list);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);
module.exports = router;
