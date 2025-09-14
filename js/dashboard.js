import { TOTAL } from './config.js';

/**
 * Training Dashboard for visualizing simulation progress and analytics
 * Provides comprehensive insights into genetic algorithm performance
 */
export class TrainingDashboard {
  constructor() {
    // Historical data storage
    this.generationHistory = [];
    this.fitnessHistory = [];
    this.lapHistory = [];
    this.survivalHistory = [];
    this.speedHistory = [];

    // Chart instances
    this.fitnessChart = null;
    this.lapsChart = null;
    this.survivalChart = null;
    this.speedChart = null;

    // Dashboard state
    this.isVisible = false;
    this.maxHistoryLength = 100; // Keep last 100 generations

    // Performance tracking
    this.startTime = Date.now();
    this.totalGenerations = 0;

    this.initializeDashboard();
  }

  /**
   * Initialize the dashboard UI and charts
   */
  initializeDashboard() {
    this.createDashboardHTML();
    this.initializeCharts();
    this.setupEventListeners();
  }

  /**
   * Create the dashboard HTML structure
   */
  createDashboardHTML() {
    // Create dashboard container
    const dashboardHTML = `
      <div id="training-dashboard" class="dashboard-panel hidden">
        <div class="dashboard-header">
          <h2>Training Analytics</h2>
          <div class="dashboard-controls">
            <button id="export-data-btn" onclick="window.dashboardInstance?.exportData()">Export Data</button>
            <button id="reset-stats-btn" onclick="window.dashboardInstance?.resetStats()">Reset Stats</button>
            <button id="close-dashboard-btn" onclick="window.dashboardInstance?.toggle()">×</button>
          </div>
        </div>

        <div class="dashboard-content">
          <!-- Summary Stats -->
          <div class="stats-summary">
            <div class="stat-card">
              <h3>Current Generation</h3>
              <span id="current-gen-stat">0</span>
            </div>
            <div class="stat-card">
              <h3>Best Fitness</h3>
              <span id="best-fitness-stat">0</span>
            </div>
            <div class="stat-card">
              <h3>Best Laps</h3>
              <span id="best-laps-stat">0</span>
            </div>
            <div class="stat-card">
              <h3>Avg Survival</h3>
              <span id="avg-survival-stat">0%</span>
            </div>
            <div class="stat-card">
              <h3>Training Time</h3>
              <span id="training-time-stat">0m 0s</span>
            </div>
          </div>

          <!-- Chart Containers -->
          <div class="charts-container">
            <div class="chart-section">
              <h3>Fitness Evolution</h3>
              <div class="chart-controls">
                <label>
                  <input type="checkbox" id="show-avg-fitness" checked> Show Average
                </label>
                <label>
                  <input type="checkbox" id="show-best-fitness" checked> Show Best
                </label>
              </div>
              <canvas id="fitness-chart" width="400" height="200"></canvas>
            </div>

            <div class="chart-section">
              <h3>Lap Completion</h3>
              <canvas id="laps-chart" width="400" height="200"></canvas>
            </div>

            <div class="chart-section">
              <h3>Population Survival Rate</h3>
              <canvas id="survival-chart" width="400" height="200"></canvas>
            </div>

            <div class="chart-section">
              <h3>Speed Performance</h3>
              <canvas id="speed-chart" width="400" height="200"></canvas>
            </div>
          </div>

          <!-- Detailed Analytics -->
          <div class="detailed-analytics">
            <div class="analytics-section">
              <h3>Generation Analysis</h3>
              <div class="analysis-grid">
                <div class="analysis-item">
                  <label>Improvement Rate:</label>
                  <span id="improvement-rate">0%</span>
                </div>
                <div class="analysis-item">
                  <label>Convergence Score:</label>
                  <span id="convergence-score">0</span>
                </div>
                <div class="analysis-item">
                  <label>Diversity Index:</label>
                  <span id="diversity-index">0</span>
                </div>
                <div class="analysis-item">
                  <label>Success Rate:</label>
                  <span id="success-rate">0%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Insert dashboard into DOM
    document.querySelector('.container').insertAdjacentHTML('beforeend', dashboardHTML);

    // Add dashboard toggle button to header
    const headerControls = document.querySelector('.header-controls');
    const dashboardBtn = document.createElement('button');
    dashboardBtn.id = 'toggle-dashboard-btn';
    dashboardBtn.textContent = 'Analytics';
    dashboardBtn.onclick = () => this.toggle();
    headerControls.insertBefore(dashboardBtn, headerControls.firstChild);
  }

  /**
   * Initialize Chart.js charts
   */
  initializeCharts() {
    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded. Charts will not be available.');
      return;
    }

    // Chart.js default configuration
    Chart.defaults.responsive = true;
    Chart.defaults.maintainAspectRatio = false;
    Chart.defaults.plugins.legend.display = true;

    // Fitness Evolution Chart
    const fitnessCtx = document.getElementById('fitness-chart')?.getContext('2d');
    if (fitnessCtx) {
      this.fitnessChart = new Chart(fitnessCtx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [{
            label: 'Best Fitness',
            data: [],
            borderColor: '#007bff',
            backgroundColor: 'rgba(0, 123, 255, 0.1)',
            tension: 0.1,
            fill: false
          }, {
            label: 'Average Fitness',
            data: [],
            borderColor: '#28a745',
            backgroundColor: 'rgba(40, 167, 69, 0.1)',
            tension: 0.1,
            fill: false
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Fitness Score'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Generation'
              }
            }
          }
        }
      });
    }

    // Lap Completion Chart
    const lapsCtx = document.getElementById('laps-chart')?.getContext('2d');
    if (lapsCtx) {
      this.lapsChart = new Chart(lapsCtx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [{
            label: 'Best Laps Completed',
            data: [],
            borderColor: '#dc3545',
            backgroundColor: 'rgba(220, 53, 69, 0.1)',
            tension: 0.1,
            fill: true
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Laps Completed'
              }
            }
          }
        }
      });
    }

    // Survival Rate Chart
    const survivalCtx = document.getElementById('survival-chart')?.getContext('2d');
    if (survivalCtx) {
      this.survivalChart = new Chart(survivalCtx, {
        type: 'bar',
        data: {
          labels: [],
          datasets: [{
            label: 'Survival Rate (%)',
            data: [],
            backgroundColor: 'rgba(255, 193, 7, 0.6)',
            borderColor: '#ffc107',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              title: {
                display: true,
                text: 'Survival Percentage'
              }
            }
          }
        }
      });
    }

    // Speed Performance Chart
    const speedCtx = document.getElementById('speed-chart')?.getContext('2d');
    if (speedCtx) {
      this.speedChart = new Chart(speedCtx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [{
            label: 'Average Speed',
            data: [],
            borderColor: '#6610f2',
            backgroundColor: 'rgba(102, 16, 242, 0.1)',
            tension: 0.1,
            fill: false
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Speed (km/h)'
              }
            }
          }
        }
      });
    }
  }

  /**
   * Setup event listeners for dashboard controls
   */
  setupEventListeners() {
    // Chart visibility toggles
    const showAvgFitness = document.getElementById('show-avg-fitness');
    const showBestFitness = document.getElementById('show-best-fitness');

    if (showAvgFitness) {
      showAvgFitness.addEventListener('change', (e) => {
        if (this.fitnessChart) {
          this.fitnessChart.data.datasets[1].hidden = !e.target.checked;
          this.fitnessChart.update();
        }
      });
    }

    if (showBestFitness) {
      showBestFitness.addEventListener('change', (e) => {
        if (this.fitnessChart) {
          this.fitnessChart.data.datasets[0].hidden = !e.target.checked;
          this.fitnessChart.update();
        }
      });
    }
  }

  /**
   * Update dashboard with new generation data
   * @param {Object} data - Generation statistics
   */
  updateStats(data) {
    const {
      generation,
      bestFitness,
      avgFitness,
      bestLaps,
      aliveCount,
      avgSpeed,
      agents
    } = data;

    // Store historical data
    this.generationHistory.push(generation);
    this.fitnessHistory.push({ best: bestFitness, avg: avgFitness });
    this.lapHistory.push(bestLaps);
    this.survivalHistory.push((aliveCount / TOTAL) * 100);
    this.speedHistory.push(avgSpeed);

    // Maintain history length limit
    if (this.generationHistory.length > this.maxHistoryLength) {
      this.generationHistory.shift();
      this.fitnessHistory.shift();
      this.lapHistory.shift();
      this.survivalHistory.shift();
      this.speedHistory.shift();
    }

    this.totalGenerations = generation;

    // Update summary statistics
    this.updateSummaryStats(data);

    // Update charts
    this.updateCharts();

    // Update detailed analytics
    this.updateDetailedAnalytics(agents);
  }

  /**
   * Update summary statistics display
   * @param {Object} data - Current generation data
   */
  updateSummaryStats(data) {
    const { generation, bestFitness, bestLaps, aliveCount } = data;

    // Update DOM elements
    this.updateElement('current-gen-stat', generation);
    this.updateElement('best-fitness-stat', bestFitness.toFixed(2));
    this.updateElement('best-laps-stat', bestLaps);
    this.updateElement('avg-survival-stat', `${((aliveCount / TOTAL) * 100).toFixed(1)}%`);

    // Update training time
    const elapsed = Date.now() - this.startTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    this.updateElement('training-time-stat', `${minutes}m ${seconds}s`);
  }

  /**
   * Update all charts with current data
   */
  updateCharts() {
    if (!this.fitnessChart) return;

    // Update fitness chart
    this.fitnessChart.data.labels = this.generationHistory.slice();
    this.fitnessChart.data.datasets[0].data = this.fitnessHistory.map(f => f.best);
    this.fitnessChart.data.datasets[1].data = this.fitnessHistory.map(f => f.avg);
    this.fitnessChart.update('none');

    // Update laps chart
    if (this.lapsChart) {
      this.lapsChart.data.labels = this.generationHistory.slice();
      this.lapsChart.data.datasets[0].data = this.lapHistory.slice();
      this.lapsChart.update('none');
    }

    // Update survival chart
    if (this.survivalChart) {
      this.survivalChart.data.labels = this.generationHistory.slice();
      this.survivalChart.data.datasets[0].data = this.survivalHistory.slice();
      this.survivalChart.update('none');
    }

    // Update speed chart
    if (this.speedChart) {
      this.speedChart.data.labels = this.generationHistory.slice();
      this.speedChart.data.datasets[0].data = this.speedHistory.slice();
      this.speedChart.update('none');
    }
  }

  /**
   * Update detailed analytics
   * @param {Array} agents - Current generation agents
   */
  updateDetailedAnalytics(agents) {
    if (this.fitnessHistory.length < 2) return;

    // Calculate improvement rate
    const recent = this.fitnessHistory.slice(-5);
    const older = this.fitnessHistory.slice(-10, -5);
    const recentAvg = recent.reduce((sum, f) => sum + f.best, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((sum, f) => sum + f.best, 0) / older.length : recentAvg;
    const improvementRate = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg * 100) : 0;

    // Calculate convergence score (inverse of fitness variance)
    const recentFitnesses = recent.map(f => f.best);
    const variance = this.calculateVariance(recentFitnesses);
    const convergenceScore = variance > 0 ? (1 / (1 + variance)).toFixed(3) : 1;

    // Calculate diversity index (fitness spread)
    const fitnesses = agents.map(agent => agent.fitness);
    const diversityIndex = this.calculateVariance(fitnesses).toFixed(2);

    // Calculate success rate (agents completing at least 1 lap)
    const successfulAgents = agents.filter(agent => agent.lapsCompleted > 0).length;
    const successRate = (successfulAgents / agents.length * 100).toFixed(1);

    // Update analytics display
    this.updateElement('improvement-rate', `${improvementRate.toFixed(1)}%`);
    this.updateElement('convergence-score', convergenceScore);
    this.updateElement('diversity-index', diversityIndex);
    this.updateElement('success-rate', `${successRate}%`);
  }

  /**
   * Calculate variance of an array of numbers
   * @param {Array} values - Array of numeric values
   * @returns {number} Variance
   */
  calculateVariance(values) {
    if (values.length === 0) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }

  /**
   * Toggle dashboard visibility
   */
  toggle() {
    this.isVisible = !this.isVisible;
    const dashboard = document.getElementById('training-dashboard');

    if (dashboard) {
      dashboard.classList.toggle('hidden', !this.isVisible);

      // Hide other panels when showing dashboard
      if (this.isVisible) {
        document.getElementById('settings-panel')?.classList.add('hidden');
        document.getElementById('about-panel')?.classList.add('hidden');
      }
    }
  }

  /**
   * Export training data as JSON
   */
  exportData() {
    const exportData = {
      timestamp: new Date().toISOString(),
      totalGenerations: this.totalGenerations,
      trainingDuration: Date.now() - this.startTime,
      generationHistory: this.generationHistory,
      fitnessHistory: this.fitnessHistory,
      lapHistory: this.lapHistory,
      survivalHistory: this.survivalHistory,
      speedHistory: this.speedHistory
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `training-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    URL.revokeObjectURL(link.href);
  }

