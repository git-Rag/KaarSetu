export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  wage: string;
  requiredTrade: string;
  requiredNSQF: number;
  postedDaysAgo: number;
  applicants: number;
  verified: boolean;
  description: string;
}

export const JOB_LISTINGS: JobListing[] = [
  {
    id: 'j1',
    title: 'Site Electrician — Residential Complex',
    company: 'Madhya Bharat Construction Pvt Ltd',
    location: 'Bhopal, MP',
    wage: '₹650–800/day',
    requiredTrade: 'Electrician',
    requiredNSQF: 2,
    postedDaysAgo: 2,
    applicants: 14,
    verified: true,
    description:
      'Urgently require 3 electricians for 6-month residential project in BHEL Colony.',
  },
  {
    id: 'j2',
    title: 'Plumber — Commercial Building',
    company: 'Central India Infrastructure',
    location: 'Indore, MP',
    wage: '₹550–700/day',
    requiredTrade: 'Plumber',
    requiredNSQF: 2,
    postedDaysAgo: 1,
    applicants: 8,
    verified: true,
    description: 'Full-time plumber needed for 4-storey commercial plumbing installation.',
  },
  {
    id: 'j3',
    title: 'Mason — Highway Project',
    company: 'MP Road Development Corp',
    location: 'Sehore, MP',
    wage: '₹500–650/day',
    requiredTrade: 'Mason',
    requiredNSQF: 2,
    postedDaysAgo: 5,
    applicants: 22,
    verified: true,
    description: 'Experienced masons for culvert and retaining wall construction.',
  },
  {
    id: 'j4',
    title: 'Welder — Fabrication Workshop',
    company: 'Bhopal Steel Works',
    location: 'Bhopal, MP',
    wage: '₹700–900/day',
    requiredTrade: 'Welder',
    requiredNSQF: 3,
    postedDaysAgo: 3,
    applicants: 6,
    verified: true,
    description: 'SMAW welder for structural steel fabrication. ITI certification preferred.',
  },
  {
    id: 'j5',
    title: 'Carpenter — Furniture Unit',
    company: 'Malwa Woodcrafts',
    location: 'Indore, MP',
    wage: '₹600–750/day',
    requiredTrade: 'Carpenter',
    requiredNSQF: 2,
    postedDaysAgo: 4,
    applicants: 11,
    verified: false,
    description: 'Skilled carpenter for custom furniture production line.',
  },
  {
    id: 'j6',
    title: 'Painter — Housing Society',
    company: 'Madhya Bharat Construction Pvt Ltd',
    location: 'Bhopal, MP',
    wage: '₹450–550/day',
    requiredTrade: 'Painter',
    requiredNSQF: 2,
    postedDaysAgo: 2,
    applicants: 19,
    verified: true,
    description: 'Interior and exterior painting for 120-flat housing society renovation.',
  },
  {
    id: 'j7',
    title: 'HVAC Technician — Mall Project',
    company: 'CoolAir Services MP',
    location: 'Bhopal, MP',
    wage: '₹800–1000/day',
    requiredTrade: 'HVAC Technician',
    requiredNSQF: 3,
    postedDaysAgo: 7,
    applicants: 4,
    verified: true,
    description: 'Split AC installation and commissioning for new shopping mall.',
  },
  {
    id: 'j8',
    title: 'Tile Layer — Luxury Apartments',
    company: 'Elite Homes Bhopal',
    location: 'Bhopal, MP',
    wage: '₹550–680/day',
    requiredTrade: 'Tile Layer / Mosaic Worker',
    requiredNSQF: 2,
    postedDaysAgo: 1,
    applicants: 9,
    verified: true,
    description: 'Floor and wall tiling for premium apartment interiors.',
  },
];
