const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const requireRole = require("../middleware/requireRole");
const controller = require("../controllers/adminController");

router.use(auth, requireRole("ADMIN"));
router.get("/users", controller.listUsers);
router.post("/users", controller.createUser);
router.put("/users/:id/role", controller.updateUserRole);
router.delete("/users/:id", controller.deleteUser);

module.exports = router;
