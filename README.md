# Interactive Ethereum Strawmap

An interactive visualization of the Ethereum roadmap that allows you to explore dependencies and see the cascading effects of moving roadmap items between forks.

## 🚀 Features

- **Interactive Drag & Drop**: Move roadmap items between forks (I*, J*, K*, L*) to explore different timeline scenarios
- **Dependency Visualization**: Real-time arrows showing technical dependencies between items
- **Conflict Detection**: Automatic warnings when moves would break dependencies, with auto-resolution suggestions
- **Critical Path Analysis**: Highlight items that block the most other features
- **Fork Complexity Metrics**: Visual indicators of fork complexity and risk scores
- **Undo/Redo System**: Full state management to explore different scenarios
- **Export Configuration**: Save and share your modified roadmap configurations

## 🎯 Based on Official Strawmap

This interactive version is based on the official [Ethereum Strawmap](https://strawmap.org/) maintained by the EF Architecture team. It implements the same roadmap structure, dependencies, and timeline while adding interactive exploration capabilities.

## 🏗️ Technical Architecture

- **Frontend**: Vanilla JavaScript with Web Components
- **Visualization**: SVG with dynamic dependency arrows
- **Styling**: CSS3 with responsive design matching original strawmap
- **Data Model**: JSON-based with comprehensive dependency tracking
- **State Management**: Full undo/redo with conflict resolution engine

## 🔧 Quick Start

### Option 1: GitHub Pages (Recommended)
Visit the live version at: **https://0xapriori.github.io/interactive-ethereum-strawmap/**

### Option 2: Local Development
```bash
# Clone the repository
git clone https://github.com/0xapriori/interactive-ethereum-strawmap.git
cd interactive-strawmap

# Start a local web server
python3 -m http.server 8080

# Open in browser
open http://localhost:8080
```

### Option 3: Test Suite
To run the test suite:
```bash
# Open test page
open http://localhost:8080/test.html
```

## 🎮 How to Use

### Basic Interaction
1. **Drag & Drop**: Drag any roadmap item to a different fork column
2. **Dependencies**: Hover over items to see related dependencies highlighted
3. **Conflicts**: When moving items, you'll get warnings about dependency conflicts

### Advanced Features
- **Critical Path**: Toggle to highlight items that block the most others
- **Fork Complexity**: Toggle to see complexity metrics for each fork
- **Auto-Resolve**: When conflicts arise, choose auto-resolution to move dependent items automatically
- **Undo/Redo**: Use Ctrl+Z/Ctrl+Y or the toolbar buttons to navigate changes
- **Reset**: Return to original strawmap configuration at any time
- **Export**: Save your configuration as JSON for sharing or backup

### Keyboard Shortcuts
- `Ctrl+Z` / `Cmd+Z`: Undo
- `Ctrl+Y` / `Cmd+Shift+Z`: Redo  
- `Ctrl+H` / `Cmd+H`: Show help
- `Escape`: Close modals

## 📊 Roadmap Structure

### Three Layers
- **Consensus Layer**: Proof-of-stake consensus mechanisms
- **Data Layer**: Data availability and storage
- **Execution Layer**: Smart contract execution

### Fork Timeline (2025-2029)
- **Electra** (2025) - Current active fork
- **Fulu** (2025) - Verkle trees and DAS extension
- **Glamsterdam** (2026) - ePBS and BALs headliners
- **Hegotá** (2026) - Post-quantum cryptography focus
- **I*** (2027) - 4s slot times, zkEVMs v1
- **J*** (2028) - 2s slot times, quantum-secure consensus
- **K*** (2029) - Shielded transfers, teragas bandwidth
- **L*** (2029) - Lean consensus (exceptional two headliners)

### Five North Stars
1. **fast L1**: Transaction inclusion and finality in seconds
2. **gigagas L1**: 1 gigagas/sec (10K TPS) via zkEVMs
3. **teragas L2**: 1 gigabyte/sec (10M TPS) via data availability sampling
4. **post quantum L1**: Centuries-long cryptographic security
5. **private L1**: Privacy as a first-class citizen

## 🔍 Dependency System

### Types of Dependencies
- **Technical Dependencies**: Hard prerequisites (shown by arrows)
- **Natural Progressions**: Logical upgrade sequences
- **Layer Constraints**: Items can only move within their layer
- **Headliner Limits**: Max 1 consensus + 1 execution per fork (except L*)

### Conflict Resolution
When you move an item that breaks dependencies:

1. **Automatic Detection**: System identifies all conflicts
2. **User Choice**: Allow move with warnings, auto-resolve, or cancel
3. **Auto-Resolution**: Automatically move dependencies/dependents as needed
4. **Manual Override**: Proceed anyway with warnings for experimental scenarios

## 📈 Analytics Features

### Critical Path Analysis
- Identifies items that block the most other features
- Highlights bottleneck items in the development timeline
- Shows dependency chain lengths

### Fork Complexity Metrics
- Item count per fork
- Total complexity score based on difficulty ratings
- Risk assessment for overloaded forks
- Cross-layer dependency tracking

### Recommendations Engine
- Suggests redistributing items from overloaded forks
- Identifies potential timeline optimization opportunities
- Warns about high-risk scheduling conflicts

## 💾 Data Export/Import

### Export Format
```json
{
  "version": "1.0",
  "timestamp": 1640995200000,
  "description": "Interactive Strawmap Configuration", 
  "roadmap": {
    "items": [...],
    "metadata": {...}
  },
  "analytics": {
    "criticalPath": [...],
    "forkComplexity": [...]
  }
}
```

### Import Configuration
Load exported configurations via the browser console:
```javascript
// Example import (future UI feature)
strawmapApp.import(configurationFile);
```

## 🧪 Development

### File Structure
```
interactive-strawmap/
├── index.html              # Main application
├── test.html               # Test suite
├── styles/
│   └── main.css            # All styling
├── js/
│   ├── data.js             # Roadmap data model
│   ├── main.js             # Application controller
│   ├── drag-drop.js        # Drag & drop system
│   ├── visualization.js    # SVG arrows and effects
│   ├── dependency-engine.js # Conflict detection
│   ├── state-manager.js    # Undo/redo system
│   └── analytics.js        # Critical path & metrics
└── README.md
```

### Browser Console API
Access application features via console:
```javascript
// Debug information
strawmapApp.debug();

// Get analytics
strawmapApp.analytics();

// Get recommendations  
strawmapApp.recommendations();

// Export configuration
strawmapApp.export();

// Reset to original
strawmapApp.reset();
```

### Testing
Run the comprehensive test suite at `/test.html`:
- Data model validation
- Dependency conflict detection
- Analytics calculations
- UI component functionality

## 🤝 Contributing

This is an educational visualization tool based on the official Ethereum Strawmap. While the roadmap data reflects the official EF Architecture team's work, this interactive layer is independent and for exploration purposes.

### Feedback & Issues
- Report bugs or suggest features via GitHub Issues
- Reference the official [strawmap.org](https://strawmap.org) for authoritative roadmap information
- Contact the EF Architecture team at strawmap@ethereum.org for roadmap-specific questions

## 📜 License

This project is open source under the MIT License. The underlying roadmap data and structure are from the official Ethereum Strawmap maintained by the EF Architecture team.

## 🙏 Acknowledgments

- **EF Architecture Team**: [@adietrichs](https://twitter.com/adietrichs), [@barnabemonnot](https://twitter.com/barnabemonnot), [@fradamt](https://twitter.com/fradamt), [@drakefjustin](https://twitter.com/drakefjustin)
- **Original Strawmap**: [strawmap.org](https://strawmap.org)
- **Design Inspiration**: Official strawmap visual design and IBM Plex Mono typography

---

**Note**: This is an independent visualization tool for educational purposes. For authoritative information about Ethereum's roadmap, please refer to [strawmap.org](https://strawmap.org) and the official EF Architecture team communications.