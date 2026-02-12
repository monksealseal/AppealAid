/**
 * Application Monitoring Utility
 *
 * Provides basic health monitoring and metrics collection.
 */

const logger = require('./logger');

let monitoringInterval = null;

/**
 * Start monitoring the application
 */
function startMonitoring() {
  if (monitoringInterval) {
    return;
  }

  logger.info('Application monitoring started');

  // Log basic metrics every 5 minutes
  monitoringInterval = setInterval(() => {
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();

    logger.info('System metrics', {
      uptime: `${Math.floor(uptime / 60)} minutes`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`
    });
  }, 5 * 60 * 1000);

  // Don't prevent process from exiting
  monitoringInterval.unref();
}

/**
 * Stop monitoring
 */
function stopMonitoring() {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
    logger.info('Application monitoring stopped');
  }
}

/**
 * Get current metrics snapshot
 */
function getMetrics() {
  const memUsage = process.memoryUsage();
  return {
    uptime: process.uptime(),
    memory: {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      rss: memUsage.rss,
      external: memUsage.external
    },
    pid: process.pid,
    nodeVersion: process.version
  };
}

module.exports = {
  startMonitoring,
  stopMonitoring,
  getMetrics
};
