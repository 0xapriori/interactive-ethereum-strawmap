// Analytics Engine for Critical Path Analysis and Fork Complexity Metrics
class AnalyticsManager {
  constructor() {
    this.criticalPathCache = new Map();
    this.complexityCache = new Map();
    this.lastUpdateTime = 0;
    this.updateThrottleMs = 500;
    
    this.bindEvents();
    this.updateMetrics();
  }

  bindEvents() {
    // Listen for configuration changes
    window.addEventListener('itemMoved', () => this.throttledUpdate());
    window.addEventListener('stateRestored', () => this.throttledUpdate());
    
    // Bind toggle controls
    document.getElementById('showCriticalPath')?.addEventListener('change', (e) => {
      this.toggleCriticalPath(e.target.checked);
    });
    
    document.getElementById('showComplexity')?.addEventListener('change', (e) => {
      this.toggleComplexityDisplay(e.target.checked);
    });
  }

  throttledUpdate() {
    const now = Date.now();
    if (now - this.lastUpdateTime > this.updateThrottleMs) {
      this.updateMetrics();
      this.lastUpdateTime = now;
    } else {
      // Schedule update for later
      setTimeout(() => this.updateMetrics(), this.updateThrottleMs);
    }
  }

  updateMetrics() {
    this.calculateCriticalPath();
    this.calculateForkComplexity();
    this.updateVisualIndicators();
  }

  calculateCriticalPath() {
    const criticalItems = [];
    
    // Calculate dependency depth and breadth for each item
    STRAWMAP_DATA.items.forEach(item => {
      const dependents = DataUtils.getItemDependents(item.id);
      const dependencies = DataUtils.getItemDependencies(item.id);
      
      const metrics = {
        id: item.id,
        name: item.name,
        layer: item.layer,
        currentFork: item.currentFork,
        dependentCount: dependents.length,
        dependencyCount: dependencies.length,
        criticalityScore: this.calculateCriticalityScore(item.id, dependents, dependencies),
        pathLength: this.calculatePathLength(item.id),
        isBottleneck: this.isBottleneckItem(item.id)
      };
      
      criticalItems.push(metrics);
    });

    // Sort by criticality score
    criticalItems.sort((a, b) => b.criticalityScore - a.criticalityScore);
    
    // Cache results
    this.criticalPathCache.set('items', criticalItems);
    this.criticalPathCache.set('topCritical', criticalItems.slice(0, 5));
    
    return criticalItems;
  }

  calculateCriticalityScore(itemId, dependents, dependencies) {
    const item = STRAWMAP_DATA.items.find(i => i.id === itemId);
    if (!item) return 0;

    let score = 0;
    
    // Base score from number of dependents (items blocked by this one)
    score += dependents.length * 10;
    
    // Bonus for being a headliner (major upgrade)
    if (item.type === 'headliner') {
      score += 20;
    }
    
    // Bonus for high complexity items
    const complexityBonus = {
      'low': 0,
      'medium': 5,
      'high': 10,
      'very-high': 15
    };
    score += complexityBonus[item.complexity] || 0;
    
    // Penalty for having many dependencies (harder to schedule early)
    score -= dependencies.length * 2;
    
    // Bonus for items in early forks (more time-critical)
    const forkIndex = STRAWMAP_DATA.forks.findIndex(f => f.id === item.currentFork);
    if (forkIndex >= 0) {
      score += (STRAWMAP_DATA.forks.length - forkIndex) * 3;
    }
    
    return Math.max(0, score);
  }

  calculatePathLength(itemId) {
    // Calculate longest dependency chain through this item
    const visited = new Set();
    
    const calculateDepth = (id, depth = 0) => {
      if (visited.has(id)) return depth;
      visited.add(id);
      
      const item = STRAWMAP_DATA.items.find(i => i.id === id);
      if (!item || item.dependencies.length === 0) return depth;
      
      let maxDepth = depth;
      item.dependencies.forEach(depId => {
        const depDepth = calculateDepth(depId, depth + 1);
        maxDepth = Math.max(maxDepth, depDepth);
      });
      
      return maxDepth;
    };
    
    return calculateDepth(itemId);
  }

