// Ethereum Strawmap Data Model
// Based on the CURRENT official strawmap.org roadmap (February 2026)

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

  // Five North Stars - long-term strategic goals from current strawmap
  northStars: [
    {
      id: 'fast-l1',
      name: 'fast L1',
      description: 'sub-second finality with 2-second slots',
      layer: 'consensus',
      targetFork: 'l-star'
    },
    {
      id: 'gigagas-l1',
      name: 'gigagas L1',
      description: '~10,000 TPS via zkEVMs and real-time proving',
      layer: 'execution',
      targetFork: 'l-star'
    },
    {
      id: 'teragas-l2',
      name: 'teragas L2',
      description: '~10 million TPS via Data Availability Sampling',
      layer: 'data',
      targetFork: 'k-star'
    },
    {
      id: 'post-quantum-l1',
      name: 'post quantum L1',
      description: 'quantum-resistant cryptography for century-scale security',
      layer: 'consensus',
      targetFork: 'j-star'
    },
    {
      id: 'private-l1',
      name: 'private L1',
      description: 'native privacy via shielded ETH transfers',
      layer: 'execution',
      targetFork: 'k-star'
    }
  ],

  // Roadmap items based on CURRENT strawmap.org (February 2026)
  items: [
    // Electra fork items (mostly shipped)
    {
      id: 'peerdas-v1',
      name: 'PeerDAS v1',
      description: 'Peer-based Data Availability Sampling',
      layer: 'data',
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
      description: 'Stateless-friendly tree structure',
      layer: 'execution',
      originalFork: 'fulu',
      currentFork: 'fulu',
      type: 'headliner',
      dependencies: [],
      complexity: 'very-high'
    },
    {
      id: 'peerdas-scaling',
      name: 'PeerDAS Scaling',
      description: 'Extended Data Availability Sampling capabilities',
      layer: 'data',
      originalFork: 'fulu',
      currentFork: 'fulu',
      type: 'regular',
      dependencies: ['peerdas-v1'],
      complexity: 'high'
    },

    // Glamsterdam fork items (ACTUAL current headliners)
    {
      id: 'epbs-eip7732',
      name: 'ePBS (EIP-7732)',
      description: 'Enshrined Proposer-Builder Separation',
      layer: 'consensus',
      originalFork: 'glamsterdam',
      currentFork: 'glamsterdam',
      type: 'headliner',
      dependencies: [],
      complexity: 'very-high'
    },
    {
      id: 'bals-eip7928',
      name: 'BALs (EIP-7928)',
      description: 'Block-Level Access Lists for parallel execution',
      layer: 'execution',
      originalFork: 'glamsterdam',
      currentFork: 'glamsterdam',
      type: 'headliner',
      dependencies: ['verkle-trees'],
      complexity: 'very-high'
    },
    {
      id: 'blob-increases',
      name: 'Blob Parameter Increases',
      description: 'Scaling to 48 blobs per block',
      layer: 'data',
      originalFork: 'glamsterdam',
      currentFork: 'glamsterdam',
      type: 'regular',
      dependencies: ['peerdas-scaling'],
      complexity: 'medium'
    },
    {
      id: 'gas-repricings',
      name: 'Gas Repricings',
      description: 'Optimize gas pricing for parallel execution',
      layer: 'execution',
      originalFork: 'glamsterdam',
      currentFork: 'glamsterdam',
      type: 'regular',
      dependencies: [],
      complexity: 'medium'
    },
    {
      id: '8s-slots',
      name: '8s Slot Times',
      description: 'Reduce slot times from 12s to 8s',
      layer: 'consensus',
      originalFork: 'glamsterdam',
      currentFork: 'glamsterdam',
      type: 'regular',
      dependencies: [],
      complexity: 'high'
    },

    // Hegotá fork items (Post-quantum focus)
    {
      id: 'hash-based-signatures',
      name: 'Hash-based Signatures',
      description: 'Post-quantum signature schemes (XMSS, SPHINCS+)',
      layer: 'consensus',
      originalFork: 'hegota',
      currentFork: 'hegota',
      type: 'headliner',
      dependencies: [],
      complexity: 'very-high'
    },
    {
      id: 'lattice-cryptography',
      name: 'Lattice-based Cryptography',
      description: 'Post-quantum cryptographic primitives',
      layer: 'execution',
      originalFork: 'hegota',
      currentFork: 'hegota',
      type: 'regular',
      dependencies: [],
      complexity: 'very-high'
    },
    {
      id: 'pq-transition-plan',
      name: 'PQ Transition Plan',
      description: 'Coordinated post-quantum migration strategy',
      layer: 'consensus',
      originalFork: 'hegota',
      currentFork: 'hegota',
      type: 'regular',
      dependencies: ['hash-based-signatures'],
      complexity: 'high'
    },

    // I* fork items
    {
      id: '4s-slots',
      name: '4s Slot Times',
      description: 'Further slot time reduction',
      layer: 'consensus',
      originalFork: 'i-star',
      currentFork: 'i-star',
      type: 'regular',
      dependencies: ['8s-slots', 'epbs-eip7732'],
      complexity: 'very-high'
    },
    {
      id: 'zkevms-integration',
      name: 'zkEVMs Integration',
      description: 'Native zkEVM support for scaling',
      layer: 'execution',
      originalFork: 'i-star',
      currentFork: 'i-star',
      type: 'headliner',
      dependencies: ['bals-eip7928', 'lattice-cryptography'],
      complexity: 'very-high'
    },
    {
      id: 'advanced-das',
      name: 'Advanced DAS',
      description: 'High-throughput Data Availability Sampling',
      layer: 'data',
      originalFork: 'i-star',
      currentFork: 'i-star',
      type: 'regular',
      dependencies: ['blob-increases'],
      complexity: 'high'
    },
    {
      id: 'parallel-execution',
      name: 'Parallel Execution',
      description: 'Multi-threaded transaction processing',
      layer: 'execution',
      originalFork: 'i-star',
      currentFork: 'i-star',
      type: 'regular',
      dependencies: ['bals-eip7928'],
      complexity: 'very-high'
    },

    // J* fork items
    {
      id: '2s-slots',
      name: '2s Slot Times',
      description: 'Target slot time for fast L1',
      layer: 'consensus',
      originalFork: 'j-star',
      currentFork: 'j-star',
      type: 'headliner',
      dependencies: ['4s-slots', 'pq-transition-plan'],
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
      dependencies: ['zkevms-integration', 'parallel-execution'],
      complexity: 'very-high'
    },
    {
      id: 'sub-second-finality',
      name: 'Sub-second Finality',
      description: 'Ultra-fast transaction finalization',
      layer: 'consensus',
      originalFork: 'j-star',
      currentFork: 'j-star',
      type: 'regular',
      dependencies: ['2s-slots'],
      complexity: 'very-high'
    },

    // K* fork items
    {
      id: 'shielded-eth-transfers',
      name: 'Shielded ETH Transfers',
      description: 'Native privacy for ETH transactions',
      layer: 'execution',
      originalFork: 'k-star',
      currentFork: 'k-star',
      type: 'headliner',
      dependencies: ['real-time-proving'],
      complexity: 'very-high'
    },
    {
      id: 'teragas-das',
      name: 'Teragas DAS',
      description: 'Data Availability for 10M+ TPS L2s',
      layer: 'data',
      originalFork: 'k-star',
      currentFork: 'k-star',
      type: 'regular',
      dependencies: ['advanced-das'],
      complexity: 'very-high'
    },
    {
      id: 'privacy-infrastructure',
      name: 'Privacy Infrastructure',
      description: 'Full privacy-preserving protocol support',
      layer: 'execution',
      originalFork: 'k-star',
      currentFork: 'k-star',
      type: 'regular',
      dependencies: ['shielded-eth-transfers'],
      complexity: 'very-high'
    },

    // L* fork items (Exceptional case with advanced features)
    {
      id: 'optimized-consensus',
      name: 'Optimized Consensus',
      description: 'Ultra-efficient consensus mechanism',
      layer: 'consensus',
      originalFork: 'l-star',
      currentFork: 'l-star',
      type: 'headliner',
      dependencies: ['sub-second-finality'],
      complexity: 'very-high'
    },
    {
      id: 'gigagas-execution',
      name: 'Gigagas Execution',
      description: '1 gigagas/sec execution capability (~10K TPS L1)',
      layer: 'execution',
      originalFork: 'l-star',
      currentFork: 'l-star',
      type: 'headliner',
      dependencies: ['privacy-infrastructure', 'real-time-proving'],
      complexity: 'very-high'
    },
    {
      id: 'ultimate-das',
      name: 'Ultimate DAS',
      description: 'Theoretical maximum data availability',
      layer: 'data',
      originalFork: 'l-star',
      currentFork: 'l-star',
      type: 'regular',
      dependencies: ['teragas-das'],
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