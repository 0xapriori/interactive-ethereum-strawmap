// Visualization Manager for Dependency Arrows and Visual Effects
class VisualizationManager {
  constructor() {
    this.svg = null;
    this.arrowGroup = null;
    this.defs = null;
    this.arrows = new Map();
    this.animationFrameId = null;
    
    this.initializeSVG();
    this.createArrowMarkers();
    this.bindEvents();
  }

  initializeSVG() {
    this.svg = document.getElementById('dependencyOverlay');
    if (!this.svg) {
      console.error('Dependency overlay SVG not found');
      return;
    }

    // Create main group for arrows
    this.arrowGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.arrowGroup.setAttribute('class', 'arrows');
    this.svg.appendChild(this.arrowGroup);

    // Resize SVG to match container
    this.resizeSVG();
  }

  createArrowMarkers() {
    // Create defs section for arrow markers
    this.defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    this.svg.appendChild(this.defs);

    // Standard arrow marker
    const arrowMarker = this.createMarker('arrowhead', '#666666');
    this.defs.appendChild(arrowMarker);

    // Critical path arrow marker
    const criticalArrowMarker = this.createMarker('arrowhead-critical', '#dc3545');
    this.defs.appendChild(criticalArrowMarker);

    // Conflict arrow marker
    const conflictArrowMarker = this.createMarker('arrowhead-conflict', '#ff6b35');
    this.defs.appendChild(conflictArrowMarker);
  }

  createMarker(id, color) {
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', id);
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '7');
    marker.setAttribute('refX', '9');
    marker.setAttribute('refY', '3.5');
    marker.setAttribute('orient', 'auto');
    marker.setAttribute('markerUnits', 'strokeWidth');

    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
    polygon.setAttribute('fill', color);