  isBottleneckItem(itemId) {
    // An item is a bottleneck if it blocks multiple paths to north stars
    const dependents = DataUtils.getItemDependents(itemId);
    const northStarIds = STRAWMAP_DATA.northStars.map(star => star.id);
    
    // Check how many paths to north stars go through this item
    let pathsBlocked = 0;
    northStarIds.forEach(starId => {
      const starItem = STRAWMAP_DATA.items.find(i => i.id === starId);
      if (starItem) {
        const starDependencies = DataUtils.getItemDependencies(starId);
        if (starDependencies.includes(itemId)) {
          pathsBlocked++;
        }
      }
    });
    
    return pathsBlocked >= 2;
  }

  calculateForkComplexity() {
    const complexityMetrics = new Map();
    
    STRAWMAP_DATA.forks.forEach(fork => {
      const forkItems = DataUtils.getItemsByFork(fork.id);
      const metrics = DataUtils.getForkComplexity(fork.id);
      
      // Add additional analysis
      const headliners = forkItems.filter(item => item.type === 'headliner');
      const crossLayerDependencies = this.countCrossLayerDependencies(fork.id);
      const riskScore = this.calculateForkRiskScore(fork.id, forkItems);
      
      const complexityData = {
        forkId: fork.id,
        forkName: fork.name,
        ...metrics,
        headliners: headliners.map(item => ({
          id: item.id,
          name: item.name,
          layer: item.layer
        })),
        crossLayerDependencies,
        riskScore,
        complexity: this.getForkComplexityLevel(metrics.totalComplexity, metrics.itemCount)
      };
      
      complexityMetrics.set(fork.id, complexityData);
    });
    
    this.complexityCache = complexityMetrics;
    return complexityMetrics;
  }

  countCrossLayerDependencies(forkId) {
    const forkItems = DataUtils.getItemsByFork(forkId);
    let crossLayerCount = 0;
    
    forkItems.forEach(item => {
      item.dependencies.forEach(depId => {
        const depItem = STRAWMAP_DATA.items.find(i => i.id === depId);
        if (depItem && depItem.layer !== item.layer) {
          crossLayerCount++;
        }
      });
    });
    
    return crossLayerCount;
  }

  calculateForkRiskScore(forkId, forkItems) {
    let riskScore = 0;
    
    // Risk from high complexity items
    forkItems.forEach(item => {
      const complexityRisk = {
        'low': 1,
        'medium': 2,
        'high': 4,
        'very-high': 6
      };
      riskScore += complexityRisk[item.complexity] || 2;
    });
    
    // Risk from dependency conflicts
    forkItems.forEach(item => {
      const conflicts = DataUtils.checkMoveConflicts(item.id, forkId);
      riskScore += conflicts.conflicts.length * 3;
    });
    
    // Risk from having too many items
    if (forkItems.length > 5) {
      riskScore += (forkItems.length - 5) * 2;
    }
    
    // Risk from multiple headliners (except L* which is allowed)
    const headliners = forkItems.filter(item => item.type === 'headliner');
    if (headliners.length > 2 && forkId !== 'l-star') {
      riskScore += (headliners.length - 2) * 5;
    }
    
    return riskScore;
  }

  getForkComplexityLevel(totalComplexity, itemCount) {
    if (itemCount === 0) return 'empty';
    
    const avgComplexity = totalComplexity / itemCount;
    
    if (avgComplexity < 1.5) return 'low';
    if (avgComplexity < 2.5) return 'medium';
    if (avgComplexity < 3.5) return 'high';
    return 'very-high';
  }

  updateVisualIndicators() {
    this.updateCriticalPathIndicators();
    this.updateComplexityIndicators();
  }

  updateCriticalPathIndicators() {
    const showCriticalPath = document.getElementById('showCriticalPath')?.checked;
    
    // Clear existing indicators
    document.querySelectorAll('.roadmap-item.critical-path').forEach(el => {
      el.classList.remove('critical-path');
    });
    
    if (showCriticalPath) {
      const topCritical = this.criticalPathCache.get('topCritical') || [];
      
      topCritical.forEach((item, index) => {
        const element = document.querySelector(`[data-item-id="${item.id}"]`);
        if (element) {
          element.classList.add('critical-path');
          element.title = `Critical Path #${index + 1} (Score: ${item.criticalityScore})`;
        }
      });
      
      // Update arrows
      window.visualizationManager?.showCriticalPath(true);
    } else {
      window.visualizationManager?.showCriticalPath(false);
    }
  }

