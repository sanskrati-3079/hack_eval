import { Router } from "express";
import {
  submitEvaluation,
  saveDraft,
  getEvaluation,
  getJudgeEvaluations
} from "../../controllers/judge/teamEvaluation.controller.js";
import { verifyJWTJudge } from "../../middlewares/judgeAuth.middleware.js";

const router = Router();

// Apply judge authentication middleware to all routes
router.use(verifyJWTJudge);

// IMPORTANT: Static routes MUST come before dynamic routes
router.route("/my-evaluations").get(getJudgeEvaluations);
router.route("/submit").post(submitEvaluation);
router.route("/save-draft").post(saveDraft);
router.route("/:teamId").get(getEvaluation); 

export default router;
