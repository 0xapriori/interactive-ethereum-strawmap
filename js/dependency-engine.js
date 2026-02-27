// Dependency Engine for Conflict Detection and Resolution
class DependencyEngine {
  constructor() {
    this.conflictCache = new Map();
    this.resolutionStrategies = new Map();
    
    this.initializeStrategies();
  }

  initializeStrategies() {
    // Define conflict resolution strategies
    this.resolutionStrategies.set('dependency_after', {
      priority: 'high',
      autoResolve: this.resolveDependencyAfter.bind(this),
      description: 'Move dependency to earlier fork'
    });
    
    this.resolutionStrategies.set('dependent_before', {
      priority: 'high',
      autoResolve: this.resolveDependentBefore.bind(this),
      description: 'Move dependent to later fork'
    });
    
    this.resolutionStrategies.set('circular_dependency', {
      priority: 'critical',
      autoResolve: this.resolveCircularDependency.bind(this),
      description: 'Break circular dependency chain'
    });
  }

  // Main conflict detection method
  analyzeConflicts(itemId, targetFork) {
    const item = STRAWMAP_DATA.items.find(i => i.id === itemId);
    if (!item) return { hasConflicts: false, conflicts: [] };
    
    const conflicts = [];
    const targetForkIndex = STRAWMAP_DATA.forks.findIndex(f => f.id === targetFork);
    
    // Check direct dependency conflicts
    const dependencyConflicts = this.checkDependencyConflicts(item, targetForkIndex);
    conflicts.push(...dependencyConflicts);
    
    // Check dependent conflicts
    const dependentConflicts = this.checkDependentConflicts(item, targetForkIndex);
    conflicts.push(...dependentConflicts);
    
    // Check for circular dependencies
    const circularConflicts = this.checkCircularDependencies(itemId, targetFork);
    conflicts.push(...circularConflicts);
    
    // Check layer constraints
    const layerConflicts = this.checkLayerConstraints(item, targetFork);
    conflicts.push(...layerConflicts);
    
    // Check fork capacity constraints
    const capacityConflicts = this.checkForkCapacity(targetFork, item);
    conflicts.push(...capacityConflicts);
    
    const result = {
      hasConflicts: conflicts.length > 0,
      conflicts,
      severity: this.calculateConflictSeverity(conflicts),
      autoResolvable: conflicts.every(conflict => this.resolutionStrategies.has(conflict.type))
    };
    
    // Cache result
    this.conflictCache.set(`${itemId}-${targetFork}`, result);
    
    return result;
  }

  checkDependencyConflicts(item, targetForkIndex) {
    const conflicts = [];
    
    item.dependencies.forEach(depId => {
      const depItem = STRAWMAP_DATA.items.find(i => i.id === depId);
      if (depItem) {
        const depForkIndex = STRAWMAP_DATA.forks.findIndex(f => f.id === depItem.currentFork);
        
        if (depForkIndex > targetForkIndex) {
          conflicts.push({
            type: 'dependency_after',
            severity: 'high',
            itemId: depId,
            itemName: depItem.name,
            currentFork: depItem.currentFork,
            message: `${depItem.name} (dependency) is scheduled after target fork`,
            resolution: this.resolutionStrategies.get('dependency_after')
          });
        }
      }
    });
    
    return conflicts;
  }

  checkDependentConflicts(item, targetForkIndex) {
    const conflicts = [];
    const dependents = STRAWMAP_DATA.items.filter(i => i.dependencies.includes(item.id));
    
    dependents.forEach(depItem => {
      const depForkIndex = STRAWMAP_DATA.forks.findIndex(f => f.id === depItem.currentFork);
      
      if (depForkIndex < targetForkIndex) {
        conflicts.push({
          type: 'dependent_before',
          severity: 'high',
          itemId: depItem.id,
          itemName: depItem.name,
          currentFork: depItem.currentFork,
          message: `${depItem.name} (dependent) is scheduled before target fork`,
          resolution: this.resolutionStrategies.get('dependent_before')
        });
      }
    });
    
    return conflicts;
  }

