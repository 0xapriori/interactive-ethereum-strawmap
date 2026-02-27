// Drag and Drop System for Interactive Strawmap
class DragDropManager {
  constructor() {
    this.draggedItem = null;
    this.dropTargets = [];
    this.originalPosition = null;
    this.dragStartTime = null;
    
    this.bindEvents();
  }

  bindEvents() {
    document.addEventListener('dragstart', this.handleDragStart.bind(this));
    document.addEventListener('dragend', this.handleDragEnd.bind(this));
    document.addEventListener('dragover', this.handleDragOver.bind(this));
    document.addEventListener('dragenter', this.handleDragEnter.bind(this));
    document.addEventListener('dragleave', this.handleDragLeave.bind(this));
    document.addEventListener('drop', this.handleDrop.bind(this));
  }

  handleDragStart(e) {
    const itemElement = e.target.closest('.roadmap-item');
    if (!itemElement) return;

    this.dragStartTime = Date.now();
    this.draggedItem = {
      element: itemElement,
      id: itemElement.dataset.itemId,
      originalFork: itemElement.closest('.fork-column').dataset.forkId,
      originalLayer: itemElement.dataset.layer
    };

    // Store original position for potential revert
    this.originalPosition = {
      parent: itemElement.parentElement,
      nextSibling: itemElement.nextElementSibling
    };

    // Visual feedback for dragging
    itemElement.classList.add('dragging');
    
    // Set drag image
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', itemElement.outerHTML);

    // Highlight valid drop targets
    this.highlightDropTargets();

    // Notify other systems about drag start
    window.dispatchEvent(new CustomEvent('itemDragStart', {
      detail: { itemId: this.draggedItem.id }
    }));

    console.log(`Started dragging: ${this.draggedItem.id}`);
  }

  handleDragEnd(e) {
    if (!this.draggedItem) return;

    const itemElement = e.target.closest('.roadmap-item');
    if (itemElement) {
      itemElement.classList.remove('dragging');
    }

    // Remove all drop target highlights
    this.removeDropTargetHighlights();

    // Clean up
    this.draggedItem = null;
    this.originalPosition = null;
    this.dragStartTime = null;

    // Notify other systems
    window.dispatchEvent(new CustomEvent('itemDragEnd'));
  }

  handleDragOver(e) {
    e.preventDefault(); // Allow drop
    e.dataTransfer.dropEffect = 'move';
  }

  handleDragEnter(e) {
    const layerSection = e.target.closest('.layer-section');
    if (layerSection && this.draggedItem) {
      const sectionLayer = layerSection.dataset.layer;
      const itemLayer = this.draggedItem.originalLayer;
      
      // Only allow dropping in the same layer
      if (sectionLayer === itemLayer) {
        layerSection.classList.add('drop-target');
      }
    }
  }

  handleDragLeave(e) {
    const layerSection = e.target.closest('.layer-section');
    if (layerSection) {
      // Check if we're really leaving (not just moving to a child element)
      const rect = layerSection.getBoundingClientRect();
      const isInside = (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      );
      
      if (!isInside) {
        layerSection.classList.remove('drop-target');
      }
    }
  }

  async handleDrop(e) {
    e.preventDefault();
    
    if (!this.draggedItem) return;

    const layerSection = e.target.closest('.layer-section');
    if (!layerSection) return;

    const targetFork = layerSection.closest('.fork-column').dataset.forkId;
    const targetLayer = layerSection.dataset.layer;
    const itemId = this.draggedItem.id;

    // Validate drop target (same layer only)
    if (targetLayer !== this.draggedItem.originalLayer) {
      this.showMessage('Items can only be moved within the same layer', 'warning');
      this.revertDrag();
      return;
    }

    // Check for conflicts
    const conflictCheck = DataUtils.checkMoveConflicts(itemId, targetFork);
    
    if (conflictCheck.hasConflicts) {
      // Show conflict modal and let user decide
      await this.showConflictModal(itemId, targetFork, conflictCheck.conflicts);
    } else {
      // No conflicts, proceed with move
      this.executeMove(itemId, targetFork, layerSection);
    }

    // Remove drop target highlighting
    layerSection.classList.remove('drop-target');
  }

