const db = require("../config/db")

// Controller to get team project summaries
const getTeamProjectsSummary = async (req, res) => {
  try {
    const [results] = await db.execute(`
      SELECT kimai2_teams.name AS team_name,
             kimai2_users_teams.user_id,
             kimai2_users_teams.team_id,
             kimai2_users_teams.teamlead,
             kimai2_projects_teams.project_id,
             kimai2_users.alias AS username,
             kimai2_projects.name AS project_name,
             kimai2_projects.visible AS active,
             kimai2_projects.time_budget,
             kimai2_projects.start AS start_date,
             kimai2_projects.end AS end_date,
             (
               SELECT SUM(kimai2_timesheet.duration)
               FROM kimai2_timesheet
               WHERE kimai2_timesheet.project_id = kimai2_projects.id
             ) AS duration
      FROM kimai2_teams
      INNER JOIN kimai2_users_teams ON kimai2_teams.id = kimai2_users_teams.team_id
      INNER JOIN kimai2_projects_teams ON kimai2_projects_teams.team_id = kimai2_teams.id
      INNER JOIN kimai2_users ON kimai2_users_teams.user_id = kimai2_users.id
      INNER JOIN kimai2_projects ON kimai2_projects_teams.project_id = kimai2_projects.id
      WHERE kimai2_users_teams.teamlead = 1
    `);

    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching team project summary:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getProjectTeamUserStats = async (req, res) => {
  const { projectId, teamId } = req.params;
  try {
    const [results] = await db.execute(`
      SELECT kimai2_projects_teams.*, kimai2_projects.name, kimai2_projects.visible,
             kimai2_projects.time_budget, kimai2_projects.budget,
             kimai2_users_teams.user_id, kimai2_users_teams.teamlead,
             (
               SELECT SUM(kimai2_timesheet.duration)
               FROM kimai2_timesheet
               WHERE kimai2_timesheet.user = kimai2_users_teams.user_id
                 AND kimai2_timesheet.project_id = kimai2_projects_teams.project_id
             ) AS duration,
             kimai2_users.alias AS username, kimai2_teams.name AS team_name
      FROM kimai2_projects_teams
      INNER JOIN kimai2_projects ON kimai2_projects.id = kimai2_projects_teams.project_id
      INNER JOIN kimai2_users_teams ON kimai2_users_teams.team_id = kimai2_projects_teams.team_id
      INNER JOIN kimai2_timesheet ON kimai2_timesheet.user = kimai2_users_teams.user_id
         AND kimai2_timesheet.project_id = kimai2_projects_teams.project_id
      INNER JOIN kimai2_users ON kimai2_users.id = kimai2_users_teams.user_id
      INNER JOIN kimai2_teams ON kimai2_teams.id = kimai2_projects_teams.team_id
      WHERE kimai2_projects_teams.project_id = ? AND kimai2_projects_teams.team_id = ?
      GROUP BY kimai2_users_teams.user_id
    `, [projectId, teamId]);

    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching project team user stats:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getUserDurations = async (req, res) => {
  const { startdate, enddate } = req.query;
  try {
    const [results] = await db.execute(`
      SELECT kimai2_users.alias, SUM(kimai2_timesheet.duration) as duration
      FROM kimai2_timesheet
      INNER JOIN kimai2_users ON kimai2_users.id = kimai2_timesheet.user
      WHERE DATE(start_time) >= ? AND DATE(start_time) <= ?
      GROUP BY kimai2_users.alias
    `, [startdate, enddate]);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching user durations:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getProjectUserHourlyRate = async (req, res) => {
  const { startdate, enddate, filterCondition } = req.query;
  try {
    const [results] = await db.execute(`
      SELECT kimai2_projects.name, kimai2_users.alias, kimai2_users.enabled,
             SUM(kimai2_timesheet.duration) as duration,
             MIN(kimai2_timesheet.start_time) as startime,
             MAX(kimai2_timesheet.start_time) as lasttime,
             kimai2_projects.visible,
             kimai2_user_preferences.name as rate,
             kimai2_user_preferences.value
      FROM kimai2_timesheet
      INNER JOIN kimai2_users ON kimai2_users.id = kimai2_timesheet.user
      INNER JOIN kimai2_projects ON kimai2_projects.id = kimai2_timesheet.project_id
      INNER JOIN kimai2_user_preferences ON kimai2_users.id = kimai2_user_preferences.user_id
      WHERE DATE(start_time) >= ? AND DATE(start_time) <= ?
        AND kimai2_user_preferences.name = 'hourly_rate'
        AND (${filterCondition})
      GROUP BY kimai2_users.alias, kimai2_projects.name, kimai2_projects.visible,
               kimai2_user_preferences.name, kimai2_user_preferences.value, kimai2_users.enabled
    `, [startdate, enddate]);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching project user hourly rate:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getProjectUserTimeLogs = async (req, res) => {
  const { alias, projectName } = req.query;
  try {
    const [results] = await db.execute(`
      SELECT kimai2_users.alias, kimai2_projects.name,
             kimai2_timesheet.start_time, kimai2_timesheet.duration
      FROM kimai2_timesheet
      INNER JOIN kimai2_users ON kimai2_users.id = kimai2_timesheet.user
      INNER JOIN kimai2_projects ON kimai2_projects.id = kimai2_timesheet.project_id
      WHERE kimai2_users.alias = ? AND kimai2_projects.name = ?
    `, [alias, projectName]);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching project user time logs:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getUsers = async (req, res) => {
  try {
    const [results] = await db.execute(`
      SELECT kimai2_users.id, kimai2_users.alias as name FROM kimai2_users
    `);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getActivityCategories = async (req, res) => {
  const { userId } = req.query;
  try {
    const [results] = await db.execute(`
      SELECT start_time,
             CASE
               WHEN activity_id = 4 THEN 'Normal'
               WHEN activity_id = 115 THEN 'Sick'
               WHEN activity_id = 116 THEN 'Educational'
               ELSE 'Other'
             END AS category
      FROM kimai2_timesheet
      WHERE (activity_id IN (4, 115, 116)) AND user = ?
    `, [userId]);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching activity categories:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getUserDaysoff = async (req, res) => {
  const { userId } = req.query;
  try {
    const [results] = await db.execute(`
      SELECT kimai2_daysoff.total_daysoff, kimai2_daysoff.user_id,
             kimai2_users.alias, kimai2_users.avatar
      FROM kimai2_daysoff
      INNER JOIN kimai2_users ON kimai2_users.id = kimai2_daysoff.user_id
      WHERE kimai2_daysoff.user_id = ?
    `, [userId]);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching user daysoff:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getUsersOverview = async (req, res) => {
  const { startdate, enddate, filter } = req.query;

  if (!startdate || !enddate || !filter) {
    return res.status(400).json({ error: 'Missing startdate, enddate or filter' });
  }

  const filterMap = {
    Active: 1,
    Inactive: 0,
    Total: 'All'
  };

  const selectedFilterValue = filterMap[filter] ?? 'All';

  const baseQuery = `
    SELECT kimai2_projects.name, kimai2_users.alias, kimai2_users.enabled,
           SUM(kimai2_timesheet.duration) as duration,
           MIN(kimai2_timesheet.start_time) as startime,
           MAX(kimai2_timesheet.start_time) as lasttime,
           kimai2_projects.visible,
           kimai2_user_preferences.name as rate,
           kimai2_user_preferences.value
    FROM kimai2_timesheet
    INNER JOIN kimai2_users ON kimai2_users.id = kimai2_timesheet.user
    INNER JOIN kimai2_projects ON kimai2_projects.id = kimai2_timesheet.project_id
    INNER JOIN kimai2_user_preferences ON kimai2_users.id = kimai2_user_preferences.user_id
    WHERE DATE(start_time) >= ? AND DATE(start_time) <= ?
      AND kimai2_user_preferences.name = 'hourly_rate'
      ${selectedFilterValue !== 'All' ? 'AND kimai2_projects.visible = ?' : ''}
    GROUP BY kimai2_users.alias, kimai2_projects.name, kimai2_projects.visible,
             kimai2_user_preferences.name, kimai2_user_preferences.value, kimai2_users.enabled
  `;

  const params = [startdate, enddate];
  if (selectedFilterValue !== 'All') {
    params.push(selectedFilterValue);
  }

  try {
    const [results] = await db.execute(baseQuery, params);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching users overview:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getUserProjectTimeLogs = async (req, res) => {
  const { alias, project } = req.query;

  if (!alias || !project) {
    return res.status(400).json({ error: 'Missing alias or project name' });
  }

  try {
    const [results] = await db.execute(`
      SELECT kimai2_users.alias, kimai2_projects.name, kimai2_timesheet.start_time, kimai2_timesheet.duration
      FROM kimai2_timesheet
      INNER JOIN kimai2_users ON kimai2_users.id = kimai2_timesheet.user
      INNER JOIN kimai2_projects ON kimai2_projects.id = kimai2_timesheet.project_id
      WHERE kimai2_users.alias = ? AND kimai2_projects.name = ?
    `, [alias, project]);

    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching project time logs:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getProjectsOverviewByDateAndStatus = async (req, res) => {
  const { startdate, enddate, filter } = req.query;

  if (!startdate || !enddate || !filter) {
    return res.status(400).json({ error: 'Missing startdate, enddate or filter' });
  }

  const filterMap = {
    Active: 1,
    Inactive: 0,
    Total: 'All'
  };

  const selectedFilterValue = filterMap[filter] ?? 'All';

  const baseQuery = `
    SELECT 
      kimai2_projects.name AS project_name,
      kimai2_users.alias AS alias,
      kimai2_users.enabled,
      SUM(kimai2_timesheet.duration) AS duration,
      MIN(kimai2_timesheet.start_time) AS starttime,
      MAX(kimai2_timesheet.start_time) AS lasttime
    FROM kimai2_timesheet
    INNER JOIN kimai2_users ON kimai2_users.id = kimai2_timesheet.user
    INNER JOIN kimai2_projects ON kimai2_projects.id = kimai2_timesheet.project_id
    WHERE DATE(kimai2_timesheet.start_time) >= ? 
      AND DATE(kimai2_timesheet.start_time) <= ?
      ${selectedFilterValue !== 'All' ? 'AND kimai2_projects.visible = ?' : ''}
    GROUP BY kimai2_users.alias, kimai2_projects.name, kimai2_users.enabled
    ORDER BY kimai2_projects.name, kimai2_users.alias
  `;

  const params = [startdate, enddate];
  if (selectedFilterValue !== 'All') {
    params.push(selectedFilterValue);
  }

  try {
    const [results] = await db.execute(baseQuery, params);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching project overview:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getTotalLoggedHours = async (req, res) => {
  const { startdate, enddate, filter } = req.query;

  if (!startdate || !enddate || !filter) {
    return res.status(400).json({ error: 'Missing startdate, enddate, or filter' });
  }

  const filterMap = {
    Active: 1,
    Inactive: 0,
    Total: 'All'
  };

  const visibility = filterMap[filter];
  const projectFilterCondition =
    visibility === 'All' ? '1=1' : `kimai2_projects.visible = ${visibility}`;

  try {
    const [results] = await db.execute(`
      SELECT 
        SUM(kimai2_timesheet.duration) AS total_duration
      FROM kimai2_timesheet
      INNER JOIN kimai2_projects ON kimai2_projects.id = kimai2_timesheet.project_id
      WHERE DATE(kimai2_timesheet.start_time) >= ?
        AND DATE(kimai2_timesheet.start_time) <= ?
        AND (${projectFilterCondition})
    `, [startdate, enddate]);

    const duration = results[0].total_duration || 0;
    const hours = Math.floor(duration / 3600);

    res.status(200).json({ hours });
  } catch (error) {
    console.error("Error fetching total logged hours:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getPreviousPeriodLoggedHours = async (req, res) => {
  const { startdate, enddate, filter } = req.query;

  if (!startdate || !enddate || !filter) {
    return res.status(400).json({ error: 'Missing startdate, enddate, or filter' });
  }

  try {
    const start = new Date(startdate);
    const end = new Date(enddate);
    const dayCount = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    const prevEnd = new Date(start);
    prevEnd.setDate(prevEnd.getDate() - 1);

    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevStart.getDate() - dayCount + 1);

    const prevStartStr = prevStart.toISOString().split('T')[0];
    const prevEndStr = prevEnd.toISOString().split('T')[0];

    const filterMap = {
      Active: 1,
      Inactive: 0,
      Total: 'All'
    };

    const visibility = filterMap[filter];
    const projectFilterCondition =
      visibility === 'All' ? '1=1' : `kimai2_projects.visible = ${visibility}`;

    const [results] = await db.execute(`
      SELECT 
        SUM(kimai2_timesheet.duration) AS total_duration
      FROM kimai2_timesheet
      INNER JOIN kimai2_projects ON kimai2_projects.id = kimai2_timesheet.project_id
      WHERE DATE(kimai2_timesheet.start_time) >= ?
        AND DATE(kimai2_timesheet.start_time) <= ?
        AND (${projectFilterCondition})
    `, [prevStartStr, prevEndStr]);

    const duration = results[0].total_duration || 0;
    const hours = Math.floor(duration / 3600);

    res.status(200).json({
      hours,
      prev_start: prevStartStr,
      prev_end: prevEndStr
    });
  } catch (error) {
    console.error("Error fetching previous period logged hours:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllProjectDurationsInPeriod = async (req, res) => {
  const { startdate, enddate, filter } = req.query;

  if (!startdate || !enddate || !filter) {
    return res.status(400).json({ error: 'Missing startdate, enddate, or filter' });
  }

  const filterMap = {
    Active: 1,
    Inactive: 0,
    Total: 'All'
  };

  const visibility = filterMap[filter];
  const projectFilterCondition =
    visibility === 'All' ? '1=1' : `kimai2_projects.visible = ${visibility}`;

  try {
    const [results] = await db.execute(`
      SELECT 
        kimai2_projects.name AS project_name,
        kimai2_projects.visible,
        SUM(kimai2_timesheet.duration) AS total_duration
      FROM kimai2_timesheet
      INNER JOIN kimai2_projects ON kimai2_projects.id = kimai2_timesheet.project_id
      WHERE DATE(kimai2_timesheet.start_time) >= ?
        AND DATE(kimai2_timesheet.start_time) <= ?
        AND (${projectFilterCondition})
      GROUP BY kimai2_projects.name, kimai2_projects.visible
      ORDER BY total_duration DESC
    `, [startdate, enddate]);

    const formatted = results.map(row => ({
      project_name: row.project_name,
      visible: row.visible === 1,
      hours: Math.floor((row.total_duration || 0) / 3600)
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching project durations:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getUserProjectDurationsInPeriod = async (req, res) => {
  const { startdate, enddate } = req.query;

  if (!startdate || !enddate) {
    return res.status(400).json({ error: 'Missing startdate or enddate' });
  }

  try {
    const [results] = await db.execute(`
      SELECT 
        kimai2_users.alias AS username,
        kimai2_projects.name AS project_name,
        SUM(kimai2_timesheet.duration) AS total_duration
      FROM kimai2_timesheet
      INNER JOIN kimai2_users ON kimai2_users.id = kimai2_timesheet.user
      INNER JOIN kimai2_projects ON kimai2_projects.id = kimai2_timesheet.project_id
      WHERE DATE(kimai2_timesheet.start_time) >= ?
        AND DATE(kimai2_timesheet.start_time) <= ?
      GROUP BY kimai2_users.alias, kimai2_projects.name
      ORDER BY kimai2_users.alias, kimai2_projects.name
    `, [startdate, enddate]);

    const formatted = results.map(row => ({
      username: row.username,
      project_name: row.project_name,
      hours: Math.floor((row.total_duration || 0) / 3600)
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching user project durations:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getUserSubmissionFrequency = async (req, res) => {
  const { startdate, enddate } = req.query;

  if (!startdate || !enddate) {
    return res.status(400).json({ error: 'Missing startdate or enddate' });
  }

  try {
    // Only include enabled users
    const [users] = await db.execute(`
      SELECT id, alias FROM kimai2_users
      WHERE alias != 'ADMINISTRATOR' AND enabled = 1
    `);

    const [entries] = await db.execute(`
      SELECT 
        kimai2_timesheet.user AS user_id,
        DATE(kimai2_timesheet.start_time) AS submission_date
      FROM kimai2_timesheet
      WHERE DATE(kimai2_timesheet.start_time) BETWEEN ? AND ?
      GROUP BY kimai2_timesheet.user, DATE(kimai2_timesheet.start_time)
    `, [startdate, enddate]);

    const submissionMap = {};
    entries.forEach(row => {
      if (!submissionMap[row.user_id]) submissionMap[row.user_id] = new Set();
      submissionMap[row.user_id].add(row.submission_date);
    });

    const start = new Date(startdate);
    const end = new Date(enddate);
    const daysInRange = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const result = users.map(user => {
      const submissions = submissionMap[user.id]?.size || 0;
      const avg_gap = submissions > 0 ? (daysInRange / submissions).toFixed(2) : null;

      return {
        username: user.alias,
        submissions,
        days_range: daysInRange,
        avg_gap
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error calculating user submission frequency:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getUsersForProjectWithHours = async (req, res) => {
  const { projectName, startdate, enddate, filter } = req.query;

  if (!projectName || !startdate || !enddate || !filter) {
    console.log("Project Name: ", projectName)
    return res.status(400).json({ error: 'Missing projectName, startdate, enddate or filter' });
  }

  const filterMap = {
    Active: 1,
    Inactive: 0,
    Total: 'All'
  };

  const visibility = filterMap[filter];
  const visibilityCondition =
    visibility === 'All' ? '1=1' : `kimai2_projects.visible = ${visibility}`;

  try {
    const [results] = await db.execute(`
      SELECT 
        kimai2_users.alias AS username,
        SUM(kimai2_timesheet.duration) AS total_duration
      FROM kimai2_timesheet
      INNER JOIN kimai2_users ON kimai2_users.id = kimai2_timesheet.user
      INNER JOIN kimai2_projects ON kimai2_projects.id = kimai2_timesheet.project_id
      WHERE kimai2_projects.name = ?
        AND DATE(kimai2_timesheet.start_time) BETWEEN ? AND ?
        AND (${visibilityCondition})
      GROUP BY kimai2_users.alias
      ORDER BY total_duration DESC
    `, [projectName, startdate, enddate]);

    const formatted = results.map(row => ({
      username: row.username,
      hours: Math.floor((row.total_duration || 0) / 3600)
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching user hours for project:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};










module.exports = {
  getTeamProjectsSummary,
  getProjectTeamUserStats,
  getUserDurations,
  getProjectUserHourlyRate,
  getProjectUserTimeLogs,
  getUsers,
  getActivityCategories,
  getUserDaysoff,
  getUserProjectTimeLogs,
  getUsersOverview,
  getProjectsOverviewByDateAndStatus,
  getTotalLoggedHours,
  getPreviousPeriodLoggedHours,
  getAllProjectDurationsInPeriod,
  getUserProjectDurationsInPeriod,
  getUserSubmissionFrequency,
  getUsersForProjectWithHours
};