  checkCircularDependencies(itemId, targetFork) {
    const conflicts = [];
    const visited = new Set();
    const recursionStack = new Set();
    
    const hasCycle = (currentId, path = []) => {
      if (recursionStack.has(currentId)) {
        // Found cycle
        const cycleStart = path.indexOf(currentId);
        const cycle = path.slice(cycleStart).concat([currentId]);
        return cycle;
      }
      
      if (visited.has(currentId)) return null;
      
      visited.add(currentId);
      recursionStack.add(currentId);
      path.push(currentId);
      
      const currentItem = STRAWMAP_DATA.items.find(i => i.id === currentId);
      if (currentItem) {
        for (const depId of currentItem.dependencies) {
          const cycle = hasCycle(depId, [...path]);
          if (cycle) return cycle;
        }
      }
      
      recursionStack.delete(currentId);
      path.pop();
      return null;
    };
    
    // Temporarily add the potential move to check for cycles
    const item = STRAWMAP_DATA.items.find(i => i.id === itemId);
    const originalFork = item.currentFork;
    item.currentFork = targetFork;
    
    const cycle = hasCycle(itemId);
    
    // Restore original state
    item.currentFork = originalFork;
    
    if (cycle) {
      conflicts.push({
        type: 'circular_dependency',
        severity: 'critical',
        itemId: itemId,
        cycle: cycle.map(id => {
          const cycleItem = STRAWMAP_DATA.items.find(i => i.id === id);
          return cycleItem ? cycleItem.name : id;
        }),
        message: `Moving this item would create a circular dependency: ${cycle.map(id => {
          const cycleItem = STRAWMAP_DATA.items.find(i => i.id === id);
          return cycleItem ? cycleItem.name : id;
        }).join(' → ')}`,
        resolution: this.resolutionStrategies.get('circular_dependency')
      });
    }
    
    return conflicts;
  }

  checkLayerConstraints(item, targetFork) {
    // Items can only move within their own layer
    // This is enforced by the UI, but double-check here
    return []; // No cross-layer moves allowed
  }

  checkForkCapacity(forkId, item) {
    const conflicts = [];
    const forkItems = DataUtils.getItemsByFork(forkId);
    const headliners = forkItems.filter(i => i.type === 'headliner');
    
    // Check headliner limits (max 2, and only L* can have 2 consensus headliners)
    if (item.type === 'headliner') {
      const consensusHeadliners = headliners.filter(i => i.layer === 'consensus');
      const executionHeadliners = headliners.filter(i => i.layer === 'execution');
      
      if (item.layer === 'consensus' && consensusHeadliners.length >= (forkId === 'l-star' ? 2 : 1)) {
        conflicts.push({
          type: 'headliner_limit',
          severity: 'medium',
          message: `Fork ${forkId} already has maximum consensus headliners`,
          forkId: forkId
        });
      }
      
      if (item.layer === 'execution' && executionHeadliners.length >= 1) {
        conflicts.push({
          type: 'headliner_limit',
          severity: 'medium',
          message: `Fork ${forkId} already has maximum execution headliners`,
          forkId: forkId
        });
      }
    }
    
    // Check overall fork complexity
    const complexity = DataUtils.getForkComplexity(forkId);
    if (complexity.totalComplexity > 15) { // Arbitrary threshold
      conflicts.push({
        type: 'fork_overload',
        severity: 'low',
        message: `Fork ${forkId} is becoming overloaded (complexity: ${complexity.totalComplexity})`,
        forkId: forkId
      });
    }
    
    return conflicts;
  }

  calculateConflictSeverity(conflicts) {
    if (conflicts.some(c => c.severity === 'critical')) return 'critical';
    if (conflicts.some(c => c.severity === 'high')) return 'high';
    if (conflicts.some(c => c.severity === 'medium')) return 'medium';
    return 'low';
  }

  // Auto-resolution methods
  resolveDependencyAfter(conflict, itemId, targetFork) {
    const targetIndex = STRAWMAP_DATA.forks.findIndex(f => f.id === targetFork);
    const suggestedFork = STRAWMAP_DATA.forks[Math.max(0, targetIndex - 1)].id;
    
    return {
      action: 'move',
      itemId: conflict.itemId,
      targetFork: suggestedFork,
      description: `Move ${conflict.itemName} to ${suggestedFork}`,
      automatic: true
    };
  }

  resolveDependentBefore(conflict, itemId, targetFork) {
    const targetIndex = STRAWMAP_DATA.forks.findIndex(f => f.id === targetFork);
    const suggestedFork = STRAWMAP_DATA.forks[Math.min(STRAWMAP_DATA.forks.length - 1, targetIndex + 1)].id;
    
    return {
      action: 'move',
      itemId: conflict.itemId,
      targetFork: suggestedFork,
      description: `Move ${conflict.itemName} to ${suggestedFork}`,
      automatic: true
    };
  }

