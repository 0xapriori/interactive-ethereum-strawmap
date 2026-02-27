// State Management System for Undo/Redo functionality
class StateManager {
  constructor() {
    this.history = [];
    this.currentIndex = -1;
    this.maxHistorySize = 50;
    this.isRestoring = false;
    
    this.initializeState();
    this.bindEvents();
  }

  initializeState() {
    // Save initial state
    this.saveState('Initial state', false);
    this.updateButtonStates();
  }

  bindEvents() {
    // Bind undo/redo buttons
    document.getElementById('undoBtn')?.addEventListener('click', () => this.undo());
    document.getElementById('redoBtn')?.addEventListener('click', () => this.redo());
    
    // Bind keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        this.undo();
      } else if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') || 
                 ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
        e.preventDefault();
        this.redo();
      }
    });
  }

  saveState(description = 'Action', updateHistory = true) {
    if (this.isRestoring) return;

    const state = {
      timestamp: Date.now(),
      description,
      data: this.captureCurrentState()
    };

    if (updateHistory) {
      // Remove any states after current index (when we're not at the end)
      this.history = this.history.slice(0, this.currentIndex + 1);
      
      // Add new state
      this.history.push(state);
      this.currentIndex = this.history.length - 1;
      
      // Limit history size
      if (this.history.length > this.maxHistorySize) {
        this.history.shift();
        this.currentIndex--;
      }
      
      this.updateButtonStates();
      this.showStateMessage(description);
    } else {
      // Initial state setup
      this.history = [state];
      this.currentIndex = 0;
    }

    console.log(`State saved: ${description} (${this.history.length} states, index ${this.currentIndex})`);
  }

  captureCurrentState() {
    // Capture complete current state
    return {
      items: STRAWMAP_DATA.items.map(item => ({
        id: item.id,
        name: item.name,
        layer: item.layer,
        currentFork: item.currentFork,
        originalFork: item.originalFork,
        type: item.type,
        dependencies: [...item.dependencies],
        complexity: item.complexity,
        description: item.description
      })),
      forks: STRAWMAP_DATA.forks.map(fork => ({ ...fork })),
      timestamp: Date.now()
    };
  }

  undo() {
    if (!this.canUndo()) {
      this.showStateMessage('Nothing to undo', 'warning');
      return;
    }

    this.currentIndex--;
    this.restoreState(this.history[this.currentIndex]);
    this.updateButtonStates();
    
    const description = this.currentIndex < this.history.length - 1 
      ? this.history[this.currentIndex + 1].description 
      : 'Unknown action';
    
    this.showStateMessage(`Undid: ${description}`, 'info');
    console.log(`Undo: ${description}`);
  }

  redo() {
    if (!this.canRedo()) {
      this.showStateMessage('Nothing to redo', 'warning');
      return;
    }

    this.currentIndex++;
    this.restoreState(this.history[this.currentIndex]);
    this.updateButtonStates();
    
    const description = this.history[this.currentIndex].description;
    this.showStateMessage(`Redid: ${description}`, 'info');
    console.log(`Redo: ${description}`);
  }

  restoreState(state) {
    this.isRestoring = true;
    
    try {
      // Update data model
      STRAWMAP_DATA.items.forEach((item, index) => {
        const savedItem = state.data.items[index];
        if (savedItem && savedItem.id === item.id) {
          item.currentFork = savedItem.currentFork;
        }
      });

      // Update DOM to match state
      this.updateDOMFromState(state.data);
      
      // Update visualizations
      window.visualizationManager?.updateDependencyArrows();
      window.analyticsManager?.updateMetrics();
      
      // Dispatch event for other systems
      window.dispatchEvent(new CustomEvent('stateRestored', {
        detail: { state: state.data }
      }));
      
    } catch (error) {
      console.error('Error restoring state:', error);
      this.showStateMessage('Error restoring state', 'warning');
    } finally {
      this.isRestoring = false;
    }
  }

  updateDOMFromState(stateData) {
    // Move all items to their correct positions based on state
    stateData.items.forEach(itemData => {
      const element = document.querySelector(`[data-item-id="${itemData.id}"]`);
      if (!element) return;

      const targetSection = document.querySelector(
        `[data-fork-id="${itemData.currentFork}"] [data-layer="${itemData.layer}"]`
      );
      
      if (targetSection && element.parentElement !== targetSection) {
        targetSection.appendChild(element);
        element.dataset.currentFork = itemData.currentFork;
        
        // Add transition effect
        element.classList.add('fade-in');
        setTimeout(() => {
          element.classList.remove('fade-in');
        }, 300);
      }
    });
  }

  canUndo() {
    return this.currentIndex > 0;
  }

  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }

  updateButtonStates() {
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    
    if (undoBtn) {
      undoBtn.disabled = !this.canUndo();
      undoBtn.title = this.canUndo() 
        ? `Undo: ${this.history[this.currentIndex].description}`
        : 'Nothing to undo';
    }
    
    if (redoBtn) {
      redoBtn.disabled = !this.canRedo();
      redoBtn.title = this.canRedo() 
        ? `Redo: ${this.history[this.currentIndex + 1].description}`
        : 'Nothing to redo';
    }
  }

  showStateMessage(message, type = 'info') {
    const statusElement = document.getElementById('statusMessage');
    if (statusElement) {
      statusElement.textContent = message;
      statusElement.className = `status-message ${type}`;
      
      setTimeout(() => {
        if (statusElement.textContent === message) {
          statusElement.textContent = '';
          statusElement.className = 'status-message';
        }
      }, 2000);
    }
  }

  // Reset to original state
  resetToOriginal() {
    this.isRestoring = true;
    
    try {
      // Reset data model
      DataUtils.resetToOriginal();
      
      // Update DOM
      STRAWMAP_DATA.items.forEach(item => {
        const element = document.querySelector(`[data-item-id="${item.id}"]`);
        if (element) {
          const targetSection = document.querySelector(
            `[data-fork-id="${item.originalFork}"] [data-layer="${item.layer}"]`
          );
          
          if (targetSection) {
            targetSection.appendChild(element);
            element.dataset.currentFork = item.originalFork;
          }
        }
      });
      
      // Save new state
      this.saveState('Reset to original');
      
      // Update visualizations
      window.visualizationManager?.updateDependencyArrows();
      window.analyticsManager?.updateMetrics();
      
      this.showStateMessage('Reset to original strawmap', 'success');
      
    } catch (error) {
      console.error('Error resetting to original:', error);
      this.showStateMessage('Error resetting roadmap', 'warning');
    } finally {
      this.isRestoring = false;
    }
  }

  // Export current state
  exportState() {
    return {
      version: '1.0',
      timestamp: Date.now(),
      description: 'Interactive Strawmap Export',
      data: this.captureCurrentState(),
      metadata: {
        totalItems: STRAWMAP_DATA.items.length,
        totalForks: STRAWMAP_DATA.forks.length,
        modifiedItems: STRAWMAP_DATA.items.filter(item => 
          item.currentFork !== item.originalFork
        ).length
      }
    };
  }

  // Import state from exported data
  importState(exportedData) {
    if (!exportedData || !exportedData.data) {
      throw new Error('Invalid export data');
    }

    this.isRestoring = true;
    
    try {
      // Validate data structure
      if (!exportedData.data.items || !Array.isArray(exportedData.data.items)) {
        throw new Error('Invalid items data');
      }

      // Update data model
      exportedData.data.items.forEach(importedItem => {
        const existingItem = STRAWMAP_DATA.items.find(item => item.id === importedItem.id);
        if (existingItem) {
          existingItem.currentFork = importedItem.currentFork;
        }
      });

      // Update DOM
      this.updateDOMFromState(exportedData.data);
      
      // Save state
      this.saveState(`Imported configuration: ${exportedData.description || 'Unnamed'}`);
      
      // Update visualizations
      window.visualizationManager?.updateDependencyArrows();
      window.analyticsManager?.updateMetrics();
      
      this.showStateMessage('Configuration imported successfully', 'success');
      
    } catch (error) {
      console.error('Error importing state:', error);
      this.showStateMessage(`Import failed: ${error.message}`, 'warning');
      throw error;
    } finally {
      this.isRestoring = false;
    }
  }

  // Get history summary for debugging
  getHistorySummary() {
    return this.history.map((state, index) => ({
      index,
      description: state.description,
      timestamp: new Date(state.timestamp).toISOString(),
      isCurrent: index === this.currentIndex,
      itemsModified: state.data.items.filter(item => 
        item.currentFork !== item.originalFork
      ).length
    }));
  }

  // Clear history (for memory management)
  clearHistory() {
    this.history = [this.history[this.currentIndex]]; // Keep only current state
    this.currentIndex = 0;
    this.updateButtonStates();
    this.showStateMessage('History cleared', 'info');
  }
}

// Initialize state manager when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  window.stateManager = new StateManager();
});