const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { askAssistant } = require("../controllers/assistantController");

router.use(auth);

router.post("/ask", askAssistant);

module.exports = router;