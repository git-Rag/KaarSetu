export interface TradeChecklist {
  id: string;
  label: string;
  description: string;
  isRequired: boolean;
  maxScore?: number;
}

export interface Trade {
  id: string;
  name: string;
  icon: string;
  sector: string;
  nsqfLevels: number[];
  testTitle: string;
  practicalDurationMinutes: number;
  passingScore: number;
  checklist: TradeChecklist[];
  evidenceSuggestions: string[];
  moduleInstructions: string;
}

export const TRADES: Trade[] = [
  {
    id: 'electrician',
    name: 'Electrician',
    icon: '⚡',
    sector: 'Construction & Infrastructure',
    nsqfLevels: [1, 2, 3, 4],
    testTitle: 'Electrician Level 2 Practical Assessment',
    practicalDurationMinutes: 90,
    passingScore: 70,
    moduleInstructions:
      'Observe the worker performing each task on-site or at the ITI lab bench. Mark Pass only when demonstrated competently without assessor intervention. Use Partial when the worker completes with minor guidance.',
    evidenceSuggestions: [
      'Photo of completed switchboard wiring',
      'Short video of tester/multimeter usage',
      'Photo of assessor checklist sheet if available',
    ],
    checklist: [
      {
        id: 'e1',
        label: 'Tool identification and safe handling',
        description:
          'Worker identifies tester, pliers, wire stripper, insulation tape, MCB, switch, and socket.',
        isRequired: true,
      },
      {
        id: 'e2',
        label: 'Wire color code knowledge',
        description: 'Worker explains phase, neutral, and earth wire color usage.',
        isRequired: true,
      },
      {
        id: 'e3',
        label: 'Basic switchboard wiring',
        description: 'Worker wires a simple switch, bulb holder, and socket circuit.',
        isRequired: true,
      },
      {
        id: 'e4',
        label: 'Multimeter/tester usage',
        description: 'Worker demonstrates basic voltage/continuity testing.',
        isRequired: true,
      },
      {
        id: 'e5',
        label: 'MCB/fuse safety',
        description: 'Worker explains when and how to isolate power before repair.',
        isRequired: true,
      },
      {
        id: 'e6',
        label: 'Fault detection',
        description: 'Worker identifies a simulated loose connection or broken circuit.',
        isRequired: true,
      },
      {
        id: 'e7',
        label: 'Earthing awareness',
        description: 'Worker explains why earthing is required and identifies earth wire.',
        isRequired: false,
      },
      {
        id: 'e8',
        label: 'Safety and PPE',
        description: 'Worker follows safety precautions during the test.',
        isRequired: true,
      },
    ],
  },
  {
    id: 'plumber',
    name: 'Plumber',
    icon: '🔧',
    sector: 'Construction & Infrastructure',
    nsqfLevels: [1, 2, 3],
    testTitle: 'Plumber Level 2 Practical Assessment',
    practicalDurationMinutes: 75,
    passingScore: 70,
    moduleInstructions:
      'Conduct at a plumbing bay with live fittings. Worker must demonstrate joints and repairs physically — not verbally only.',
    evidenceSuggestions: [
      'Photo of completed pipe joint',
      'Short video of leak detection or valve fitting',
      'Photo of repaired tap/faucet',
    ],
    checklist: [
      {
        id: 'p1',
        label: 'Tool identification',
        description:
          'Worker identifies pipe wrench, cutter, PTFE tape, plunger, elbow, tee, and valve.',
        isRequired: true,
      },
      {
        id: 'p2',
        label: 'Pipe material knowledge',
        description: 'Worker identifies PVC, CPVC, GI, and flexible pipe use cases.',
        isRequired: true,
      },
      {
        id: 'p3',
        label: 'Joint preparation',
        description: 'Worker prepares pipe end, applies tape/adhesive, and fits joint correctly.',
        isRequired: true,
      },
      {
        id: 'p4',
        label: 'Tap/faucet repair',
        description: 'Worker disassembles and reassembles a basic tap/faucet.',
        isRequired: true,
      },
      {
        id: 'p5',
        label: 'Leak detection',
        description: 'Worker identifies a visible/simulated leak and explains fix.',
        isRequired: true,
      },
      {
        id: 'p6',
        label: 'Valve installation',
        description: 'Worker installs or demonstrates correct valve fitting direction.',
        isRequired: true,
      },
      {
        id: 'p7',
        label: 'Drainage slope understanding',
        description: 'Worker explains basic slope requirement for drainage flow.',
        isRequired: false,
      },
      {
        id: 'p8',
        label: 'Safety and cleanliness',
        description: 'Worker maintains clean working area and uses safe handling.',
        isRequired: true,
      },
    ],
  },
  {
    id: 'painter',
    name: 'Painter',
    icon: '🎨',
    sector: 'Construction & Finishing',
    nsqfLevels: [1, 2],
    testTitle: 'Painter Level 2 Practical Assessment',
    practicalDurationMinutes: 120,
    passingScore: 70,
    moduleInstructions:
      'Provide a prepared wall patch or board. Worker must complete surface prep through finish coat during the session.',
    evidenceSuggestions: [
      'Before/after photo of painted surface',
      'Short video of roller/brush technique',
      'Photo of final finish',
    ],
    checklist: [
      {
        id: 'pt1',
        label: 'Surface preparation',
        description:
          'Worker scrapes, cleans, fills cracks, and sands surface before painting.',
        isRequired: true,
      },
      {
        id: 'pt2',
        label: 'Tool identification',
        description:
          'Worker identifies brush, roller, tray, scraper, sandpaper, and putty knife.',
        isRequired: true,
      },
      {
        id: 'pt3',
        label: 'Primer application',
        description: 'Worker applies primer evenly on prepared surface.',
        isRequired: true,
      },
      {
        id: 'pt4',
        label: 'Paint mixing',
        description:
          'Worker mixes paint correctly with water/thinner ratio as instructed.',
        isRequired: true,
      },
      {
        id: 'pt5',
        label: 'Brush technique',
        description: 'Worker paints edges/corners with clean strokes.',
        isRequired: true,
      },
      {
        id: 'pt6',
        label: 'Roller technique',
        description: 'Worker applies paint evenly using roller without heavy patches.',
        isRequired: true,
      },
      {
        id: 'pt7',
        label: 'Finish quality',
        description: 'Final painted patch has acceptable coverage and smoothness.',
        isRequired: true,
      },
      {
        id: 'pt8',
        label: 'Safety and cleanup',
        description: 'Worker uses mask/gloves where needed and cleans tools after use.',
        isRequired: false,
      },
    ],
  },
];

export const TRADE_MAP = Object.fromEntries(TRADES.map((t) => [t.id, t]));
export const TRADE_NAMES = TRADES.map((t) => t.name);
export const DEMO_TRADE_IDS = TRADES.map((t) => t.id);

const NAME_ALIASES: Record<string, string> = {
  'painter & decorator': 'painter',
  'painter and decorator': 'painter',
};

export function getTradeByName(name: string): Trade | undefined {
  const normalized = name.trim().toLowerCase();
  const aliasId = NAME_ALIASES[normalized];
  if (aliasId) return TRADE_MAP[aliasId];
  return TRADES.find((t) => t.name.toLowerCase() === normalized || t.id === normalized);
}

export function getTradeIdFromName(name: string): string | undefined {
  return getTradeByName(name)?.id;
}

export function getTradeById(id: string): Trade | undefined {
  return TRADE_MAP[id];
}
