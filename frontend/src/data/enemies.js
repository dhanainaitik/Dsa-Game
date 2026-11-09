export const ENEMIES = {
  // Basics Tier (Green) - #22C55E
  slime: {
    id: "slime",
    name: "Slime",
    concept: "Variables",
    tier: "green",
    baseHp: 300,
    baseAttack: 15,
    battleCry: "I hold one thing. That is enough.",
    lore: "The weakest creature in the world. Yet every great warrior began here.",
    color: "#22C55E",
  },
  serpent: {
    id: "serpent",
    name: "Serpent",
    concept: "Loops",
    tier: "green",
    baseHp: 450,
    baseAttack: 20,
    battleCry: "I never stop. Do you?",
    lore: "Coils endlessly. Defeated only when you know how to break the cycle.",
    color: "#22C55E",
  },
  shadow_mage: {
    id: "shadow_mage",
    name: "Shadow Mage",
    concept: "Recursion",
    tier: "green",
    baseHp: 600,
    baseAttack: 35,
    battleCry: "To defeat me, you must first defeat a smaller version of me.",
    lore: "Splits into copies of itself. The base case is the only escape.",
    color: "#22C55E",
  },

  // Arrays Tier (Yellow) - #FACC15
  goblin: {
    id: "goblin",
    name: "Goblin",
    concept: "Arrays",
    tier: "yellow",
    baseHp: 500,
    baseAttack: 25,
    battleCry: "I remember where everything is.",
    lore: "Goblins hoard values in a line. Ask the wrong index. Pay the price.",
    color: "#FACC15",
  },
  phantom_goblin: {
    id: "phantom_goblin",
    name: "Phantom Goblin",
    concept: "Sliding Window",
    tier: "yellow",
    baseHp: 700,
    baseAttack: 40,
    battleCry: "You see me. Then you don't.",
    lore: "Moves through arrays like a ghost. Track the window or lose the trail.",
    color: "#FACC15",
  },

  // Strings Tier (Blue) - #60A5FA
  mirror_spirit: {
    id: "mirror_spirit",
    name: "Mirror Spirit",
    concept: "Palindromes",
    tier: "blue",
    baseHp: 550,
    baseAttack: 30,
    battleCry: "Forward or backward. I am the same.",
    lore: "A reflection that speaks back to you uniformly.",
    color: "#60A5FA",
  },
  wraith: {
    id: "wraith",
    name: "Wraith",
    concept: "KMP / String Matching",
    tier: "blue",
    baseHp: 800,
    baseAttack: 45,
    battleCry: "I have already matched your moves.",
    lore: "It finds precisely what it looks for without ever restarting.",
    color: "#60A5FA",
  },

  // Linked Lists Tier (Purple) - #A78BFA
  chain_zombie: {
    id: "chain_zombie",
    name: "Chain Zombie",
    concept: "Linked Lists",
    tier: "purple",
    baseHp: 650,
    baseAttack: 38,
    battleCry: "Remove my head. Another follows.",
    lore: "Hold onto the tail or lose the rest of its body forever.",
    color: "#A78BFA",
  },
  cycle_demon: {
    id: "cycle_demon",
    name: "Cycle Demon",
    concept: "Cycle Detection",
    tier: "purple",
    baseHp: 900,
    baseAttack: 55,
    battleCry: "You've been here before. Remember?",
    lore: "A deceptive infinite sequence. The slow and fast steps are required to break the trance.",
    color: "#A78BFA",
  },

  // Stack / Queue Tier (Red) - #F87171
  tower_guardian: {
    id: "tower_guardian",
    name: "Tower Guardian",
    concept: "Stack",
    tier: "red",
    baseHp: 700,
    baseAttack: 42,
    battleCry: "Last in. First out. Always.",
    lore: "You must dismantle its armor starting from the newest plates.",
    color: "#F87171",
  },
  peak_guardian: {
    id: "peak_guardian",
    name: "Peak Guardian",
    concept: "Monotonic Stack",
    tier: "red",
    baseHp: 950,
    baseAttack: 58,
    battleCry: "I see only the greatest before me.",
    lore: "Holds on only to elements that do not block the larger view.",
    color: "#F87171",
  },

  // Trees Tier (Grey) - #6B7280
  tree_ent: {
    id: "tree_ent",
    name: "Tree Ent",
    concept: "Binary Trees / DFS",
    tier: "grey",
    baseHp: 1000,
    baseAttack: 60,
    battleCry: "Go left. Go right. Then return.",
    lore: "Its deep roots branch endlessly. You must walk its full span.",
    color: "#6B7280",
  },
  ancient_ent: {
    id: "ancient_ent",
    name: "Ancient Ent",
    concept: "Balanced BST / AVL",
    tier: "grey",
    baseHp: 1300,
    baseAttack: 75,
    battleCry: "I balance myself. Can you?",
    lore: "Every shift forces an adjustment. It cannot be imbalanced easily.",
    color: "#6B7280",
  },

  // Graphs Tier (Brown) - #92400E
  void_spider: {
    id: "void_spider",
    name: "Void Spider",
    concept: "BFS / DFS on Graphs",
    tier: "brown",
    baseHp: 1100,
    baseAttack: 65,
    battleCry: "My web has no clear path.",
    lore: "Explores all adjacencies in an infinite dark cavern.",
    color: "#92400E",
  },
  depth_stalker: {
    id: "depth_stalker",
    name: "Depth Stalker",
    concept: "Dijkstra / Shortest Path",
    tier: "brown",
    baseHp: 1500,
    baseAttack: 85,
    battleCry: "Find the shortest path to survive.",
    lore: "Will relentlessly track the least costly way to reach you.",
    color: "#92400E",
  },

  // Dynamic Programming Tier (Cyan) - #06B6D4
  memory_beast: {
    id: "memory_beast",
    name: "Memory Beast",
    concept: "Memoization / Top-down DP",
    tier: "cyan",
    baseHp: 1400,
    baseAttack: 80,
    battleCry: "You solved this before. Remember.",
    lore: "Do not repeat your maneuvers; it adapts to overlapping mistakes.",
    color: "#06B6D4",
  },
  loot_dragon: {
    id: "loot_dragon",
    name: "Loot Dragon",
    concept: "Tabulation / Bottom-up DP",
    tier: "cyan",
    baseHp: 1800,
    baseAttack: 100,
    battleCry: "Build up from nothing. Or face me unprepared.",
    lore: "A massive creature composed of smaller, optimal sub-components.",
    color: "#06B6D4",
  },

  // Final Boss (Dark) - #1A1A2E
  abyss_king: {
    id: "abyss_king",
    name: "Abyss King",
    concept: "All DSA",
    tier: "dark",
    baseHp: 5000,
    baseAttack: 200,
    battleCry: "You have climbed far, Coder. Let us see if you are truly ready.",
    lore: "The origin of all enemies. Defeat him and the Abyss is yours.",
    color: "#1A1A2E",
  }
};

export const getEnemyForProblem = (regionId, difficulty) => {
  // Mapping region to base enemy tier
  const tierMapping = {
    "basics": ["slime", "serpent", "shadow_mage"],
    "arrays": ["goblin", "phantom_goblin"],
    "strings": ["mirror_spirit", "wraith"],
    "linked-lists": ["chain_zombie", "cycle_demon"],
    "stacks-queues": ["tower_guardian", "peak_guardian"],
    "trees": ["tree_ent", "ancient_ent"],
    "graphs": ["void_spider", "depth_stalker"],
    "dp": ["memory_beast", "loot_dragon"]
  };

  const possibleEnemies = tierMapping[regionId] || tierMapping["arrays"];
  // If Hard difficulty, bias towards the second (harder/advanced) enemy in the array
  if (difficulty === "Hard" && possibleEnemies.length > 1) {
    return ENEMIES[possibleEnemies[1]];
  }
  return ENEMIES[possibleEnemies[0]];
};
