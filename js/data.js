// Ethereum Strawmap Data Model
// Based on the official strawmap.org roadmap structure

const STRAWMAP_DATA = {
  // Fork timeline with rough 6-month cadence through 2029
  forks: [
    { id: 'electra', name: 'Electra', year: 2025, status: 'active' },
    { id: 'fulu', name: 'Fulu', year: 2025, status: 'planned' },
    { id: 'glamsterdam', name: 'Glamsterdam', year: 2026, status: 'planned' },
    { id: 'hegota', name: 'Hegotá', year: 2026, status: 'planned' },
    { id: 'i-star', name: 'I*', year: 2027, status: 'future' },
    { id: 'j-star', name: 'J*', year: 2028, status: 'future' },
    { id: 'k-star', name: 'K*', year: 2029, status: 'future' },
    { id: 'l-star', name: 'L*', year: 2029, status: 'future' }
  ],

  // Three core layers of the Ethereum protocol
  layers: [
    { id: 'consensus', name: 'Consensus Layer', color: '#4a90e2' },
    { id: 'data', name: 'Data Layer', color: '#7b68ee' },
    { id: 'execution', name: 'Execution Layer', color: '#50c878' }
  ],

  // Five North Stars - long-term strategic goals
  northStars: [
    {
      id: 'fast-l1',
      name: 'fast L1',
      description: 'transaction inclusion and chain finality in seconds',
      layer: 'consensus',
      targetFork: 'l-star'
    },
    {
      id: 'gigagas-l1',
      name: 'gigagas L1',
      description: '1 gigagas/sec (10K TPS) at L1, via zkEVMs and real-time proving',
      layer: 'execution',
      targetFork: 'l-star'
    },
    {
      id: 'teragas-l2',
      name: 'teragas L2',
      description: '1 gigabyte/sec (10M TPS) at L2, via data availability sampling',
      layer: 'data',
      targetFork: 'k-star'
    },
    {
      id: 'post-quantum-l1',
      name: 'post quantum L1',
      description: 'centuries-long cryptographic security, via hash-based schemes',
      layer: 'consensus',
      targetFork: 'j-star'
    },
    {
      id: 'private-l1',
      name: 'private L1',
      description: 'privacy as a first-class citizen, via L1 shielded transfers',
      layer: 'execution',
      targetFork: 'k-star'
    }
  ],

  // Roadmap items with dependencies based on strawmap.org
  items: [
    // Electra fork items
    {
      id: 'peerdasv1',
      name: 'PeerDAS v1',
      description: 'Peer-based Data Availability Sampling',
      layer: 'data',
      originalFork: 'electra',
      currentFork: 'electra',
      type: 'regular',
      dependencies: [],
      complexity: 'medium'
    },
    {
      id: 'inclusion-lists',
      name: 'Inclusion Lists',
      description: 'Censorship resistance mechanism',
      layer: 'consensus',
      originalFork: 'electra',
      currentFork: 'electra',
      type: 'regular',
      dependencies: [],
      complexity: 'medium'
    },

    // Fulu fork items
    {
      id: 'verkle-trees',
      name: 'Verkle Trees',
      description: 'Improved state tree structure',
      layer: 'execution',
      originalFork: 'fulu',
      currentFork: 'fulu',
      type: 'headliner',
      dependencies: [],
      complexity: 'high'
    },
    {
      id: 'das-extension',
      name: 'DAS Extension',
      description: 'Extended Data Availability Sampling',
      layer: 'data',
      originalFork: 'fulu',
      currentFork: 'fulu',
      type: 'regular',
      dependencies: ['peerdasv1'],
      complexity: 'medium'
    },

    // Glamsterdam fork items (explicit headliners from strawmap)
    {
      id: 'epbs',
      name: 'ePBS',
      description: 'Enshrined Proposer-Builder Separation',
      layer: 'consensus',
      originalFork: 'glamsterdam',
      currentFork: 'glamsterdam',
      type: 'headliner',
      dependencies: ['inclusion-lists'],
      complexity: 'high'
    },
    {
      id: 'bals',
      name: 'BALs',
      description: 'Block-level Access Lists',
      layer: 'execution',
      originalFork: 'glamsterdam',
      currentFork: 'glamsterdam',
      type: 'headliner',
      dependencies: ['verkle-trees'],
      complexity: 'high'
    },
    {
      id: 'slot-time-reduction',
      name: '6s Slot Times',
      description: 'Reduce slot times from 12s to 6s',
      layer: 'consensus',
      originalFork: 'glamsterdam',
      currentFork: 'glamsterdam',
      type: 'regular',
      dependencies: [],
      complexity: 'medium'
    },

    // Hegotá fork items (post-quantum focus)
    {
      id: 'hash-based-sigs',
      name: 'Hash-based Signatures',
      description: 'Quantum-resistant signature schemes',
      layer: 'consensus',
      originalFork: 'hegota',
      currentFork: 'hegota',
      type: 'regular',
      dependencies: [],
      complexity: 'high'
    },
    {
      id: 'lattice-cryptography',
      name: 'Lattice Cryptography',
      description: 'Post-quantum cryptographic primitives',
      layer: 'execution',
      originalFork: 'hegota',
      currentFork: 'hegota',
      type: 'regular',
      dependencies: [],
      complexity: 'high'
    },

    // I* fork items
    {
      id: '4s-slot-times',
      name: '4s Slot Times',
      description: 'Further slot time reduction',
      layer: 'consensus',
      originalFork: 'i-star',
      currentFork: 'i-star',
      type: 'regular',
      dependencies: ['slot-time-reduction'],
      complexity: 'medium'
    },
    {
      id: 'zkevms-v1',
      name: 'zkEVMs v1',
      description: 'Zero-knowledge Ethereum Virtual Machines',
      layer: 'execution',
      originalFork: 'i-star',
      currentFork: 'i-star',
      type: 'regular',
      dependencies: ['bals', 'lattice-cryptography'],
      complexity: 'very-high'
    },
    {
      id: 'full-das',
      name: 'Full DAS',
      description: 'Complete Data Availability Sampling implementation',
      layer: 'data',
      originalFork: 'i-star',
      currentFork: 'i-star',
      type: 'regular',
      dependencies: ['das-extension'],
      complexity: 'high'
    },

    // J* fork items
    {
      id: '2s-slot-times',
      name: '2s Slot Times',
      description: 'Minimum viable slot time',
      layer: 'consensus',
      originalFork: 'j-star',
      currentFork: 'j-star',
      type: 'regular',
      dependencies: ['4s-slot-times', 'epbs'],
      complexity: 'high'
    },
    {
      id: 'quantum-secure-consensus',
      name: 'Quantum-Secure Consensus',
      description: 'Full post-quantum consensus layer',
      layer: 'consensus',
      originalFork: 'j-star',
      currentFork: 'j-star',
      type: 'headliner',
      dependencies: ['hash-based-sigs'],
      complexity: 'very-high'
    },
    {
      id: 'real-time-proving',
      name: 'Real-time Proving',
      description: 'Instant zkEVM proof generation',
      layer: 'execution',
      originalFork: 'j-star',
      currentFork: 'j-star',
      type: 'regular',
      dependencies: ['zkevms-v1'],
      complexity: 'very-high'
    },

    // K* fork items
    {
      id: 'shielded-transfers',
      name: 'Shielded Transfers',
      description: 'Native privacy for L1 transactions',
      layer: 'execution',
      originalFork: 'k-star',
      currentFork: 'k-star',
      type: 'headliner',
      dependencies: ['real-time-proving', 'quantum-secure-consensus'],
      complexity: 'very-high'
    },
    {
      id: 'teragas-bandwidth',
      name: 'Teragas Bandwidth',
      description: '1GB/s data throughput capability',
      layer: 'data',
      originalFork: 'k-star',
      currentFork: 'k-star',
      type: 'regular',
      dependencies: ['full-das'],
      complexity: 'very-high'
    },

    // L* fork items (exceptional case with two headliners)
    {
      id: 'lean-consensus-v1',
      name: 'Lean Consensus v1',
      description: 'Streamlined consensus mechanism',
      layer: 'consensus',
      originalFork: 'l-star',
      currentFork: 'l-star',
      type: 'headliner',
      dependencies: ['2s-slot-times', 'quantum-secure-consensus'],
      complexity: 'very-high'
    },
    {
      id: 'lean-consensus-v2',
      name: 'Lean Consensus v2',
      description: 'Fully optimized consensus layer',
      layer: 'consensus',
      originalFork: 'l-star',
      currentFork: 'l-star',
      type: 'headliner',
      dependencies: ['lean-consensus-v1'],
      complexity: 'very-high'
    },
    {
      id: 'gigagas-execution',
      name: 'Gigagas Execution',
      description: '1 gigagas/sec execution capability',
      layer: 'execution',
      originalFork: 'l-star',
      currentFork: 'l-star',
      type: 'regular',
      dependencies: ['shielded-transfers', 'lean-consensus-v2'],
      complexity: 'very-high'
    }
  ]
};

