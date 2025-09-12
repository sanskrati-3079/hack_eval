const express = require("express");
const router = express.Router();
const Team = require("../models/Team");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/submissions";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /ppt|pptx|zip|rar/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only specific file types are allowed"));
    }
  },
});

// Get team submissions
router.get("/team/:teamId", async (req, res) => {
  try {
    const team = await Team.findOne({ teamId: req.params.teamId });
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.json(team.submissions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Upload submission files
router.post(
  "/upload/:teamId/:round",
  upload.array("files", 10),
  async (req, res) => {
    try {
      const team = await Team.findOne({ teamId: req.params.teamId });
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const round = req.params.round;
      const validRounds = ["IST", "Round 1", "Round 2"];

      if (!validRounds.includes(round)) {
        return res.status(400).json({ message: "Invalid round" });
      }

      // Check if submission already exists for this round
      let submission = team.submissions.find((sub) => sub.round === round);

      if (!submission) {
        submission = {
          round: round,
          files: [],
          status: "uploaded",
          submittedAt: new Date(),
        };
        team.submissions.push(submission);
      } else {
        // Update existing submission
        submission.files = [];
        submission.status = "uploaded";
        submission.submittedAt = new Date();
      }

      // Add uploaded files
      req.files.forEach((file) => {
        submission.files.push({
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          uploadedAt: new Date(),
        });
      });

      team.lastActivity = new Date();
      await team.save();

      // Emit real-time update
      const io = req.app.get("io");
      io.to(`team-${team._id}`).emit("submission-uploaded", {
        team,
        submission,
      });

      res.json({
        message: "Files uploaded successfully",
        submission: submission,
        filesCount: req.files.length,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
);

// Download submission file
router.get("/download/:teamId/:round/:filename", async (req, res) => {
  try {
    const team = await Team.findOne({ teamId: req.params.teamId });
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const submission = team.submissions.find(
      (sub) => sub.round === req.params.round,
    );
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const file = submission.files.find(
      (f) => f.filename === req.params.filename,
    );
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const filePath = path.join(
      __dirname,
      "../uploads/submissions",
      file.filename,
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found on server" });
    }

    res.download(filePath, file.originalName);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update submission status (for judges/admins)
router.put("/status/:teamId/:round", async (req, res) => {
  try {
    const { status, feedback, score } = req.body;

    const team = await Team.findOne({ teamId: req.params.teamId });
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const submission = team.submissions.find(
      (sub) => sub.round === req.params.round,
    );
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    submission.status = status;
    if (feedback) submission.feedback = feedback;
    if (score !== undefined) submission.score = score;

    // Update team total score
    const totalScore = team.submissions
      .filter((sub) => sub.score !== undefined)
      .reduce((sum, sub) => sum + sub.score, 0);

    team.totalScore = totalScore;
    await team.save();

    // Emit real-time update
    const io = req.app.get("io");
    io.to(`team-${team._id}`).emit("submission-status-updated", {
      team,
      submission,
    });

    res.json({
      message: "Submission status updated",
      submission: submission,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete submission file
router.delete("/file/:teamId/:round/:filename", async (req, res) => {
  try {
    const team = await Team.findOne({ teamId: req.params.teamId });
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const submission = team.submissions.find(
      (sub) => sub.round === req.params.round,
    );
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const fileIndex = submission.files.findIndex(
      (f) => f.filename === req.params.filename,
    );
    if (fileIndex === -1) {
      return res.status(404).json({ message: "File not found" });
    }

    // Remove file from filesystem
    const filePath = path.join(
      __dirname,
      "../uploads/submissions",
      req.params.filename,
    );
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove file from database
    submission.files.splice(fileIndex, 1);

    if (submission.files.length === 0) {
      submission.status = "pending";
    }

    await team.save();

    // Emit real-time update
    const io = req.app.get("io");
    io.to(`team-${team._id}`).emit("submission-file-deleted", {
      team,
      submission,
    });

    res.json({
      message: "File deleted successfully",
      submission: submission,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get submission statistics
router.get("/stats", async (req, res) => {
  try {
    const teams = await Team.find({ isActive: true });

    const stats = {
      totalSubmissions: 0,
      submissionsByRound: {
        IST: {
          total: 0,
          uploaded: 0,
          reviewed: 0,
          qualified: 0,
          notQualified: 0,
        },
        "Round 1": {
          total: 0,
          uploaded: 0,
          reviewed: 0,
          qualified: 0,
          notQualified: 0,
        },
        "Round 2": {
          total: 0,
          uploaded: 0,
          reviewed: 0,
          qualified: 0,
          notQualified: 0,
        },
      },
      submissionsByCategory: {},
      averageFilesPerSubmission: 0,
    };

    let totalFiles = 0;

    teams.forEach((team) => {
      team.submissions.forEach((submission) => {
        stats.totalSubmissions++;
        totalFiles += submission.files.length;

        const round = submission.round;
        stats.submissionsByRound[round].total++;
        stats.submissionsByRound[round][submission.status]++;

        if (!stats.submissionsByCategory[team.category]) {
          stats.submissionsByCategory[team.category] = 0;
        }
        stats.submissionsByCategory[team.category]++;
      });
    });

    stats.averageFilesPerSubmission =
      stats.totalSubmissions > 0 ? totalFiles / stats.totalSubmissions : 0;

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
