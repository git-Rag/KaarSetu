export interface TradeChecklist {
  id: string;
  label: string;
  description: string;
  isRequired: boolean;
}

export interface Trade {
  id: string;
  name: string;
  icon: string;
  sector: string;
  nsqfLevels: number[];
  checklist: TradeChecklist[];
}

export const TRADES: Trade[] = [
  {
    id: 'electrician',
    name: 'Electrician',
    icon: '⚡',
    sector: 'Construction & Infrastructure',
    nsqfLevels: [1, 2, 3, 4],
    checklist: [
      { id: 'e1', label: 'Tool identification & safe handling', description: 'Can identify and safely use: tester, pliers, wire stripper, conduit bender', isRequired: true },
      { id: 'e2', label: 'IS wire color coding', description: 'Correctly identifies Red=Phase, Black=Neutral, Green/Yellow=Earth per IS:732', isRequired: true },
      { id: 'e3', label: 'Single-line diagram reading', description: 'Can interpret basic domestic single-line electrical drawings', isRequired: true },
      { id: 'e4', label: 'Domestic wiring installation', description: 'Can install a 2-point and 3-point switch circuit with looping method', isRequired: true },
      { id: 'e5', label: 'Earthing & grounding', description: 'Demonstrates proper plate earthing or pipe earthing setup', isRequired: true },
      { id: 'e6', label: 'MCB/fuse replacement', description: 'Can safely replace MCB and rewirable fuses with correct rating', isRequired: true },
      { id: 'e7', label: 'Multimeter operation', description: 'Measures voltage, current, resistance correctly', isRequired: true },
      { id: 'e8', label: 'Distribution board wiring', description: 'Can wire a 4-way MCB distribution board from energy meter', isRequired: false },
      { id: 'e9', label: '3-phase identification', description: 'Explains difference between single-phase and 3-phase supply', isRequired: false },
      { id: 'e10', label: 'IS safety standards', description: 'Demonstrates knowledge of PPE, lockout/tagout procedure', isRequired: true },
    ],
  },
  {
    id: 'plumber',
    name: 'Plumber',
    icon: '🔧',
    sector: 'Construction & Infrastructure',
    nsqfLevels: [1, 2, 3],
    checklist: [
      { id: 'p1', label: 'Plumbing tool identification', description: 'Can identify pipe wrench, cutter, threading die, plunger, PTFE tape', isRequired: true },
      { id: 'p2', label: 'Pipe material knowledge', description: 'Knows properties and use-cases of GI, CPVC, UPVC, PPR pipes', isRequired: true },
      { id: 'p3', label: 'Pipe joining techniques', description: 'Demonstrates threaded, solvent-weld, and compression joints', isRequired: true },
      { id: 'p4', label: 'Ball valve installation', description: 'Can install a full-bore ball valve correctly with thread sealant', isRequired: true },
      { id: 'p5', label: 'Drainage slope calculation', description: 'Knows 1:40 minimum slope rule for horizontal drain pipes', isRequired: true },
      { id: 'p6', label: 'Tap/faucet repair', description: 'Can disassemble, replace washer, and reassemble a compression tap', isRequired: true },
      { id: 'p7', label: 'Leak detection', description: 'Can locate concealed leak using pressure test and sound', isRequired: false },
      { id: 'p8', label: 'Water meter reading', description: 'Can read a water meter and explain billing calculation', isRequired: false },
      { id: 'p9', label: 'NBC code awareness', description: 'Familiar with National Building Code plumbing requirements', isRequired: false },
      { id: 'p10', label: 'Sanitary fitting installation', description: 'Can install a WC cistern and connect supply', isRequired: true },
    ],
  },
  {
    id: 'mason',
    name: 'Mason',
    icon: '🧱',
    sector: 'Construction & Infrastructure',
    nsqfLevels: [1, 2, 3],
    checklist: [
      { id: 'm1', label: 'Mortar mixing', description: 'Prepares 1:6 CM mortar for brickwork and 1:4 for plastering correctly', isRequired: true },
      { id: 'm2', label: 'Brick bonding patterns', description: 'Demonstrates English Bond and Flemish Bond in practice', isRequired: true },
      { id: 'm3', label: 'Level and plumb work', description: 'Lays 5 courses of brick maintaining ±2mm tolerance', isRequired: true },
      { id: 'm4', label: 'Drawing interpretation', description: 'Reads basic plan and elevation construction drawings', isRequired: true },
      { id: 'm5', label: 'Concrete curing', description: 'Explains why and how to cure concrete for minimum 7 days', isRequired: true },
      { id: 'm6', label: 'Wall plastering', description: 'Plasters a 1m² wall to smooth finish in 2 coats', isRequired: true },
      { id: 'm7', label: 'Door/window frame fixing', description: 'Can set and plumb a door frame in masonry opening', isRequired: false },
      { id: 'm8', label: 'Material quantity estimation', description: 'Calculates bricks and mortar needed for a given wall area', isRequired: false },
      { id: 'm9', label: 'Waterproofing basics', description: 'Applies SBR-based waterproofing treatment to wet area', isRequired: false },
      { id: 'm10', label: 'Safety practices', description: 'Uses PPE, knows scaffold erection safety rules', isRequired: true },
    ],
  },
  {
    id: 'welder',
    name: 'Welder',
    icon: '🔥',
    sector: 'Manufacturing & Fabrication',
    nsqfLevels: [1, 2, 3, 4],
    checklist: [
      { id: 'w1', label: 'Welding equipment setup', description: 'Sets up SMAW (MMA) welding machine with correct polarity', isRequired: true },
      { id: 'w2', label: 'Electrode selection', description: 'Selects correct electrode for mild steel, stainless, cast iron', isRequired: true },
      { id: 'w3', label: 'PPE compliance', description: 'Wears welding helmet, gloves, apron, and boots', isRequired: true },
      { id: 'w4', label: 'Flat position weld', description: 'Produces a flat butt weld with < 2mm undercut', isRequired: true },
      { id: 'w5', label: 'Vertical position weld', description: 'Produces a vertical fillet weld without porosity', isRequired: false },
      { id: 'w6', label: 'Weld inspection', description: 'Identifies porosity, undercut, and overlap defects visually', isRequired: true },
      { id: 'w7', label: 'Distortion control', description: 'Demonstrates back-step welding to minimize distortion', isRequired: false },
      { id: 'w8', label: 'Gas cutting', description: 'Can set up oxy-acetylene cutting torch and cut 10mm plate', isRequired: false },
      { id: 'w9', label: 'Blueprint reading', description: 'Reads basic fabrication drawing with weld symbols', isRequired: false },
      { id: 'w10', label: 'Fire safety', description: 'Knows fire watch procedure and extinguisher types for welding area', isRequired: true },
    ],
  },
  {
    id: 'carpenter',
    name: 'Carpenter',
    icon: '🪵',
    sector: 'Construction & Furniture',
    nsqfLevels: [1, 2, 3],
    checklist: [
      { id: 'c1', label: 'Tool sharpening & maintenance', description: 'Can sharpen chisels and plane blades to working edge', isRequired: true },
      { id: 'c2', label: 'Wood species knowledge', description: 'Identifies Teak, Sal, Neem, Plywood, MDF and their uses', isRequired: true },
      { id: 'c3', label: 'Measurement & marking', description: 'Uses try square, marking gauge, and steel rule accurately', isRequired: true },
      { id: 'c4', label: 'Joinery — mortise & tenon', description: 'Cuts a mortise & tenon joint with < 1mm gap', isRequired: false },
      { id: 'c5', label: 'Joinery — dovetail', description: 'Cuts a single dovetail joint by hand', isRequired: false },
      { id: 'c6', label: 'Door frame installation', description: 'Fits and plumbs a door frame, installs hinges correctly', isRequired: true },
      { id: 'c7', label: 'Surface finishing', description: 'Sands wood from 80→120→180 grit and applies wood primer', isRequired: true },
      { id: 'c8', label: 'Power tool safety', description: 'Safely operates circular saw and electric drill', isRequired: true },
      { id: 'c9', label: 'Drawing reading', description: 'Interprets furniture working drawings with dimensions', isRequired: false },
      { id: 'c10', label: 'Material estimation', description: 'Calculates timber and sheet material for a given job', isRequired: false },
    ],
  },
  {
    id: 'painter',
    name: 'Painter & Decorator',
    icon: '🎨',
    sector: 'Construction & Finishing',
    nsqfLevels: [1, 2],
    checklist: [
      { id: 'pt1', label: 'Surface preparation', description: 'Scrapes, fills, and sands a wall surface to painting standard', isRequired: true },
      { id: 'pt2', label: 'Primer application', description: 'Applies PVA or wall primer correctly for new plaster', isRequired: true },
      { id: 'pt3', label: 'Brush technique', description: 'Applies emulsion paint without brush marks using correct technique', isRequired: true },
      { id: 'pt4', label: 'Roller technique', description: 'Applies emulsion with roller in W-pattern without roller marks', isRequired: true },
      { id: 'pt5', label: 'Cutting-in', description: 'Cuts in at ceiling-wall junction without masking tape < 3mm deviation', isRequired: false },
      { id: 'pt6', label: 'Paint mixing', description: 'Mixes tinting paste to achieve target colour correctly', isRequired: false },
      { id: 'pt7', label: 'Exterior paint', description: 'Knows weather-shield and texture coat application process', isRequired: false },
      { id: 'pt8', label: 'Material calculation', description: 'Calculates litres of paint needed for a room', isRequired: true },
      { id: 'pt9', label: 'Tool care', description: 'Cleans and stores brushes, rollers, and paint trays properly', isRequired: true },
      { id: 'pt10', label: 'Safety', description: 'Uses gloves, mask, and eye protection; knows ventilation rules', isRequired: true },
    ],
  },
  {
    id: 'hvac',
    name: 'HVAC Technician',
    icon: '❄️',
    sector: 'Mechanical & Electrical Services',
    nsqfLevels: [2, 3, 4],
    checklist: [
      { id: 'h1', label: 'AC types & components', description: 'Explains Split, Window, Cassette, Central AC components', isRequired: true },
      { id: 'h2', label: 'Split AC installation', description: 'Installs indoor and outdoor units, runs refrigerant piping', isRequired: true },
      { id: 'h3', label: 'Refrigerant charging', description: 'Evacuates and charges R-32 to correct superheat', isRequired: true },
      { id: 'h4', label: 'Electrical connections', description: 'Connects single-phase supply, checks earthing on installation', isRequired: true },
      { id: 'h5', label: 'Fault diagnosis', description: 'Diagnoses gas leak, compressor failure, PCB fault', isRequired: true },
      { id: 'h6', label: 'Gas leak detection', description: 'Uses soap solution and electronic sniffer for leak test', isRequired: false },
      { id: 'h7', label: 'Duct cleaning', description: 'Cleans indoor unit coil and filter to specification', isRequired: false },
      { id: 'h8', label: 'F-gas regulations', description: 'Aware of HFC phase-down schedule and record-keeping', isRequired: false },
      { id: 'h9', label: 'Star rating knowledge', description: 'Explains BEE star ratings and their energy implications', isRequired: false },
      { id: 'h10', label: 'Safety', description: 'Uses PPE, knows refrigerant safety data', isRequired: true },
    ],
  },
  {
    id: 'tile_layer',
    name: 'Tile Layer / Mosaic Worker',
    icon: '🏠',
    sector: 'Construction & Finishing',
    nsqfLevels: [1, 2],
    checklist: [
      { id: 't1', label: 'Surface assessment', description: 'Checks floor for level, hollow spots, and moisture before tiling', isRequired: true },
      { id: 't2', label: 'Layout planning', description: 'Plans tile layout to avoid small cuts at doorways', isRequired: true },
      { id: 't3', label: 'Adhesive mixing', description: 'Mixes tile adhesive to correct consistency for floor/wall', isRequired: true },
      { id: 't4', label: 'Floor tile laying', description: 'Lays 1m² of floor tiles with consistent 2mm joints, level', isRequired: true },
      { id: 't5', label: 'Wall tile laying', description: 'Tiles a bathroom wall section plumb and square', isRequired: true },
      { id: 't6', label: 'Tile cutting', description: 'Uses wet saw and score-snap cutter accurately', isRequired: true },
      { id: 't7', label: 'Grouting', description: 'Applies and finishes grout without smearing on tile face', isRequired: true },
      { id: 't8', label: 'Skirting tiles', description: 'Fits and mitres skirting tile at corners', isRequired: false },
      { id: 't9', label: 'Waterproof membrane', description: 'Applies tanking slurry to wet area before tiling', isRequired: false },
      { id: 't10', label: 'Material estimation', description: 'Calculates tiles + wastage for a room', isRequired: true },
    ],
  },
];

export const TRADE_MAP = Object.fromEntries(TRADES.map((t) => [t.id, t]));
export const TRADE_NAMES = TRADES.map((t) => t.name);

export function getTradeByName(name: string): Trade | undefined {
  return TRADES.find((t) => t.name === name || t.id === name);
}

export function getTradeIdFromName(name: string): string | undefined {
  const trade = TRADES.find((t) => t.name === name);
  return trade?.id;
}
