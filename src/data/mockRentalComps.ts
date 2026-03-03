export interface RentalComp {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  rent: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  yearBuilt: number;
  status: 'Active' | 'Pending' | 'Leased';
  daysOnMarket: number;
  distance: number; // miles from subject
  source: string;
  listDate: string;
  photos: string[];
}

// Haversine distance in miles
export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Seeded pseudo-random for consistent results per unit
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const STREET_NAMES = [
  'Oak', 'Maple', 'Cedar', 'Pine', 'Elm', 'Birch', 'Walnut', 'Magnolia',
  'Willow', 'Hickory', 'Pecan', 'Cypress', 'Sycamore', 'Laurel', 'Dogwood',
  'Holly', 'Poplar', 'Chestnut', 'Spruce', 'Juniper',
];

const STREET_TYPES = ['St', 'Ave', 'Dr', 'Ln', 'Ct', 'Blvd', 'Way', 'Pl'];

const SOURCES = ['Zillow', 'Realtor.com', 'Redfin', 'MLS', 'RentRange'];

// Deterministic placeholder photos using picsum with seeded IDs
function generateMockPhotos(rand: () => number): string[] {
  const count = 1 + Math.floor(rand() * 4); // 1-4 photos
  const photos: string[] = [];
  for (let i = 0; i < count; i++) {
    const picId = 10 + Math.floor(rand() * 200);
    photos.push(`https://picsum.photos/id/${picId}/640/480`);
  }
  return photos;
}

export function generateMockComps(
  subjectLat: number,
  subjectLng: number,
  subjectRent: number | null,
  subjectCity: string,
  subjectState: string,
  subjectZip: string,
  unitId: string
): RentalComp[] {
  const baseRent = subjectRent || 1500;
  const seed = unitId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const rand = seededRandom(seed);

  const count = 15 + Math.floor(rand() * 6); // 15-20 comps
  const comps: RentalComp[] = [];

  for (let i = 0; i < count; i++) {
    // Random distance 0.1 to 5 miles
    const distance = 0.1 + rand() * 4.9;
    const angle = rand() * 2 * Math.PI;
    // ~1 mile ≈ 0.0145 degrees lat, ~0.0181 degrees lng at 33° lat
    const latOffset = (distance * Math.cos(angle)) * 0.0145;
    const lngOffset = (distance * Math.sin(angle)) * 0.0181;

    const rentVariation = baseRent * (0.7 + rand() * 0.6); // ±30%
    const beds = [2, 3, 3, 3, 4, 4][Math.floor(rand() * 6)];
    const baths = [1, 1.5, 2, 2, 2.5][Math.floor(rand() * 5)];
    const sqft = 800 + Math.floor(rand() * 1200);
    const yearBuilt = 1960 + Math.floor(rand() * 60);
    const statusOptions: RentalComp['status'][] = ['Active', 'Active', 'Active', 'Pending', 'Leased', 'Leased'];
    const status = statusOptions[Math.floor(rand() * statusOptions.length)];
    const dom = status === 'Active' ? Math.floor(rand() * 45) : Math.floor(rand() * 90);

    const streetNum = 100 + Math.floor(rand() * 9900);
    const streetName = STREET_NAMES[Math.floor(rand() * STREET_NAMES.length)];
    const streetType = STREET_TYPES[Math.floor(rand() * STREET_TYPES.length)];

    const daysAgo = Math.floor(rand() * 90);
    const listDate = new Date();
    listDate.setDate(listDate.getDate() - daysAgo);

    comps.push({
      id: `comp-${unitId.slice(0, 8)}-${i}`,
      address: `${streetNum} ${streetName} ${streetType}`,
      city: subjectCity,
      state: subjectState,
      zipCode: subjectZip,
      latitude: subjectLat + latOffset,
      longitude: subjectLng + lngOffset,
      rent: Math.round(rentVariation / 25) * 25,
      bedrooms: beds,
      bathrooms: baths,
      sqft,
      yearBuilt,
      status,
      daysOnMarket: dom,
      distance: Math.round(distance * 100) / 100,
      source: SOURCES[Math.floor(rand() * SOURCES.length)],
      listDate: listDate.toISOString().split('T')[0],
      photos: generateMockPhotos(rand),
    });
  }

  return comps.sort((a, b) => a.distance - b.distance);
}

export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}
