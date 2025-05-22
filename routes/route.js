const express = require('express');
const router = express.Router();
const controller = require('../controllers/queries');

// Routes

// Team-level project summary
router.get('/summary', controller.getTeamProjectsSummary);

// Detailed stats for a specific project/team combination
router.get('/project/:projectId/team/:teamId', controller.getProjectTeamUserStats);

// Duration summaries by user over a date range
router.get('/durations', controller.getUserDurations);

// Hourly rate + time tracking per user/project over time range and filter
router.get('/hourly-stats', controller.getProjectUserHourlyRate);

// Time log entries per user and project
router.get('/timelogs', controller.getProjectUserTimeLogs);

// List of all users (alias + ID)
router.get('/users', controller.getUsers);

// Activity breakdown (Normal/Sick/Educational) by user
router.get('/activity-categories', controller.getActivityCategories);

// Time off (days off and user metadata)
router.get('/daysoff', controller.getUserDaysoff);
router.get('/users-overview', controller.getUsersOverview);

module.exports = router;