  /**
   * Reset all statistics and charts
   */
  resetStats() {
    if (confirm('Are you sure you want to reset all training statistics?')) {
      this.generationHistory = [];
      this.fitnessHistory = [];
      this.lapHistory = [];
      this.survivalHistory = [];
      this.speedHistory = [];
      this.startTime = Date.now();
      this.totalGenerations = 0;

      // Clear charts
      if (this.fitnessChart) {
        this.fitnessChart.data.labels = [];
        this.fitnessChart.data.datasets.forEach(dataset => {
          dataset.data = [];
        });
        this.fitnessChart.update();
      }

      if (this.lapsChart) {
        this.lapsChart.data.labels = [];
        this.lapsChart.data.datasets[0].data = [];
        this.lapsChart.update();
      }

      if (this.survivalChart) {
        this.survivalChart.data.labels = [];
        this.survivalChart.data.datasets[0].data = [];
        this.survivalChart.update();
      }

      if (this.speedChart) {
        this.speedChart.data.labels = [];
        this.speedChart.data.datasets[0].data = [];
        this.speedChart.update();
      }

      // Reset summary stats
      this.updateElement('current-gen-stat', '0');
      this.updateElement('best-fitness-stat', '0');
      this.updateElement('best-laps-stat', '0');
      this.updateElement('avg-survival-stat', '0%');
      this.updateElement('training-time-stat', '0m 0s');
    }
  }

  /**
   * Helper method to update DOM element text content
   * @param {string} id - Element ID
   * @param {string} value - New text content
   */
  updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }

  /**
   * Dispose of chart instances and clean up
   */
  dispose() {
    if (this.fitnessChart) {
      this.fitnessChart.destroy();
    }
    if (this.lapsChart) {
      this.lapsChart.destroy();
    }
    if (this.survivalChart) {
      this.survivalChart.destroy();
    }
    if (this.speedChart) {
      this.speedChart.destroy();
    }
  }
}

// Global instance for window functions
window.dashboardInstance = null;