  updateComplexityIndicators() {
    const showComplexity = document.getElementById('showComplexity')?.checked;
    
    STRAWMAP_DATA.forks.forEach(fork => {
      const complexityDisplay = document.querySelector(`[data-fork-id="${fork.id}"] .fork-complexity`);
      
      if (complexityDisplay) {
        if (showComplexity) {
          const metrics = this.complexityCache.get(fork.id);
          if (metrics) {
            complexityDisplay.textContent = `${metrics.itemCount} items (${metrics.complexity})`;
            complexityDisplay.classList.add('show');
            
            // Color code by complexity
            complexityDisplay.className = complexityDisplay.className.replace(/complexity-\w+/g, '');
            complexityDisplay.classList.add(`complexity-${metrics.complexity}`);
          }
        } else {
          complexityDisplay.classList.remove('show');
        }
      }
    });
  }

  toggleCriticalPath(enabled) {
    if (enabled) {
      this.calculateCriticalPath();
    }
    this.updateCriticalPathIndicators();
    
    // Update status
    const topCritical = this.criticalPathCache.get('topCritical') || [];
    const message = enabled 
      ? `Critical path highlights ${topCritical.length} most critical items`
      : 'Critical path highlights disabled';
    
    this.showMessage(message, 'info');
  }

  toggleComplexityDisplay(enabled) {
    this.updateComplexityIndicators();
    
    const message = enabled 
      ? 'Fork complexity metrics displayed'
      : 'Fork complexity metrics hidden';
    
    this.showMessage(message, 'info');
  }

  showMessage(message, type = 'info') {
    const statusElement = document.getElementById('statusMessage');
    if (statusElement) {
      statusElement.textContent = message;
      statusElement.className = `status-message ${type}`;
      
      setTimeout(() => {
        statusElement.textContent = '';
        statusElement.className = 'status-message';
      }, 3000);
    }
  }

  // Export analytics data
  exportAnalytics() {
    const criticalItems = this.criticalPathCache.get('items') || [];
    const complexityData = Array.from(this.complexityCache.values());
    
    return {
      timestamp: Date.now(),
      criticalPath: {
        items: criticalItems,
        topCritical: criticalItems.slice(0, 10)
      },
      forkComplexity: complexityData,
      summary: {
        totalItems: STRAWMAP_DATA.items.length,
        totalForks: STRAWMAP_DATA.forks.length,
        averageComplexity: criticalItems.length > 0 
          ? criticalItems.reduce((sum, item) => sum + item.criticalityScore, 0) / criticalItems.length 
          : 0,
        highestRiskFork: complexityData.reduce((max, fork) => 
          fork.riskScore > (max?.riskScore || 0) ? fork : max, null
        )
      }
    };
  }

  // Generate report
  generateReport() {
    const analytics = this.exportAnalytics();
    const report = {
      title: 'Interactive Strawmap Analytics Report',
      generatedAt: new Date().toISOString(),
      ...analytics
    };
    
    return report;
  }

  // Get recommendations based on analysis
  getRecommendations() {
    const recommendations = [];
    const complexityData = Array.from(this.complexityCache.values());
    const criticalItems = this.criticalPathCache.get('items') || [];
    
    // Check for overloaded forks
    complexityData.forEach(fork => {
      if (fork.riskScore > 20) {
        recommendations.push({
          type: 'high_risk_fork',
          priority: 'high',
          message: `${fork.forkName} has high risk (score: ${fork.riskScore}). Consider redistributing items.`,
          forkId: fork.forkId
        });
      }
      
      if (fork.itemCount > 6) {
        recommendations.push({
          type: 'overloaded_fork',
          priority: 'medium',
          message: `${fork.forkName} has ${fork.itemCount} items. Consider moving some to adjacent forks.`,
          forkId: fork.forkId
        });
      }
    });
    
    // Check for critical path bottlenecks
    const bottlenecks = criticalItems.filter(item => item.isBottleneck);
    bottlenecks.forEach(item => {
      recommendations.push({
        type: 'bottleneck',
        priority: 'high',
        message: `${item.name} is a bottleneck blocking multiple paths. Prioritize this item.`,
        itemId: item.id
      });
    });
    
    // Check for dependency conflicts
    STRAWMAP_DATA.items.forEach(item => {
      const conflicts = DataUtils.checkMoveConflicts(item.id, item.currentFork);
      if (conflicts.hasConflicts) {
        recommendations.push({
          type: 'dependency_conflict',
          priority: 'high',
          message: `${item.name} has ${conflicts.conflicts.length} dependency conflicts.`,
          itemId: item.id
        });
      }
    });
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }
}

// Initialize analytics manager when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  window.analyticsManager = new AnalyticsManager();
});