import { Router } from "express";
import {
  teamRegister,
  teamLogin,
  getCurrentTeam,
  teamLogout
} from "../../controllers/team/user.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.post("/team_register", teamRegister);
router.post("/team_login", teamLogin);
router.post("/team_logout", teamLogout);

// Protected route
router.get("/team", verifyJWT, getCurrentTeam);

export default router;