  async executeMove(itemId, targetFork, targetElement) {
    try {
      // Update data model
      const item = STRAWMAP_DATA.items.find(i => i.id === itemId);
      const oldFork = item.currentFork;
      item.currentFork = targetFork;

      // Move DOM element
      targetElement.appendChild(this.draggedItem.element);
      
      // Update visual state
      this.updateItemVisuals(this.draggedItem.element, targetFork);

      // Save state for undo/redo
      window.stateManager?.saveState(`Moved ${item.name} from ${oldFork} to ${targetFork}`);

      // Update dependency visualization
      window.visualizationManager?.updateDependencyArrows();

      // Update analytics
      window.analyticsManager?.updateMetrics();

      // Show success message
      this.showMessage(`Moved ${item.name} to ${targetFork}`, 'success');

      console.log(`Successfully moved ${itemId} to ${targetFork}`);

      // Notify other systems
      window.dispatchEvent(new CustomEvent('itemMoved', {
        detail: { itemId, oldFork, newFork: targetFork }
      }));

    } catch (error) {
      console.error('Error executing move:', error);
      this.showMessage('Error moving item. Please try again.', 'warning');
      this.revertDrag();
    }
  }

  async showConflictModal(itemId, targetFork, conflicts) {
    return new Promise((resolve) => {
      const modal = document.getElementById('conflictModal');
      const detailsDiv = document.getElementById('conflictDetails');
      const autoResolveBtn = document.getElementById('autoResolveBtn');
      const proceedBtn = document.getElementById('proceedAnywayBtn');
      const cancelBtn = document.getElementById('cancelMoveBtn');

      const item = STRAWMAP_DATA.items.find(i => i.id === itemId);
      
      // Build conflict details
      let conflictHtml = `<p>Moving <strong>${item.name}</strong> to <strong>${targetFork}</strong> creates the following conflicts:</p><ul>`;
      
      conflicts.forEach(conflict => {
        if (conflict.type === 'dependency_after') {
          conflictHtml += `<li><strong>${conflict.itemName}</strong> (dependency) is scheduled in ${conflict.currentFork}, which comes after ${targetFork}</li>`;
        } else if (conflict.type === 'dependent_before') {
          conflictHtml += `<li><strong>${conflict.itemName}</strong> (dependent) is scheduled in ${conflict.currentFork}, which comes before ${targetFork}</li>`;
        }
      });
      
      conflictHtml += '</ul>';
      detailsDiv.innerHTML = conflictHtml;

      // Set up event handlers
      const handleAutoResolve = () => {
        this.autoResolveConflicts(itemId, targetFork, conflicts);
        modal.classList.remove('show');
        resolve();
      };

      const handleProceed = () => {
        this.executeMove(itemId, targetFork, document.querySelector(`[data-fork-id="${targetFork}"] [data-layer="${item.layer}"]`));
        modal.classList.remove('show');
        resolve();
      };

      const handleCancel = () => {
        this.revertDrag();
        modal.classList.remove('show');
        resolve();
      };

      // Bind events
      autoResolveBtn.onclick = handleAutoResolve;
      proceedBtn.onclick = handleProceed;
      cancelBtn.onclick = handleCancel;

      // Show modal
      modal.classList.add('show');
    });
  }