    marker.appendChild(polygon);
    return marker;
  }

  bindEvents() {
    window.addEventListener('resize', this.resizeSVG.bind(this));
    window.addEventListener('itemMoved', this.handleItemMoved.bind(this));
    window.addEventListener('itemDragStart', this.handleDragStart.bind(this));
    window.addEventListener('itemDragEnd', this.handleDragEnd.bind(this));
    
    // Update arrows when DOM changes
    const observer = new MutationObserver(() => {
      this.scheduleArrowUpdate();
    });
    
    observer.observe(document.querySelector('.roadmap-grid'), {
      childList: true,
      subtree: true
    });
  }

  resizeSVG() {
    if (!this.svg) return;
    
    const container = this.svg.parentElement;
    const rect = container.getBoundingClientRect();
    
    this.svg.setAttribute('width', rect.width);
    this.svg.setAttribute('height', rect.height);
  }

  scheduleArrowUpdate() {
    // Debounce arrow updates to avoid excessive redraws
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    this.animationFrameId = requestAnimationFrame(() => {
      this.updateDependencyArrows();
    });
  }

  updateDependencyArrows() {
    if (!this.arrowGroup) return;

    // Clear existing arrows
    this.arrowGroup.innerHTML = '';
    this.arrows.clear();

    // Get critical path items if enabled
    const showCriticalPath = document.getElementById('showCriticalPath')?.checked;
    const criticalItems = showCriticalPath ? new Set(
      DataUtils.getCriticalPathItems().slice(0, 5).map(item => item.id)
    ) : new Set();

    // Draw arrows for all dependencies
    STRAWMAP_DATA.items.forEach(item => {
      item.dependencies.forEach(depId => {
        this.drawDependencyArrow(depId, item.id, criticalItems);
      });
    });
  }

  drawDependencyArrow(fromId, toId, criticalItems = new Set()) {
    const fromElement = document.querySelector(`[data-item-id="${fromId}"]`);
    const toElement = document.querySelector(`[data-item-id="${toId}"]`);
    
    if (!fromElement || !toElement) return;

    const fromRect = this.getElementPosition(fromElement);
    const toRect = this.getElementPosition(toElement);
    
    if (!fromRect || !toRect) return;

    // Calculate connection points
    const fromPoint = {
      x: fromRect.right,
      y: fromRect.top + fromRect.height / 2
    };
    
    const toPoint = {
      x: toRect.left,
      y: toRect.top + toRect.height / 2
    };

    // Check if this creates a conflict
    const fromItem = STRAWMAP_DATA.items.find(i => i.id === fromId);
    const toItem = STRAWMAP_DATA.items.find(i => i.id === toId);
    const hasConflict = this.checkArrowConflict(fromItem, toItem);

    // Determine arrow style
    const isCritical = criticalItems.has(fromId) || criticalItems.has(toId);
    const arrowClass = hasConflict ? 'conflict' : (isCritical ? 'critical-path' : 'normal');
    const markerId = hasConflict ? 'arrowhead-conflict' : (isCritical ? 'arrowhead-critical' : 'arrowhead');

    // Create arrow path
    const path = this.createArrowPath(fromPoint, toPoint, arrowClass, markerId);
    this.arrowGroup.appendChild(path);
    
    // Store arrow reference
    this.arrows.set(`${fromId}-${toId}`, {
      element: path,
      from: fromId,
      to: toId,
      hasConflict,
      isCritical
    });
  }

  createArrowPath(from, to, className, markerId) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    
    // Calculate curved path for better visualization
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    
    let pathData;
    if (Math.abs(dx) > 50) {
      // Long distance - use curved path
      const controlX1 = from.x + dx * 0.3;
      const controlY1 = from.y;
      const controlX2 = to.x - dx * 0.3;
      const controlY2 = to.y;
      
      pathData = `M ${from.x} ${from.y} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${to.x - 10} ${to.y}`;
    } else {
      // Short distance - use straight line
      pathData = `M ${from.x} ${from.y} L ${to.x - 10} ${to.y}`;
    }
    
    path.setAttribute('d', pathData);
    path.setAttribute('class', `dependency-arrow ${className}`);
    path.setAttribute('marker-end', `url(#${markerId})`);
    
    // Add hover effects
    path.addEventListener('mouseenter', () => {
      this.highlightDependency(path.dataset.from, path.dataset.to);
    });
    
    path.addEventListener('mouseleave', () => {
      this.clearDependencyHighlight();
    });
    
    // Store reference data
    path.dataset.from = this.arrows.has(from.id) ? from.id : '';
    path.dataset.to = this.arrows.has(to.id) ? to.id : '';
    
    return path;
  }

  checkArrowConflict(fromItem, toItem) {
    if (!fromItem || !toItem) return false;
    
    const fromForkIndex = STRAWMAP_DATA.forks.findIndex(f => f.id === fromItem.currentFork);
    const toForkIndex = STRAWMAP_DATA.forks.findIndex(f => f.id === toItem.currentFork);
    
    // Conflict if dependency is scheduled after dependent
    return fromForkIndex > toForkIndex;
  }

  getElementPosition(element) {
    const rect = element.getBoundingClientRect();
    const containerRect = this.svg.getBoundingClientRect();
    
    return {
      left: rect.left - containerRect.left,
      right: rect.right - containerRect.left,
      top: rect.top - containerRect.top,
      bottom: rect.bottom - containerRect.top,
      width: rect.width,
      height: rect.height
    };
  }

  highlightDependency(fromId, toId) {
    // Highlight the connected items
    const fromElement = document.querySelector(`[data-item-id="${fromId}"]`);
    const toElement = document.querySelector(`[data-item-id="${toId}"]`);
    
    if (fromElement) fromElement.classList.add('dependency-highlight');
    if (toElement) toElement.classList.add('dependency-highlight');
    
    // Show dependency info
    const fromItem = STRAWMAP_DATA.items.find(i => i.id === fromId);
    const toItem = STRAWMAP_DATA.items.find(i => i.id === toId);
    
    if (fromItem && toItem) {
      this.showDependencyTooltip(fromItem, toItem);
    }
  }

  clearDependencyHighlight() {
    document.querySelectorAll('.dependency-highlight').forEach(el => {
      el.classList.remove('dependency-highlight');
    });
    
    this.hideDependencyTooltip();
  }

  showDependencyTooltip(fromItem, toItem) {
    const statusElement = document.getElementById('statusMessage');
    if (statusElement) {
      const conflict = this.checkArrowConflict(fromItem, toItem);
      const message = conflict 
        ? `⚠️ Conflict: ${toItem.name} depends on ${fromItem.name} (scheduled after)`
        : `${toItem.name} depends on ${fromItem.name}`;
      
      statusElement.textContent = message;
      statusElement.className = `status-message ${conflict ? 'warning' : 'info'}`;
    }
  }

  hideDependencyTooltip() {
    const statusElement = document.getElementById('statusMessage');
    if (statusElement) {
      setTimeout(() => {
        statusElement.textContent = '';
        statusElement.className = 'status-message';
      }, 100);
    }
  }

  handleItemMoved(event) {
    // Update arrows when items are moved
    this.scheduleArrowUpdate();
  }

  handleDragStart(event) {
    const itemId = event.detail.itemId;
    
    // Highlight all related dependencies during drag
    const allDependencies = DataUtils.getItemDependencies(itemId);
    const allDependents = DataUtils.getItemDependents(itemId);
    
    [...allDependencies, ...allDependents].forEach(relatedId => {
      const element = document.querySelector(`[data-item-id="${relatedId}"]`);
      if (element) {
        element.classList.add('dependency-highlight');
      }
    });
  }

  handleDragEnd(event) {
    // Clear dependency highlights
    this.clearDependencyHighlight();
  }

  // Animation effects
  animateArrowCreation(arrow) {
    arrow.style.strokeDasharray = '5 5';
    arrow.style.strokeDashoffset = '10';
    arrow.style.animation = 'dash 2s linear infinite';
  }

  pulseConflictArrows() {
    document.querySelectorAll('.dependency-arrow.conflict').forEach(arrow => {
      arrow.style.animation = 'pulse 1.5s ease-in-out infinite';
    });
  }

  // Public interface
  showCriticalPath(enabled) {
    if (enabled) {
      this.updateDependencyArrows();
    } else {
      // Remove critical path styling
      document.querySelectorAll('.dependency-arrow.critical-path').forEach(arrow => {
        arrow.classList.remove('critical-path');
        arrow.setAttribute('marker-end', 'url(#arrowhead)');
      });
    }
  }

  exportVisualization() {
    // Return SVG as string for export
    const serializer = new XMLSerializer();
    return serializer.serializeToString(this.svg);
  }
}

// Initialize visualization manager
window.addEventListener('DOMContentLoaded', () => {
  window.visualizationManager = new VisualizationManager();
});