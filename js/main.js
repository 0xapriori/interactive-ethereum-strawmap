// Main Application Controller for Interactive Strawmap
class InteractiveStrawmap {
  constructor() {
    this.isInitialized = false;
    this.managers = {};
    
    this.init();
  }

  async init() {
    try {
      console.log('Initializing Interactive Strawmap...');
      
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        await new Promise(resolve => {
          document.addEventListener('DOMContentLoaded', resolve);
        });
      }

      // Initialize managers (they're created by their respective files)
      this.managers = {
        dragDrop: window.dragDropManager,
        visualization: window.visualizationManager,
        state: window.stateManager,
        analytics: window.analyticsManager
      };

      // Render the roadmap
      this.renderRoadmap();
      
      // Bind global events
      this.bindEvents();
      
      // Initialize features
      this.initializeFeatures();
      
      this.isInitialized = true;
      
      console.log('Interactive Strawmap initialized successfully');
      this.showStatusMessage('Interactive Strawmap loaded successfully', 'success');
      
    } catch (error) {
      console.error('Error initializing application:', error);
      this.showStatusMessage('Error loading application', 'warning');
    }
  }

  renderRoadmap() {
    const gridContainer = document.getElementById('roadmapGrid');
    if (!gridContainer) {
      throw new Error('Roadmap grid container not found');
    }

    // Clear existing content
    gridContainer.innerHTML = '';
    
    // Create the layer labels column (already in HTML)
    
    // Create fork columns
    STRAWMAP_DATA.forks.forEach(fork => {
      const forkColumn = this.createForkColumn(fork);
      gridContainer.appendChild(forkColumn);
    });
  }

  createForkColumn(fork) {
    const column = document.createElement('div');
    column.className = 'fork-column';
    column.dataset.forkId = fork.id;
    
    // Fork header
    const header = document.createElement('div');
    header.className = 'fork-header';
    header.innerHTML = `
      <div class="fork-name">${fork.name}</div>
      <div class="fork-year">${fork.year}</div>
      <div class="fork-complexity" id="complexity-${fork.id}"></div>
    `;
    column.appendChild(header);
    
    // Create layer sections
    STRAWMAP_DATA.layers.forEach(layer => {
      const layerSection = document.createElement('div');
      layerSection.className = `layer-section ${layer.id}`;
      layerSection.dataset.layer = layer.id;
      layerSection.dataset.forkId = fork.id;
      
      // Add items for this fork and layer
      const items = DataUtils.getItemsByForkAndLayer(fork.id, layer.id);
      items.forEach(item => {
        const itemElement = this.createRoadmapItem(item);
        layerSection.appendChild(itemElement);
      });
      
      column.appendChild(layerSection);
    });
    
    return column;
  }

  createRoadmapItem(item) {
    const itemDiv = document.createElement('div');
    itemDiv.className = `roadmap-item ${item.layer} ${item.type}`;
    itemDiv.dataset.itemId = item.id;
    itemDiv.dataset.layer = item.layer;
    itemDiv.dataset.currentFork = item.currentFork;
    itemDiv.draggable = true;
    
    itemDiv.innerHTML = `
      <div class="item-title">${item.name}</div>
      <div class="item-description">${item.description}</div>
    `;
    
    // Add hover effects for dependency visualization
    itemDiv.addEventListener('mouseenter', () => {
      this.highlightItemDependencies(item.id, true);
    });
    
    itemDiv.addEventListener('mouseleave', () => {
      this.highlightItemDependencies(item.id, false);
    });
    
    return itemDiv;
  }

  highlightItemDependencies(itemId, highlight) {
    const dependencies = DataUtils.getItemDependencies(itemId);
    const dependents = DataUtils.getItemDependents(itemId);
    
    [...dependencies, ...dependents].forEach(relatedId => {
      const element = document.querySelector(`[data-item-id="${relatedId}"]`);
      if (element) {
        if (highlight) {
          element.classList.add('dependency-highlight');
        } else {
          element.classList.remove('dependency-highlight');
        }
      }
    });
  }

  bindEvents() {
    // Reset button
    document.getElementById('resetBtn')?.addEventListener('click', () => {
      this.resetToOriginal();
    });
    
    // Export button
    document.getElementById('exportBtn')?.addEventListener('click', () => {
      this.exportConfiguration();
    });
    
    // Help button
    document.getElementById('helpBtn')?.addEventListener('click', () => {
      this.showHelp();
    });
    
    // Modal close handlers
    document.querySelectorAll('.modal-close, .modal').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target === el || e.target.classList.contains('modal-close')) {
          el.classList.remove('show');
        }
      });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideAllModals();
      } else if (e.key === 'h' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this.showHelp();
      }
    });
    
    // Global error handling
    window.addEventListener('error', (e) => {
      console.error('Application error:', e.error);
      this.showStatusMessage('An error occurred. Please refresh the page.', 'warning');
    });
    
    // Listen for application events
    window.addEventListener('itemMoved', (e) => {
      this.onItemMoved(e.detail);
    });
    
    window.addEventListener('stateRestored', (e) => {
      this.onStateRestored(e.detail);
    });
  }

  initializeFeatures() {
    // Initialize analytics toggles
    const criticalPathToggle = document.getElementById('showCriticalPath');
    const complexityToggle = document.getElementById('showComplexity');
    
    if (criticalPathToggle) {
      criticalPathToggle.checked = false;
    }
    
    if (complexityToggle) {
      complexityToggle.checked = false;
    }
    
    // Initial metrics calculation
    if (this.managers.analytics) {
      this.managers.analytics.updateMetrics();
    }
    
    // Initialize dependency visualization
    if (this.managers.visualization) {
      setTimeout(() => {
        this.managers.visualization.updateDependencyArrows();
      }, 100);
    }
  }

  // Event handlers
  onItemMoved(detail) {
    const { itemId, oldFork, newFork } = detail;
    const item = STRAWMAP_DATA.items.find(i => i.id === itemId);
    
    if (item) {
      console.log(`Item moved: ${item.name} from ${oldFork} to ${newFork}`);
      
      // Check for new conflicts after move
      const conflicts = DataUtils.checkMoveConflicts(itemId, newFork);
      if (conflicts.hasConflicts) {
        this.showStatusMessage(
          `⚠️ ${item.name} has ${conflicts.conflicts.length} dependency conflicts`, 
          'warning'
        );
      }
    }
  }

  onStateRestored(detail) {
    console.log('State restored, updating UI...');
    // UI is already updated by state manager, just refresh visualizations
    if (this.managers.visualization) {
      this.managers.visualization.updateDependencyArrows();
    }
    if (this.managers.analytics) {
      this.managers.analytics.updateMetrics();
    }
  }

  // Actions
  resetToOriginal() {
    if (confirm('Reset roadmap to original strawmap configuration? This will undo all changes.')) {
      if (this.managers.state) {
        this.managers.state.resetToOriginal();
      } else {
        // Fallback reset
        DataUtils.resetToOriginal();
        this.renderRoadmap();
        this.showStatusMessage('Reset to original configuration', 'success');
      }
    }
  }

  exportConfiguration() {
    try {
      const exportData = {
        version: '1.0',
        timestamp: Date.now(),
        description: 'Interactive Strawmap Configuration',
        roadmap: this.managers.state ? this.managers.state.exportState() : this.createBasicExport(),
        analytics: this.managers.analytics ? this.managers.analytics.exportAnalytics() : null
      };
      
      // Create download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `strawmap-config-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      this.showStatusMessage('Configuration exported successfully', 'success');
      
    } catch (error) {
      console.error('Export error:', error);
      this.showStatusMessage('Error exporting configuration', 'warning');
    }
  }

  createBasicExport() {
    return {
      items: STRAWMAP_DATA.items.map(item => ({
        id: item.id,
        name: item.name,
        currentFork: item.currentFork,
        originalFork: item.originalFork
      })),
      timestamp: Date.now()
    };
  }

  showHelp() {
    const modal = document.getElementById('helpModal');
    if (modal) {
      modal.classList.add('show');
    }
  }

  hideAllModals() {
    document.querySelectorAll('.modal.show').forEach(modal => {
      modal.classList.remove('show');
    });
  }

  showStatusMessage(message, type = 'info') {
    const statusElement = document.getElementById('statusMessage');
    if (statusElement) {
      statusElement.textContent = message;
      statusElement.className = `status-message ${type}`;
      
      setTimeout(() => {
        if (statusElement.textContent === message) {
          statusElement.textContent = '';
          statusElement.className = 'status-message';
        }
      }, type === 'success' ? 4000 : 6000);
    }
  }

  // Import functionality (can be triggered via console or future UI)
  async importConfiguration(file) {
    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      
      if (this.managers.state && importData.roadmap) {
        this.managers.state.importState(importData.roadmap);
      } else {
        throw new Error('Invalid import data or state manager not available');
      }
      
    } catch (error) {
      console.error('Import error:', error);
      this.showStatusMessage(`Import failed: ${error.message}`, 'warning');
    }
  }

  // Utility methods for external access
  getAnalytics() {
    return this.managers.analytics ? this.managers.analytics.exportAnalytics() : null;
  }

  getRecommendations() {
    return this.managers.analytics ? this.managers.analytics.getRecommendations() : [];
  }

  getState() {
    return this.managers.state ? this.managers.state.exportState() : null;
  }

  // Debug methods (available in console)
  debug() {
    return {
      managers: Object.keys(this.managers),
      data: STRAWMAP_DATA,
      analytics: this.getAnalytics(),
      recommendations: this.getRecommendations(),
      state: this.getState()
    };
  }
}

// Initialize application
window.addEventListener('DOMContentLoaded', () => {
  window.interactiveStrawmap = new InteractiveStrawmap();
});

// Make app globally available for debugging
window.strawmapApp = {
  debug: () => window.interactiveStrawmap?.debug(),
  export: () => window.interactiveStrawmap?.exportConfiguration(),
  reset: () => window.interactiveStrawmap?.resetToOriginal(),
  analytics: () => window.interactiveStrawmap?.getAnalytics(),
  recommendations: () => window.interactiveStrawmap?.getRecommendations()
};