// Utility functions for data manipulation
const DataUtils = {
  // Get all items for a specific fork and layer
  getItemsByForkAndLayer(forkId, layerId) {
    return STRAWMAP_DATA.items.filter(item => 
      item.currentFork === forkId && item.layer === layerId
    );
  },

  // Get all items for a specific fork
  getItemsByFork(forkId) {
    return STRAWMAP_DATA.items.filter(item => item.currentFork === forkId);
  },

  // Get all dependencies for an item (recursive)
  getItemDependencies(itemId, visited = new Set()) {
    if (visited.has(itemId)) return []; // Prevent circular dependencies
    
    const item = STRAWMAP_DATA.items.find(i => i.id === itemId);
    if (!item) return [];
    
    visited.add(itemId);
    let allDependencies = [...item.dependencies];
    
    // Recursively get dependencies of dependencies
    item.dependencies.forEach(depId => {
      allDependencies = allDependencies.concat(
        this.getItemDependencies(depId, visited)
      );
    });
    
    return [...new Set(allDependencies)]; // Remove duplicates
  },

  // Get all items that depend on this item (recursive)
  getItemDependents(itemId, visited = new Set()) {
    if (visited.has(itemId)) return [];
    
    visited.add(itemId);
    const directDependents = STRAWMAP_DATA.items.filter(item =>
      item.dependencies.includes(itemId)
    ).map(item => item.id);
    
    let allDependents = [...directDependents];
    
    // Recursively get dependents of dependents
    directDependents.forEach(depId => {
      allDependents = allDependents.concat(
        this.getItemDependents(depId, visited)
      );
    });
    
    return [...new Set(allDependents)];
  },

  // Check if moving an item would create conflicts
  checkMoveConflicts(itemId, targetFork) {
    const item = STRAWMAP_DATA.items.find(i => i.id === itemId);
    if (!item) return { hasConflicts: false, conflicts: [] };
    
    const targetForkIndex = STRAWMAP_DATA.forks.findIndex(f => f.id === targetFork);
    const conflicts = [];
    
    // Check if dependencies are scheduled after target fork
    item.dependencies.forEach(depId => {
      const depItem = STRAWMAP_DATA.items.find(i => i.id === depId);
      if (depItem) {
        const depForkIndex = STRAWMAP_DATA.forks.findIndex(f => f.id === depItem.currentFork);
        if (depForkIndex > targetForkIndex) {
          conflicts.push({
            type: 'dependency_after',
            itemId: depId,
            itemName: depItem.name,
            currentFork: depItem.currentFork
          });
        }
      }
    });
    
    // Check if dependents are scheduled before target fork
    const dependents = STRAWMAP_DATA.items.filter(i => 
      i.dependencies.includes(itemId)
    );
    
    dependents.forEach(depItem => {
      const depForkIndex = STRAWMAP_DATA.forks.findIndex(f => f.id === depItem.currentFork);
      if (depForkIndex < targetForkIndex) {
        conflicts.push({
          type: 'dependent_before',
          itemId: depItem.id,
          itemName: depItem.name,
          currentFork: depItem.currentFork
        });
      }
    });
    
    return {
      hasConflicts: conflicts.length > 0,
      conflicts
    };
  },

  // Get fork complexity metrics
  getForkComplexity(forkId) {
    const items = this.getItemsByFork(forkId);
    const complexityWeights = {
      'low': 1,
      'medium': 2,
      'high': 3,
      'very-high': 4
    };
    
    const totalComplexity = items.reduce((sum, item) => {
      return sum + (complexityWeights[item.complexity] || 2);
    }, 0);
    
    const headliners = items.filter(item => item.type === 'headliner').length;
    
    return {
      itemCount: items.length,
      totalComplexity,
      headliners,
      averageComplexity: items.length > 0 ? totalComplexity / items.length : 0
    };
  },

  // Calculate critical path items (items with most dependents)
  getCriticalPathItems() {
    const itemDependentCounts = STRAWMAP_DATA.items.map(item => ({
      id: item.id,
      name: item.name,
      dependentCount: this.getItemDependents(item.id).length
    }));
    
    // Sort by dependent count and return top items
    return itemDependentCounts
      .sort((a, b) => b.dependentCount - a.dependentCount)
      .filter(item => item.dependentCount > 0);
  },

  // Deep clone an item
  cloneItem(item) {
    return JSON.parse(JSON.stringify(item));
  },

  // Reset all items to their original forks
  resetToOriginal() {
    STRAWMAP_DATA.items.forEach(item => {
      item.currentFork = item.originalFork;
    });
  }
};

// Export for use in other modules
window.STRAWMAP_DATA = STRAWMAP_DATA;
window.DataUtils = DataUtils;