  autoResolveConflicts(itemId, targetFork, conflicts) {
    const moves = [{ itemId, targetFork }];
    const item = STRAWMAP_DATA.items.find(i => i.id === itemId);

    conflicts.forEach(conflict => {
      if (conflict.type === 'dependency_after') {
        // Move dependency to before target fork
        const targetIndex = STRAWMAP_DATA.forks.findIndex(f => f.id === targetFork);
        const newFork = STRAWMAP_DATA.forks[Math.max(0, targetIndex - 1)].id;
        moves.unshift({ itemId: conflict.itemId, targetFork: newFork });
      } else if (conflict.type === 'dependent_before') {
        // Move dependent to after target fork
        const targetIndex = STRAWMAP_DATA.forks.findIndex(f => f.id === targetFork);
        const newFork = STRAWMAP_DATA.forks[Math.min(STRAWMAP_DATA.forks.length - 1, targetIndex + 1)].id;
        moves.push({ itemId: conflict.itemId, targetFork: newFork });
      }
    });

    // Execute all moves
    moves.forEach(move => {
      const moveItem = STRAWMAP_DATA.items.find(i => i.id === move.itemId);
      const oldFork = moveItem.currentFork;
      moveItem.currentFork = move.targetFork;

      // Update DOM
      const itemElement = document.querySelector(`[data-item-id="${move.itemId}"]`);
      const targetSection = document.querySelector(`[data-fork-id="${move.targetFork}"] [data-layer="${moveItem.layer}"]`);
      
      if (itemElement && targetSection) {
        targetSection.appendChild(itemElement);
        this.updateItemVisuals(itemElement, move.targetFork);
      }
    });

    // Update everything
    window.visualizationManager?.updateDependencyArrows();
    window.analyticsManager?.updateMetrics();
    window.stateManager?.saveState(`Auto-resolved conflicts for moving ${item.name}`);

    this.showMessage(`Auto-resolved conflicts and moved ${moves.length} items`, 'success');
  }

  revertDrag() {
    if (this.originalPosition && this.draggedItem) {
      // Move element back to original position
      if (this.originalPosition.nextSibling) {
        this.originalPosition.parent.insertBefore(
          this.draggedItem.element, 
          this.originalPosition.nextSibling
        );
      } else {
        this.originalPosition.parent.appendChild(this.draggedItem.element);
      }
    }
  }

  highlightDropTargets() {
    if (!this.draggedItem) return;

    const itemLayer = this.draggedItem.originalLayer;
    const layerSections = document.querySelectorAll(`[data-layer="${itemLayer}"]`);
    
    layerSections.forEach(section => {
      section.classList.add('valid-drop-target');
    });
  }

  removeDropTargetHighlights() {
    document.querySelectorAll('.drop-target, .valid-drop-target').forEach(el => {
      el.classList.remove('drop-target', 'valid-drop-target');
    });
  }

  updateItemVisuals(element, newFork) {
    // Update any fork-specific styling
    element.dataset.currentFork = newFork;
    
    // Add animation class for smooth transition
    element.classList.add('fade-in');
    setTimeout(() => {
      element.classList.remove('fade-in');
    }, 300);
  }

  showMessage(message, type = 'info') {
    const statusElement = document.getElementById('statusMessage');
    if (statusElement) {
      statusElement.textContent = message;
      statusElement.className = `status-message ${type}`;
      
      // Clear message after 3 seconds
      setTimeout(() => {
        statusElement.textContent = '';
        statusElement.className = 'status-message';
      }, 3000);
    }
  }

  // Public methods for external control
  enableDrag(itemId) {
    const element = document.querySelector(`[data-item-id="${itemId}"]`);
    if (element) {
      element.draggable = true;
      element.style.cursor = 'grab';
    }
  }

  disableDrag(itemId) {
    const element = document.querySelector(`[data-item-id="${itemId}"]`);
    if (element) {
      element.draggable = false;
      element.style.cursor = 'default';
    }
  }

  enableAllDrag() {
    document.querySelectorAll('.roadmap-item').forEach(item => {
      item.draggable = true;
      item.style.cursor = 'grab';
    });
  }

  disableAllDrag() {
    document.querySelectorAll('.roadmap-item').forEach(item => {
      item.draggable = false;
      item.style.cursor = 'default';
    });
  }
}

// Initialize the drag-drop manager when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  window.dragDropManager = new DragDropManager();
});