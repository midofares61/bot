const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.ensureLogDir();
  }

  ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta
    };
    return JSON.stringify(logEntry);
  }

  writeToFile(filename, message) {
    const logFile = path.join(this.logDir, filename);
    fs.appendFileSync(logFile, message + '\n');
  }

  info(message, meta = {}) {
    const formattedMessage = this.formatMessage('INFO', message, meta);
    console.log(formattedMessage);
    this.writeToFile('app.log', formattedMessage);
  }

  error(message, meta = {}) {
    const formattedMessage = this.formatMessage('ERROR', message, meta);
    console.error(formattedMessage);
    this.writeToFile('error.log', formattedMessage);
  }

  warn(message, meta = {}) {
    const formattedMessage = this.formatMessage('WARN', message, meta);
    console.warn(formattedMessage);
    this.writeToFile('app.log', formattedMessage);
  }

  debug(message, meta = {}) {
    if (process.env.NODE_ENV === 'development') {
      const formattedMessage = this.formatMessage('DEBUG', message, meta);
      console.debug(formattedMessage);
      this.writeToFile('debug.log', formattedMessage);
    }
  }

  // Log webhook events
  webhook(event, data) {
    this.info(`Webhook event: ${event}`, { event, data });
  }

  // Log API requests
  apiRequest(method, url, status, duration) {
    this.info(`API Request: ${method} ${url}`, { 
      method, 
      url, 
      status, 
      duration: `${duration}ms` 
    });
  }

  // Log database operations
  database(operation, collection, duration) {
    this.info(`Database ${operation}`, { 
      operation, 
      collection, 
      duration: `${duration}ms` 
    });
  }

  // Log Facebook API calls
  facebookAPI(method, endpoint, status, duration) {
    this.info(`Facebook API: ${method} ${endpoint}`, { 
      method, 
      endpoint, 
      status, 
      duration: `${duration}ms` 
    });
  }

  // Log bot actions
  botAction(action, pageId, userId, details = {}) {
    this.info(`Bot action: ${action}`, { 
      action, 
      pageId, 
      userId, 
      ...details 
    });
  }

  // Clean old log files (older than 30 days)
  cleanOldLogs() {
    try {
      const files = fs.readdirSync(this.logDir);
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

      files.forEach(file => {
        const filePath = path.join(this.logDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime.getTime() < thirtyDaysAgo) {
          fs.unlinkSync(filePath);
          this.info(`Deleted old log file: ${file}`);
        }
      });
    } catch (error) {
      this.error('Error cleaning old logs', { error: error.message });
    }
  }
}

module.exports = new Logger();