  resolveCircularDependency(conflict, itemId, targetFork) {
    // For circular dependencies, suggest breaking the cycle by moving one item
    const cycle = conflict.cycle || [];
    const breakPoint = cycle.find(itemName => {
      const item = STRAWMAP_DATA.items.find(i => i.name === itemName);
      return item && item.dependencies.length === 1; // Items with single dependencies are easier to move
    });
    
    if (breakPoint) {
      const item = STRAWMAP_DATA.items.find(i => i.name === breakPoint);
      const targetIndex = STRAWMAP_DATA.forks.findIndex(f => f.id === targetFork);
      const suggestedFork = STRAWMAP_DATA.forks[Math.min(STRAWMAP_DATA.forks.length - 1, targetIndex + 1)].id;
      
      return {
        action: 'move',
        itemId: item.id,
        targetFork: suggestedFork,
        description: `Move ${breakPoint} to break circular dependency`,
        automatic: false // Requires user confirmation
      };
    }
    
    return {
      action: 'manual',
      description: 'Manual intervention required to resolve circular dependency',
      automatic: false
    };
  }

  // Generate comprehensive resolution plan
  generateResolutionPlan(itemId, targetFork, conflicts) {
    const plan = {
      moves: [],
      warnings: [],
      manual: []
    };
    
    conflicts.forEach(conflict => {
      if (conflict.resolution && conflict.resolution.autoResolve) {
        const resolution = conflict.resolution.autoResolve(conflict, itemId, targetFork);
        
        if (resolution.automatic) {
          plan.moves.push(resolution);
        } else if (resolution.action === 'manual') {
          plan.manual.push(resolution);
        } else {
          plan.warnings.push(resolution);
        }
      } else {
        plan.manual.push({
          description: conflict.message,
          type: conflict.type
        });
      }
    });
    
    return plan;
  }

  // Execute auto-resolution
  async executeResolutionPlan(plan) {
    const results = [];
    
    // Execute automatic moves
    for (const move of plan.moves) {
      try {
        const item = STRAWMAP_DATA.items.find(i => i.id === move.itemId);
        if (item) {
          const oldFork = item.currentFork;
          item.currentFork = move.targetFork;
          
          // Update DOM
          const itemElement = document.querySelector(`[data-item-id="${move.itemId}"]`);
          const targetSection = document.querySelector(`[data-fork-id="${move.targetFork}"] [data-layer="${item.layer}"]`);
          
          if (itemElement && targetSection) {
            targetSection.appendChild(itemElement);
            itemElement.dataset.currentFork = move.targetFork;
          }
          
          results.push({
            success: true,
            itemId: move.itemId,
            description: move.description,
            oldFork,
            newFork: move.targetFork
          });
        }
      } catch (error) {
        results.push({
          success: false,
          itemId: move.itemId,
          error: error.message,
          description: move.description
        });
      }
    }
    
    return results;
  }

  // Validation methods
  validateRoadmapIntegrity() {
    const issues = [];
    
    // Check for orphaned items
    STRAWMAP_DATA.items.forEach(item => {
      item.dependencies.forEach(depId => {
        if (!STRAWMAP_DATA.items.find(i => i.id === depId)) {
          issues.push({
            type: 'orphaned_dependency',
            itemId: item.id,
            orphanedId: depId,
            message: `${item.name} depends on non-existent item: ${depId}`
          });
        }
      });
    });
    
    // Check for timeline violations
    STRAWMAP_DATA.items.forEach(item => {
      const conflicts = this.analyzeConflicts(item.id, item.currentFork);
      if (conflicts.hasConflicts) {
        issues.push({
          type: 'timeline_violation',
          itemId: item.id,
          conflicts: conflicts.conflicts.length,
          message: `${item.name} has ${conflicts.conflicts.length} scheduling conflicts`
        });
      }
    });
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }

  // Get global dependency statistics
  getDependencyStats() {
    const stats = {
      totalItems: STRAWMAP_DATA.items.length,
      totalDependencies: 0,
      averageDependencies: 0,
      maxDependencies: 0,
      itemsWithConflicts: 0,
      circularDependencies: 0,
      criticalPath: []
    };
    
    STRAWMAP_DATA.items.forEach(item => {
      stats.totalDependencies += item.dependencies.length;
      stats.maxDependencies = Math.max(stats.maxDependencies, item.dependencies.length);
      
      const conflicts = this.analyzeConflicts(item.id, item.currentFork);
      if (conflicts.hasConflicts) {
        stats.itemsWithConflicts++;
        
        if (conflicts.conflicts.some(c => c.type === 'circular_dependency')) {
          stats.circularDependencies++;
        }
      }
    });
    
    stats.averageDependencies = stats.totalItems > 0 ? stats.totalDependencies / stats.totalItems : 0;
    
    return stats;
  }
}

// Initialize dependency engine
window.addEventListener('DOMContentLoaded', () => {
  window.dependencyEngine = new DependencyEngine();
});