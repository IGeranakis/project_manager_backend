const express = require('express');
const router = express.Router();
const controller = require('../controllers/queries');

// Routes

// Team-level project summary
router.get('/summary', controller.getTeamProjectsSummary);
router.get('/user-project-hours',controller.getUserDurationsForProject);
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
router.get('/users-overview-project-timelogs', controller.getUserProjectTimeLogs);

//project overview: name duration allias enabled
router.get('/projects-overview',controller.getProjectsOverviewByDateAndStatus);

router.get('/timesheets/total-logged-hours', controller.getTotalLoggedHours);
router.get('/timesheets/previous-logged-hours', controller.getPreviousPeriodLoggedHours);
router.get('/timesheets/project-duration', controller.getAllProjectDurationsInPeriod);
router.get('/timesheets/user-project-hours', controller.getUserProjectDurationsInPeriod);
router.get('/timesheets/user-submission-frequency', controller.getUserSubmissionFrequency);

router.get('/timesheets/project-users-hours', controller.getUsersForProjectWithHours);

router.get('/users/active-count', controller.getTotalActiveUsers);
router.get('/projects/active-count', controller.getTotalActiveProjects);
router.get('/projects/total-users', controller.getTotalUsersInProject);
router.get('/users/dayoff-hourly-rates', controller.getDayoffUsersWithRate);

router.patch('/users/update-hourly-rate', controller.updateKimaiDaysOff)
router.get('/project-users-hourly-costs', controller.getProjectUsersWithHourlyRate);
router.get('/timesheets/project-total-cost', controller.getTotalProjectCost);
router.get('/projects/budget', controller.getProjectBudget);
router.get('/project-users-monthly-costs', controller.getMonthlyCostsPerUser);
router.get('/project-users-monthly-hours', controller.getProjectUsersMonthlyHours);





module.exports = router;
