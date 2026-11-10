export interface ScriptItem {
  id: string;
  title: string;
  subGenre: string;
  category: 'SHOOTER' | 'SURVIVAL' | 'ADVENTURE' | 'SIMULATOR' | 'ACTION' | 'UNIVERSAL';
  thumbnail: string;
  freeCount: number;
  premiumCount: number;
  previewFeatures: string[];
  freeFeatures: string[];
  premiumFeatures: string[];
  loadstring: string;
  updated: string;
  version?: string;
  latency?: string;
  bypassStatus?: string;
  activeUsers?: string;
}

export const SCRIPTS_DATA: ScriptItem[] = [
  {
    id: 'blox-fruits',
    title: 'Blox Fruits',
    subGenre: 'ADVENTURE / SEA 1-3',
    category: 'ADVENTURE',
    thumbnail: '/assets/images/roblox-covers/blox-fruits.png',
    freeCount: 10,
    premiumCount: 6,
    previewFeatures: ['Sea 1-3 Auto Farm', 'Fruit Sniper', 'Auto Mastery', 'Bounty Hunter', 'Auto Raid V2'],
    freeFeatures: [
      'Level 1 to Max Level Auto-Farm (Full Quest Detection)',
      'Fast Attack (Instant Weapon Swing Animation Cancel)',
      'Auto Sea Event Harvester & Ship Hunter',
      'Auto Stats Allocation (Melee, Defense, Sword, Fruit)',
      'Fruit Inventory Sniper & Instant Teleport to Spawns',
      'Teleport to All Islands, Sea 1, Sea 2, and Sea 3',
      'Auto Collect Chests across all active servers',
      'Instant Server Hop on Low Fruit Stock / Boss Despawn',
      'Weapon Mastery Leveler (Sword, Gun, and Blox Fruit)',
      'Infinite Energy & Jump Bypass'
    ],
    premiumFeatures: [
      'Leviathan Heart Auto-Harvester & Frozen Dimension Unlocker',
      'Mirage Island Moon Watcher & Automatic Gear 4 Pull',
      'Auto Soul Guitar & Cursed Dual Katana Quest Solver',
      'Server-Crashing Bounty Killbot with Instant Aim-Snap',
      'Zero-Cooldown Skill Glitch for Kitsune & Dragon Transformations',
      'Undetected Anti-Cheat Memory Spoofing Layer'
    ],
    loadstring: 'loadstring(game:HttpGet("https://raw.githubusercontent.com/0x1s2s/Snowy-Ui-Library/main/BloxFruits.lua"))()',
    version: 'V3.4',
    latency: '< 12ms',
    bypassStatus: '100% Undetected',
    activeUsers: '8,420 Online',
    updated: 'Live & Undetected'
  },
  {
    id: 'mm2',
    title: 'Murder Mystery 2',
    subGenre: 'TACTICAL SHOOTER / SURVIVAL',
    category: 'SHOOTER',
    thumbnail: '/assets/images/roblox-covers/mm2.png',
    freeCount: 8,
    premiumCount: 5,
    previewFeatures: ['Silent Aim Gun', 'Sheriff/Murder ESP', 'Auto Gun Grab', 'Coin Vacuum', 'Kill Aura'],
    freeFeatures: [
      'Player Roles ESP (Sheriff in Blue, Murderer in Red, Innocent in Green)',
      'Dropped Gun ESP & Instant Auto-Teleport Pickup',
      'Silent Aim with 360° Hitbox Expansion',
      'Auto Coin Collector (Automated Pathfinding at 100/min cap)',
      'WalkSpeed & JumpPower Configurable Sliders',
      'Anti-Stab & Knife Prediction Shield',
      'Invisibility Mode on Round Start',
      'Custom Crosshair & Tracers with Target Distance'
    ],
    premiumFeatures: [
      'Auto-Kill Murderer As Sheriff through Solid Walls',
      'Godmode Immunity against Knife Throws and Revolver Bullets',
      'Instant Lobby Win Glitch (Ends round within 1.2s)',
      'Trade Scammer Detection & Rarity Inventory Stealer Preview',
      'Emote Speed Exploit (Fastest Sprint in MM2)'
    ],
    loadstring: 'loadstring(game:HttpGet("https://raw.githubusercontent.com/0x1s2s/Snowy-Ui-Library/main/MM2.lua"))()',
    version: 'V3.4',
    latency: '< 12ms',
    bypassStatus: '100% Undetected',
    activeUsers: '5,190 Online',
    updated: 'Live & Undetected'
  },
  {
    id: 'rivals',
    title: 'Rivals',
    subGenre: 'PVP TACTICAL FPS',
    category: 'SHOOTER',
    thumbnail: '/assets/images/roblox-covers/rivals.png',
    freeCount: 8,
    premiumCount: 5,
    previewFeatures: ['Universal Aimbot', 'Wall Penetration ESP', 'No Recoil / Spread', 'Speed Desync', 'Auto Trigger'],
    freeFeatures: [
      'Vector Aimbot with Customizable FOV Circle & Smoothing',
      'Chams ESP with Occlusion Color Switch (Visible/Hidden)',
      'Box ESP, Health Bars, Distance & Weapon Icons',
      'Zero Weapon Recoil & Zero Bullet Spread',
      'Auto-Trigger Bot (Fires instantly on crosshair intersection)',
      'Bunny Hop & Air Strafe Velocity Assist',
      'Full Bright & Shadow Remover',
      'Custom Hit Sound Effects & Bullet Tracers'
    ],
    premiumFeatures: [
      'Silent Aim with Anti-Spread Memory Override',
      'Corner Peek Desync (Ghost Model Fake Lag)',
      'Bullet Teleportation directly behind Enemy Hitboxes',
      'Instant Auto-Parry for Melee & Grenade Reflector',
      'Hardware ID & Account Anti-Ban Virtualization'
    ],
    loadstring: 'loadstring(game:HttpGet("https://raw.githubusercontent.com/0x1s2s/Snowy-Ui-Library/main/Rivals.lua"))()',
    version: 'V3.4',
    latency: '< 12ms',
    bypassStatus: '100% Undetected',
    activeUsers: '3,240 Online',
    updated: 'Live & Undetected'
  },
  {
    id: 'bedwars',
    title: 'BedWars',
    subGenre: 'COMPETITIVE ACTION / STRATEGY',
    category: 'ACTION',
    thumbnail: '/assets/images/roblox-covers/bedwars.png',
    freeCount: 8,
    premiumCount: 5,
    previewFeatures: ['Killaura 6-Block', 'Scaffold Walk', 'Velocity Modifier', 'Auto Bed Break', 'Fly Bypass'],
    freeFeatures: [
      'Multi-Directional KillAura with Target Priority Sorting',
      'High-Speed Scaffold (Instant Bridge Builder in any angle)',
      'Velocity Reducer / 0% Knockback Modifier',
      'Auto Sprint & Step Height Extender',
      'Ore & Generator ESP with Dynamic Distance Tags',
      'Auto Collect Iron, Gold, and Emeralds from team forge',
      'Chest Stealer & Auto Armor Equip',
      'Bow Aimbot with Trajectory & Gravity Calculation'
    ],
    premiumFeatures: [
      'Long Jump & Infinite Glide Flight Bypass',
      'Teleport Exploits to Enemy Bed under Map Glitch',
      'Auto Kit Ability Abuser (Infinite Hannah Execute & Yuzi Dash)',
      'Instant Bed Nuker through Defense Blastproof Blocks',
      'Auto God Apple & Shield Potion Consumption in Combat'
    ],
    loadstring: 'loadstring(game:HttpGet("https://raw.githubusercontent.com/0x1s2s/Snowy-Ui-Library/main/Bedwars.lua"))()',
    version: 'V3.4',
    latency: '< 12ms',
    bypassStatus: '100% Undetected',
    activeUsers: '2,860 Online',
    updated: 'Live & Undetected'
  },
  {
    id: 'doors',
    title: 'Doors (Floor 1 & 2)',
    subGenre: 'HORROR SURVIVAL / ROGUELIKE',
    category: 'SURVIVAL',
    thumbnail: '/assets/images/roblox-covers/doors.png',
    freeCount: 8,
    premiumCount: 5,
    previewFeatures: ['Door/Key ESP', 'Entity Radar & Alarm', 'Auto Breaker Solver', 'Speed & Light Booster', 'Godmode Closet'],
    freeFeatures: [
      'Full Interactive ESP (Doors, Keys, Books, Levers, Breakers)',
      'Entity Warning System (Rush, Ambush, Screech, Halt, Eyes)',
      'Auto-Look Away from Eyes & Auto-Stare at Screech',
      'Full Brightness with Volumetric Flashlight Override',
      'Door 50 Library Code Auto-Reader & Auto Padlock Opener',
      'Door 100 Electrical Breaker Auto-Solver in 0.5s',
      'Speed Boost with Natural Footstep Sound Suppression',
      'Anti-Dupe & Anti-Snare Floor Protection'
    ],
    premiumFeatures: [
      'Automatic Complete Room Runner (Bots all 100 Doors to Ending)',
      'Immunity against Figure One-Hit Kill Mechanics',
      'Seek Chase Auto-Obstacle Navigation (Never hits fire/hands)',
      'Floor 2 The Mines: Minecart Auto-Pilot & Anchor Auto-Link',
      'Item Duplicator & Infinite Crucifix Glitch'
    ],
    loadstring: 'loadstring(game:HttpGet("https://raw.githubusercontent.com/0x1s2s/Snowy-Ui-Library/main/Doors.lua"))()',
    version: 'V3.4',
    latency: '< 12ms',
    bypassStatus: '100% Undetected',
    activeUsers: '2,410 Online',
    updated: 'Live & Undetected'
  },
  {
    id: 'evade',
    title: 'Evade',
    subGenre: 'PHYSICS SURVIVAL / CHASE',
    category: 'SURVIVAL',
    thumbnail: '/assets/images/roblox-covers/evade.png',
    freeCount: 8,
    premiumCount: 4,
    previewFeatures: ['Nextbot ESP', 'Auto Revive Team', 'Bhop Speed Hack', 'God Jump', 'Safe Zone Teleport'],
    freeFeatures: [
      'Nextbot Tracker with 3D Distance Chams & Audio Warning',
      'Downed Teammates ESP with Distance & Auto-Path Revive',
      'Instant Auto-Revive through Walls & Barriers',
      'Continuous Velocity Bhop Hack (Reach 120+ Speed)',
      'No Clip & Barrier Bypass for Glitch Spots',
      'Fullbright & Custom Night Vision Filters',
      'Auto Emote Spammer & Point Farming Mode',
      'Drink & Utility Auto-Consumer when Nextbot Proximity < 20m'
    ],
    premiumFeatures: [
      'Immunity Shield (Nextbots bounce off player model)',
      'Auto Win Round AFK Teleport to Out-Of-Bounds Sky Platform',
      'Instant Badge & Token Unlocker for all Maps',
      'Invisible Godmode Spectate with Revive Capabilities'
    ],
    loadstring: 'loadstring(game:HttpGet("https://raw.githubusercontent.com/0x1s2s/Snowy-Ui-Library/main/Evade.lua"))()',
    version: 'V3.4',
    latency: '< 12ms',
    bypassStatus: '100% Undetected',
    activeUsers: '1,540 Online',
    updated: 'Live & Undetected'
  },
  {
    id: 'brookhaven',
    title: 'Brookhaven RP',
    subGenre: 'ADVENTURE / ROLEPLAY',
    category: 'ADVENTURE',
    thumbnail: '/assets/images/roblox-covers/brookhaven.png',
    freeCount: 8,
    premiumCount: 4,
    previewFeatures: ['Unlock Gamepasses', 'Vehicle Fly', 'House Teleports', 'Custom Music Tool', 'Avatar Stealer'],
    freeFeatures: [
      'Premium Gamepass Bypass (Unlocked vehicle & house assets)',
      'Vehicle Flight Physics with Configurable Speed Sliders',
      'Instant House & Safe Teleportation across map',
      'Free Car Colors & Custom Rim Unlocker',
      'Avatar & Clothing Cloner from Any Player in Server',
      'Custom Audio Boombox Player with Audio ID Bypass',
      'Invisible Troll Mode & Collision Toggle',
      'Infinite Stamina & High Jump'
    ],
    premiumFeatures: [
      'Server Audio Override with High-Fidelity Streaming',
      'Fling Other Players into Orbit via Physics Desync',
      'Force House Perms & Unlock Banned Houses',
      'Custom 3D Animations & Admin Tool Sandbox'
    ],
    loadstring: 'loadstring(game:HttpGet("https://raw.githubusercontent.com/0x1s2s/Snowy-Ui-Library/main/Brookhaven.lua"))()',
    version: 'V3.4',
    latency: '< 12ms',
    bypassStatus: '100% Undetected',
    activeUsers: '2,150 Online',
    updated: 'Live & Undetected'
  },
  {
    id: 'adopt-me',
    title: 'Adopt Me!',
    subGenre: 'PET SIMULATOR / TYCOON',
    category: 'SIMULATOR',
    thumbnail: '/assets/images/roblox-covers/adopt-me.png',
    freeCount: 8,
    premiumCount: 4,
    previewFeatures: ['Auto Baby/Pet Aging', 'Bucks Multiplier', 'Instant Needs Auto', 'Auto Egg Hatch', 'Teleport To Tasks'],
    freeFeatures: [
      'Full Automatic Pet & Baby Task Solver (Sleep, Eat, Shower, School, Park)',
      'Instant Teleportation to Task Locations & Bed Facilities',
      'Auto Bucks Farming via Daily Reward & Quest Loops',
      'Egg Auto-Hatch with Inventory Rarity Filter',
      'Unlimited Speed, Fly, and Infinite Jump',
      'House Door Auto-Lock & Anti-Griefing Protection',
      'Player & Trade ESP with Item Rarity Highlights',
      'Trade Scam Scanner (Alerts on sudden item removals)'
    ],
    premiumFeatures: [
      'Instant Neon & Mega Neon Pet Crafter Automation',
      'Lure Auto-Harvester with Guaranteed Ultra-Rare Chance Boost',
      'Trade Freeze Spoofing & Stealth Inventory Duping Safeguards',
      'Multi-Account Sync for Automated Farm Clusters'
    ],
    loadstring: 'loadstring(game:HttpGet("https://raw.githubusercontent.com/0x1s2s/Snowy-Ui-Library/main/AdoptMe.lua"))()',
    version: 'V3.4',
    latency: '< 12ms',
    bypassStatus: '100% Undetected',
    activeUsers: '1,890 Online',
    updated: 'Live & Undetected'
  },
  {
    id: 'da-hood',
    title: 'Da Hood',
    subGenre: 'URBAN COMBAT / PVP',
    category: 'ACTION',
    thumbnail: '/assets/images/roblox-covers/da-hood.png',
    freeCount: 8,
    premiumCount: 4,
    previewFeatures: ['Silent Aim Lock', 'Auto Stomp & Knock', 'Macro Speed Fly', 'Cash Aura Auto', 'Desync Anti-Lock'],
    freeFeatures: [
      'Smooth Camera & Cursor Lock with Head/Torso Hitbox Snap',
      'Auto Stomp Knocked Players within Radius',
      'Full Auto Cash Vacuum (ATMs, Banks, Shoe Store)',
      'Configurable Macro (Q/E Speed Glitch with High FPS Support)',
      'Player ESP with Cash, Armor, and Weapon Indicators',
      'Gun Shop Auto Buy Ammo & Double Barrel Shotgun',
      'Anti-Knockback & Anti-Slowdown on Damage',
      'God Armor Auto-Equip on 50% HP threshold'
    ],
    premiumFeatures: [
      'Underground Anti-Lock Desync (Completely immune to enemy lock-ons)',
      'Auto-Revive Cash Dupe Protection',
      'Silent Double-Barrel Rapid Fire Glitch',
      'Teleport Fling Kill All Criminals / Police in Server'
    ],
    loadstring: 'loadstring(game:HttpGet("https://raw.githubusercontent.com/0x1s2s/Snowy-Ui-Library/main/DaHood.lua"))()',
    version: 'V3.4',
    latency: '< 12ms',
    bypassStatus: '100% Undetected',
    activeUsers: '1,740 Online',
    updated: 'Live & Undetected'
  },
  {
    id: 'prison-life',
    title: 'Prison Life',
    subGenre: 'SHOOTER / ESCAPE PRISON',
    category: 'SHOOTER',
    thumbnail: '/assets/images/roblox-covers/prison-life.png',
    freeCount: 8,
    premiumCount: 4,
    previewFeatures: ['Kill All Guard/Inmate', 'Auto Get Guns', 'Arrest All Aura', 'Loop Taser', 'Infinite Ammo'],
    freeFeatures: [
      'One-Click Kill All Inmates or Kill All Guards',
      'Instant Gun Spawner (Remington, M4A1, AK-47, M9)',
      'Infinite Ammo & Rapid Fire Modification',
      'Auto-Arrest Criminals from 50 Studs Radius',
      'Door Teleportation & Wall Clip Escape',
      'Super Punch Exploit (One-hit ragdoll punch)',
      'Team Swapper with Zero Respawn Timer',
      'Full Player ESP with Handheld Weapon Names'
    ],
    premiumFeatures: [
      'Crash Server via Vehicle Physics Loop',
      'Godmode Shield against Shotgun & Taser',
      'Infinite Car Fling & Orbital Launcher',
      'Custom Red Light Sniper with Silent Wallbang'
    ],
    loadstring: 'loadstring(game:HttpGet("https://raw.githubusercontent.com/0x1s2s/Snowy-Ui-Library/main/PrisonLife.lua"))()',
    version: 'V3.4',
    latency: '< 12ms',
    bypassStatus: '100% Undetected',
    activeUsers: '1,390 Online',
    updated: 'Live & Undetected'
  },
  {
    id: 'pet-sim-99',
    title: 'Pet Simulator 99',
    subGenre: 'COLLECTOR SIMULATOR',
    category: 'SIMULATOR',
    thumbnail: '/assets/images/roblox-covers/pet-sim-99.png',
    freeCount: 8,
    premiumCount: 4,
    previewFeatures: ['Breakables Fast Farm', 'Auto Rebirth & Area', 'Hatch Huge Pet', 'Auto Mastery Quest', 'Fishing Bot'],
    freeFeatures: [
      'Fast Multi-Target Breakable Farming with Coin Multipliers',
      'Auto Rebirth & Instant Area Progression Unlocks',
      'Unlimited Egg Fast Hatching with Animation Bypass',
      'Automated Fishing Bot with 100% Perfect Casts',
      'Auto Collect All Drops (Diamonds, Coins, Items, Potions)',
      'Potion & Enchantment Auto Crafter / Consumable Drinker',
      'Merchant Auto-Buyer (Buys all valuable discounted stocks)',
      'Auto Mini-Game Completer (Chest Rush, Sled, Digsite)'
    ],
    premiumFeatures: [
      'Huge / Titanic Pet Hatch Luck Booster Protocol',
      'Infinite Diamond Multiplier & Secret Room Door Cracker',
      'Multi-Account Trading Farm Network with Webhook Alerts',
      'Stairway To Heaven Teleport & Auto Glitch Climber'
    ],
    loadstring: 'loadstring(game:HttpGet("https://raw.githubusercontent.com/0x1s2s/Snowy-Ui-Library/main/PetSim99.lua"))()',
    version: 'V3.4',
    latency: '< 12ms',
    bypassStatus: '100% Undetected',
    activeUsers: '1,680 Online',
    updated: 'Live & Undetected'
  },
  {
    id: 'arsenal',
    title: 'Arsenal',
    subGenre: 'ARCADE FPS SHOOTER',
    category: 'SHOOTER',
    thumbnail: '/assets/images/roblox-covers/arsenal.png',
    freeCount: 8,
    premiumCount: 4,
    previewFeatures: ['Silent Aim Bot', 'Wallbang Bullets', 'Spinbot Anti-Aim', 'Infinite Ammo', 'Kill Sound FX'],
    freeFeatures: [
      'Silent Aim with customizable FOV & Target Bone Selection',
      'Chams ESP with Rainbow & Visible Glow Modes',
      'No Recoil, No Spread, and Instant Weapon Reload',
      'Infinite Ammo & Automatic Weapon Fire Converter',
      'Bunnyhop Velocity Assistant & Super Speed Sliders',
      'Knife Kill Aura for Backstab Instant Finishers',
      'Auto Win Rounds in FFA & Team Modes',
      'Hitbox Expander for Head and Torso'
    ],
    premiumFeatures: [
      'Full Wallbang Bullet Penetration across all geometry',
      'True Anti-Aim Spinbot to baffle opposing aimbots',
      'Kill Say Chat Announcer with Custom Memes & Soundboard',
      'Teleport Kill All with Golden Knife Auto Victory'
    ],
    loadstring: 'loadstring(game:HttpGet("https://raw.githubusercontent.com/0x1s2s/Snowy-Ui-Library/main/Arsenal.lua"))()',
    version: 'V3.4',
    latency: '< 12ms',
    bypassStatus: '100% Undetected',
    activeUsers: '1,480 Online',
    updated: 'Live & Undetected'
  },
  {
    id: 'blade-ball',
    title: 'Blade Ball',
    subGenre: 'FAST-PACED ACTION REFLEX',
    category: 'ACTION',
    thumbnail: '/assets/images/roblox-covers/blade-ball.png',
    freeCount: 8,
    premiumCount: 4,
    previewFeatures: ['Auto Parry AI', 'Manual Curve Spoofer', 'Target Visualizer', 'Infinity Ability', 'Auto Open Crates'],
    freeFeatures: [
      'High-Precision Auto Parry with Ping & Distance Compensation',
      'Ball Trajectory Line & Real-Time Speed Prediction',
      'Auto Ability Activator (Dash, Forcefield, Telekinesis)',
      'Configurable Parry Radius & Dynamic Clashing Assistant',
      'Player ESP with Ability Cooldown Displays',
      'Auto Open Sword Crates & Explosion Crates',
      'Night Mode & FPS Booster Texture Reducer',
      'Anti-Curve Detection for Stealth Ball Hits'
    ],
    premiumFeatures: [
      'AI Instant 0ms Clash Winner against any spammer',
      'Ball Curve Manipulator (Bends ball violently toward closest foe)',
      'Godmode Forcefield Immunity Hack',
      'Auto Win Lobby Tournament Champion Script'
    ],
    loadstring: 'loadstring(game:HttpGet("https://raw.githubusercontent.com/0x1s2s/Snowy-Ui-Library/main/BladeBall.lua"))()',
    version: 'V3.4',
    latency: '< 12ms',
    bypassStatus: '100% Undetected',
    activeUsers: '1,980 Online',
    updated: 'Live & Undetected'
  },
  {
    id: 'flee-the-facility',
    title: 'Flee the Facility',
    subGenre: 'STEALTH SURVIVAL / HORROR',
    category: 'SURVIVAL',
    thumbnail: '/assets/images/roblox-covers/flee-the-facility.png',
    freeCount: 8,
    premiumCount: 4,
    previewFeatures: ['Beast/Survivor ESP', 'Auto Computer Hack', 'No Error Minigames', 'Door Breaker', 'Infinite Stamina'],
    freeFeatures: [
      'Full Roles ESP (Beast in Crimson, Survivors in Cyan)',
      'Computer Terminals ESP with Progress Percentage',
      'Auto Hack Computers without any QTE Minigame Errors',
      'Freeze Pods & Exit Doors ESP with Unlock Alerts',
      'Infinite Sprint Stamina with Footstep Muter',
      'Auto Crawl through Vents without Animation Slowdown',
      'Fast Rescue Downed Teammates from Freezing Pods',
      'Full Bright & Wall Transparency Slider'
    ],
    premiumFeatures: [
      'Beast Auto Hit Aura (Knocks down all survivors automatically)',
      'Teleport Survivors directly into Open Pods in 2 seconds',
      'Instant Hack Terminals (Completes 100% within 1 tick)',
      'Godmode Cage Escape without teammate assistance'
    ],
    loadstring: 'loadstring(game:HttpGet("https://raw.githubusercontent.com/0x1s2s/Snowy-Ui-Library/main/FleeTheFacility.lua"))()',
    version: 'V3.4',
    latency: '< 12ms',
    bypassStatus: '100% Undetected',
    activeUsers: '1,250 Online',
    updated: 'Live & Undetected'
  },
  {
    id: 'tower-of-hell',
    title: 'Tower of Hell',
    subGenre: 'OBBY ADVENTURE / PLATFORMER',
    category: 'ADVENTURE',
    thumbnail: '/assets/images/roblox-covers/tower-of-hell.png',
    freeCount: 8,
    premiumCount: 4,
    previewFeatures: ['Godmode Lasers', 'Auto Win Obby', 'Infinite Double Jump', 'Speed Walk', 'Remove Kill Parts'],
    freeFeatures: [
      'Godmode (Immunity to all red death lasers and lava blocks)',
      'Instant Auto-Win Teleport directly to Top Vault Stage',
      'Configurable WalkSpeed & Fly Controls',
      'Infinite Double Jump & Low Gravity Toggle',
      'Remove Kill Parts locally to walk on all obstacles',
      'Buy All Mutators for Free UI visual toggle',
      'Player ESP with Stage Level Indicators',
      'Anti-Void Fall Recovery'
    ],
    premiumFeatures: [
      'Instant Coin & Vault Auto-Farmer (Collects 10,000/hr)',
      'All Halos & Effects Local Granter',
      'Server Mutator Spoofer (Controls tower timers and gravity)',
      'Stealth Teleport to simulate legitimate run'
    ],
    loadstring: 'loadstring(game:HttpGet("https://raw.githubusercontent.com/0x1s2s/Snowy-Ui-Library/main/TowerOfHell.lua"))()',
    version: 'V3.4',
    latency: '< 12ms',
    bypassStatus: '100% Undetected',
    activeUsers: '1,180 Online',
    updated: 'Live & Undetected'
  },
  {
    id: 'natural-disaster',
    title: 'Natural Disaster Survival',
    subGenre: 'PHYSICS DISASTER SURVIVAL',
    category: 'SURVIVAL',
    thumbnail: '/assets/images/roblox-covers/natural-disaster.png',
    freeCount: 8,
    premiumCount: 4,
    previewFeatures: ['Disaster Predictor', 'Safe Spot Teleport', 'Godmode Fall Damage', 'Infinite Balloon', 'Fly Mod'],
    freeFeatures: [
      'Disaster Name Predictor before notification displays',
      'Auto Teleport to optimal Survival Island Coordinates',
      'No Fall Damage & Anti-Fling Physics Anchor',
      'Infinite Green Balloon Floating Velocity',
      'Spawn Apple & Medical Kit Duplicator',
      'Player ESP with Health & Survival Streak Count',
      'Full Brightness & Water Damage Immersion Remover',
      'Speed Boost & High Jump'
    ],
    premiumFeatures: [
      'True Godmode (Survives direct meteor hits & tsunami floods)',
      'Auto Win Multiplier (Racks up thousands of survival points)',
      'Disaster Manipulator (Bypass safezone constraints)',
      'Tornado & Lightning Deflector Shield'
    ],
    loadstring: 'loadstring(game:HttpGet("https://raw.githubusercontent.com/0x1s2s/Snowy-Ui-Library/main/NaturalDisaster.lua"))()',
    version: 'V3.4',
    latency: '< 12ms',
    bypassStatus: '100% Undetected',
    activeUsers: '1,080 Online',
    updated: 'Live & Undetected'
  },
  {
    id: 'bee-swarm',
    title: 'Bee Swarm Simulator',
    subGenre: 'IDLE FARMING SIMULATOR',
    category: 'SIMULATOR',
    thumbnail: '/assets/images/roblox-covers/bee-swarm.png',
    freeCount: 8,
    premiumCount: 4,
    previewFeatures: ['Auto Dig & Pollen', 'Auto Convert Honey', 'Mob Auto Killer', 'Auto Quest Black Bear', 'Field Teleports'],
    freeFeatures: [
      'Auto Dig Pollen in Chosen Fields (Pine Tree, Pepper, Coconut)',
      'Smart Auto-Pathfinding to Hive for Honey Conversion',
      'Mob Auto Killer (Tunnel Bear, King Beetle, Coconut Crab, Stump Snail)',
      'Auto Dispenser & Wealth Clock Collector',
      'Auto Quest Solver for Black Bear, Brown Bear, and Polar Bear',
      'Pollen Booster & Sprout Auto Harvester',
      'Night Mode & Vicious Bee Radar Spawner',
      'Full Field & Token ESP with Dynamic Lifespan Timer'
    ],
    premiumFeatures: [
      'Instant Royal Jelly Mythic Bee Roller Protocol',
      'Wind Shrine Multiplier Automation with Guaranteed Favors',
      'Macro Farm with Webhook Analytics & Honey/Hr Tracker',
      'Anti-AFK 24/7 Cloud Background Execution System'
    ],
    loadstring: 'loadstring(game:HttpGet("https://raw.githubusercontent.com/0x1s2s/Snowy-Ui-Library/main/BeeSwarm.lua"))()',
    version: 'V3.4',
    latency: '< 12ms',
    bypassStatus: '100% Undetected',
    activeUsers: '880 Online',
    updated: 'Live & Undetected'
  },
  {
    id: 'strongest-battlegrounds',
    title: 'The Strongest Battlegrounds',
    subGenre: 'ANIME COMBAT / ARENA',
    category: 'ACTION',
    thumbnail: '/assets/images/roblox-covers/strongest-battlegrounds.png',
    freeCount: 8,
    premiumCount: 4,
    previewFeatures: ['Auto Combo Bot', 'Instant Counter Attack', 'Infinite Awakening', 'No Stun / Knock', 'Aura Kill Lock'],
    freeFeatures: [
      'Frame-Perfect Auto Combo (M1 x3 + Uppercut + Downslam)',
      'Instant Block / Auto Counter upon Enemy Strike Initiation',
      'No Ragdoll & Stun Duration Cancellation',
      'Player Range ESP with Health Percentage & Ultimate Bar',
      'Fast Sprint & Enhanced Dash Distance',
      'Auto Avoid Destructible Map Debris',
      'Emote Cancel & Animation Acceleration',
      'Custom Kill Counter & Combat Stats UI'
    ],
    premiumFeatures: [
      'Infinite Awakening Meter Glitch across all characters',
      'Saitama Serious Punch Wallbang Multi-Hit Kill',
      'Desync Ghost Model to evade target lock-on attacks',
      'Server Wipe Ultimate Attack Spoofer'
    ],
    loadstring: 'loadstring(game:HttpGet("https://raw.githubusercontent.com/0x1s2s/Snowy-Ui-Library/main/StrongestBattlegrounds.lua"))()',
    version: 'V3.4',
    latency: '< 12ms',
    bypassStatus: '100% Undetected',
    activeUsers: '1,620 Online',
    updated: 'Live & Undetected'
  },
  {
    id: 'anime-defenders',
    title: 'Anime Defenders',
    subGenre: 'TOWER DEFENSE SIMULATOR',
    category: 'SIMULATOR',
    thumbnail: '/assets/images/roblox-covers/anime-defenders.png',
    freeCount: 8,
    premiumCount: 4,
    previewFeatures: ['Auto Place & Upgrade', 'Infinite Speed 3x', 'Auto Replay Maps', 'Gem Farm Infinite', 'Unit Summon Sniper'],
    freeFeatures: [
      'Auto Place Units in Optimized DPS Grid Positions',
      'Smart Auto-Upgrade Prioritizing High Tier Characters',
      'Auto Start Wave & Instant Game Speed Booster',
      'Auto Replay Challenge / Infinite Maps for Farm',
      'Enemy HP & Speed Tier ESP with Boss Tracking',
      'Auto Claim Quests, Battle Pass, and Daily Rewards',
      'Summon Banner Sniper with Desired Mythic Selector',
      'Full AFK Mode with Webhook Discord Logging'
    ],
    premiumFeatures: [
      'Infinite Damage Multiplier Exploit for Raid Bosses',
      'Secret Unit Summon Chance Enhancer Protocol',
      'All Portals Auto-Clear (Tier 1-10 Automated)',
      'Multi-Session Sync for Account Boosting'
    ],
    loadstring: 'loadstring(game:HttpGet("https://raw.githubusercontent.com/0x1s2s/Snowy-Ui-Library/main/AnimeDefenders.lua"))()',
    version: 'V3.4',
    latency: '< 12ms',
    bypassStatus: '100% Undetected',
    activeUsers: '1,320 Online',
    updated: 'Live & Undetected'
  },
  {
    id: 'counter-blox',
    title: 'Counter Blox',
    subGenre: 'TACTICAL BOMB DEFUSAL FPS',
    category: 'SHOOTER',
    thumbnail: '/assets/images/roblox-covers/counter-blox.png',
    freeCount: 8,
    premiumCount: 4,
    previewFeatures: ['Legit & Rage Aimbot', 'Full Wallbang Chams', 'Skin Changer', 'Auto Defuse Bomb', 'Triggerbot 0ms'],
    freeFeatures: [
      'Legit Aimbot with Humanized Smoothing & Random Bone Jitter',
      'Rage Aimbot with Multi-Target Priority Selection',
      'Player Chams ESP (Glow, Box, Skeleton, Weapon, Health)',
      'Client-Side Skin Changer (All Knives & Gloves Unlocked)',
      'Instant Auto Defuse Bomb from anywhere on Site',
      'Bunny Hop & Auto Strafe for Fast Rotation',
      'No Flash, No Smoke, and No Scope Blur',
      'Grenade Trajectory Prediction Line'
    ],
    premiumFeatures: [
      'Silent Aim with Wallbang Penetration Override',
      'Anti-Aim Fake Angles to misalign opposing aimbots',
      'Auto Buy & Cash Multiplier Glitch',
      'Instant Bomb Plant at Round Start'
    ],
    loadstring: 'loadstring(game:HttpGet("https://raw.githubusercontent.com/0x1s2s/Snowy-Ui-Library/main/CounterBlox.lua"))()',
    version: 'V3.4',
    latency: '< 12ms',
    bypassStatus: '100% Undetected',
    activeUsers: '960 Online',
    updated: 'Live & Undetected'
  },
  {
    id: 'scp-3008',
    title: '3008 (SCP Infinite IKEA)',
    subGenre: 'SURVIVAL / BASE BUILDING',
    category: 'SURVIVAL',
    thumbnail: '/assets/images/roblox-covers/scp-3008.png',
    freeCount: 8,
    premiumCount: 4,
    previewFeatures: ['Staff Employee ESP', 'Food & Meds Radar', 'Instant Build Base', 'Super Speed/Fly', 'Day/Night Timer'],
    freeFeatures: [
      'Staff Employee ESP with Aggro State (Red when pursuing)',
      'Food & Supply Pallet ESP with Health Restoration Stats',
      'Instant Base Builder (Snaps furniture together in straight grids)',
      'Item Vacuum (Pulls food, medkits, and wooden pallets into backpack)',
      'Day / Night Phase Timer with Audio Alert 60s before lights out',
      'Infinite Stamina & High Jump for Climbing Pallets',
      'Full Bright & Night Vision Mode',
      'Player Coordinates & Waypoint Markers'
    ],
    premiumFeatures: [
      'Immunity against Staff Damage (Staff cannot hit or damage player)',
      'Godmode Unlimited Hunger and Energy',
      'Item Duplicator for Pizza, Burgers, and Medkits',
      'Instant Base Save & Blueprint Auto-Rebuilder'
    ],
    loadstring: 'loadstring(game:HttpGet("https://raw.githubusercontent.com/0x1s2s/Snowy-Ui-Library/main/SCP3008.lua"))()',
    version: 'V3.4',
    latency: '< 12ms',
    bypassStatus: '100% Undetected',
    activeUsers: '920 Online',
    updated: 'Live & Undetected'
  },
  {
    id: 'deepwoken',
    title: 'Deepwoken',
    subGenre: 'HARDCORE ACTION RPG',
    category: 'ADVENTURE',
    thumbnail: '/assets/images/roblox-covers/deepwoken.png',
    freeCount: 8,
    premiumCount: 4,
    previewFeatures: ['Auto Parry & Roll', 'Mob ESP & Spawns', 'Loot Chest Tracker', 'Instant Log Out', 'Auto Farm Depths'],
    freeFeatures: [
      'Microsecond Auto Parry against Monster and Player Attacks',
      'Auto Roll on Heavy Critical and Guardbreak Animations',
      'Full Monster & Player ESP with Guild Names and Weapon Gear',
      'Dungeon & Chest ESP with Rarity Breakdown',
      'Emergency Auto Log Out (Triggers when Player drops below 30% HP)',
      'No Fall Damage & High Glide Physics',
      'Speed Boost & Climbing Velocity Enhancer',
      'Sanity & Drown Meter Visualizer'
    ],
    premiumFeatures: [
      'Depths Trial Auto-Solver & Escape Bot',
      'Auto Bell Resonance Progression Farm',
      'Chime of Conflict PVP Auto-Combos & Anti-Void Glitch',
      'Memory Spoofing Anti-Log Detection'
    ],
    loadstring: 'loadstring(game:HttpGet("https://raw.githubusercontent.com/0x1s2s/Snowy-Ui-Library/main/Deepwoken.lua"))()',
    version: 'V3.4',
    latency: '< 12ms',
    bypassStatus: '100% Undetected',
    activeUsers: '1,140 Online',
    updated: 'Live & Undetected'
  },
  {
    id: 'jump-brainrot',
    title: '+1 Jump Brainrot',
    subGenre: 'VIRAL SIMULATOR / TYCOON',
    category: 'SIMULATOR',
    thumbnail: '/assets/images/roblox-covers/jump-brainrot.png',
    freeCount: 8,
    premiumCount: 4,
    previewFeatures: ['Auto Jump Spammer', 'Zone Teleports', 'Instant Rebirth', 'Pet Auto Equip', 'Infinite Multiplier'],
    freeFeatures: [
      'High-Speed Auto Jump Loop (Gains millions of jump height/sec)',
      'Instant Unlock & Teleport to highest sky towers and dimensions',
      'Automated Prestige Rebirth at specified thresholds',
      'Best Pet Auto Equip & Auto Hatch Machine',
      'Full World ESP with Golden Relic Locations',
      'Speed Multiplier & Gravity Controller',
      'Free VIP Room Access Bypass',
      'Anti-AFK Protection'
    ],
    premiumFeatures: [
      'Infinite Jump Height Glitch (Reach top leaderboard rank instantly)',
      'Auto Win Obby Race Tournaments',
      'Pet Multiplier Booster x50',
      'VIP Pass & Infinite Eggs Unlocker'
    ],
    loadstring: 'loadstring(game:HttpGet("https://raw.githubusercontent.com/0x1s2s/Snowy-Ui-Library/main/JumpBrainrot.lua"))()',
    version: 'V3.4',
    latency: '< 12ms',
    bypassStatus: '100% Undetected',
    activeUsers: '1,420 Online',
    updated: 'Live & Undetected'
  },
  {
    id: 'ride-a-pet',
    title: 'Ride a Pet',
    subGenre: 'PET SIMULATOR / RACING',
    category: 'SIMULATOR',
    thumbnail: '/assets/images/roblox-covers/ride-a-pet.png',
    freeCount: 8,
    premiumCount: 4,
    previewFeatures: ['Instant Speed Farm', 'Auto Hatch All Eggs', 'Secret Worlds Unlock', 'Pet Fusion Auto', 'Auto Rebirth'],
    freeFeatures: [
      'Automated Speed Farming on all tracks',
      'Instant Auto Egg Hatching with Multi-Hatch',
      'Pet Fusion & Golden Crafting Automation',
      'Instant Teleport to all unlocked zones and secret worlds',
      'Auto Rebirth with Best Pet Team Configuration',
      'Player Race Leaderboard ESP',
      'Full Bright & Reduced Lag Renderer',
      'Anti-AFK Auto Clicker'
    ],
    premiumFeatures: [
      'Fastest Pet Stat Spoofer (Guarantees #1 podium finish)',
      'Secret Huge Pet Guaranteed Roll exploit',
      'Unlimited Gem Multiplier Hook',
      'All Gamepasses Client-Side Enabler'
    ],
    loadstring: 'loadstring(game:HttpGet("https://raw.githubusercontent.com/0x1s2s/Snowy-Ui-Library/main/RideAPet.lua"))()',
    version: 'V3.4',
    latency: '< 12ms',
    bypassStatus: '100% Undetected',
    activeUsers: '1,290 Online',
    updated: 'Live & Undetected'
  },
  {
    id: 'steal-an-egg',
    title: 'Steal an Egg Kaitun',
    subGenre: 'STEALTH SIMULATOR / KAITUN',
    category: 'SIMULATOR',
    thumbnail: '/assets/images/roblox-covers/steal-an-egg.png',
    freeCount: 8,
    premiumCount: 4,
    previewFeatures: ['Stealth Egg Thief', 'Anti-Guard AI', 'Speed Multiplier', 'Infinite Stamina', 'Auto Vault Crack'],
    freeFeatures: [
      'Automated Stealth Egg Collection pathfinding',
      'Guard Vision Radar & Proximity Warning ESP',
      'Silent Movement with Zero Footstep Alerts',
      'Infinite Stamina & Speed Boost Sliders',
      'Auto Crack Vaults & Escape Safely',
      'Instant Egg Delivery to Base Nest',
      'Egg Rarity ESP with Value Counters',
      'No Clip & Barrier Bypass'
    ],
    premiumFeatures: [
      'Ghost Mode (Guards and security cameras cannot detect player)',
      'Instant Golden Egg Spawner exploit',
      'Auto Win Multi-Account Kaitun Farm Loop',
      'Safezone Teleport upon damage detection'
    ],
    loadstring: 'loadstring(game:HttpGet("https://raw.githubusercontent.com/0x1s2s/Snowy-Ui-Library/main/StealEgg.lua"))()',
    version: 'V3.4',
    latency: '< 12ms',
    bypassStatus: '100% Undetected',
    activeUsers: '1,350 Online',
    updated: 'Live & Undetected'
  },
  {
    id: 'universal-combat',
    title: 'Universal Combat & ESP Suite',
    subGenre: 'CROSS-GAME UNIVERSAL ENGINE',
    category: 'UNIVERSAL',
    thumbnail: '/assets/images/roblox-covers/universal-combat.png',
    freeCount: 8,
    premiumCount: 4,
    previewFeatures: ['Universal Silent Aim', 'Dynamic Box & Skeleton ESP', 'Hitbox Expander', 'Triggerbot Engine', 'Anti-Aim System'],
    freeFeatures: [
      'Cross-Game Universal Camera & Silent Aimbot (Supports 99% Roblox games)',
      'Dynamic 3D Box ESP, Skeleton Rig, Health Bars & Nametags',
      'Customizable FOV Ring with Smooth Interpolation & Deadzone',
      'Hitbox Expander with Adjustable Multipliers (Head, Torso, Limbs)',
      'Auto-Triggerbot with Raycast Intersection Checks',
      'Weapon No-Recoil & Zero Spread Memory Injector',
      'Custom Crosshair Generator with Spread Expansion Display',
      'Full Bright, Night Vision & Performance FPS Uncapper'
    ],
    premiumFeatures: [
      'Undetected Hypervisor Memory Protection Layer',
      'Desync Anti-Aim & Fake Pitch/Yaw Angle Engine',
      'Bullet Redirection & Target Snap Prioritization',
      'Custom Lua Script Sandbox with Built-in Decompiler'
    ],
    loadstring: 'loadstring(game:HttpGet("https://raw.githubusercontent.com/0x1s2s/Snowy-Ui-Library/main/UniversalCombat.lua"))()',
    version: 'V3.4',
    latency: '< 12ms',
    bypassStatus: '100% Undetected',
    activeUsers: '4,780 Online',
    updated: 'Live & Undetected'
  },
  {
    id: 'universal-movement',
    title: 'Universal Movement & Physics',
    subGenre: 'CROSS-GAME MOVEMENT SUITE',
    category: 'UNIVERSAL',
    thumbnail: '/assets/images/roblox-covers/universal-movement.png',
    freeCount: 8,
    premiumCount: 4,
    previewFeatures: ['Fly & Noclip Mode', 'Bunnyhop Velocity', 'Spider Climb', 'Anti-Fling Physics', 'Click To Teleport'],
    freeFeatures: [
      'Smooth Velocity Flight (CFrame & BodyVelocity Hybrid Engine)',
      'True No-Clip with Selective Collision Filter',
      'Bunnyhop & Automatic Air Strafe Velocity Assist',
      'Spider Wall Climb & Infinite Jump Override',
      'Click to Teleport using Ctrl + Left Click Mouse',
      'Speed Walk with Adaptive Anticheat Delta Compensation',
      'Anti-Fling Shield & Anchor Physics Protection',
      'Custom Gravity, JumpPower, and HipHeight Sliders'
    ],
    premiumFeatures: [
      'High-Speed Map Warp Bypass (Teleports across infinite distance)',
      'Vehicle & Seat Physics Hijacker (Fly any rideable object)',
      'Server Lag Immunity & Freecam Spectate with Teleport',
      'Stealth Flight Simulation with Natural Animations'
    ],
    loadstring: 'loadstring(game:HttpGet("https://raw.githubusercontent.com/0x1s2s/Snowy-Ui-Library/main/UniversalMovement.lua"))()',
    version: 'V3.4',
    latency: '< 12ms',
    bypassStatus: '100% Undetected',
    activeUsers: '3,850 Online',
    updated: 'Live & Undetected'
  }
];
