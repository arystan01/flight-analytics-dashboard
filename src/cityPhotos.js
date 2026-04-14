// Curated Unsplash photo IDs per airport/city
const PHOTOS = {
  ATL: '1575917649705-5b59aaa12e6b', // Atlanta skyline
  ORD: '1477959858617-67f85cf4f1df', // Chicago skyline
  MDW: '1477959858617-67f85cf4f1df', // Chicago
  DFW: '1545194445-dddb8f4487c6',    // Dallas skyline
  CLT: '1563387852576-964bc31b73af', // Charlotte skyline
  DEN: '1531366936337-7c912a4589a7', // Denver / Rocky Mountains
  LAX: '1534190760961-74e8c1c5c3da', // Los Angeles
  SFO: '1501594907352-04cda38ebc29', // Golden Gate Bridge
  LGA: '1485871981521-5b1fd3805eee', // New York skyline
  JFK: '1485871981521-5b1fd3805eee', // New York
  EWR: '1485871981521-5b1fd3805eee', // New York
  DCA: '1501466044931-62695aada8e9', // Washington DC
  BWI: '1501466044931-62695aada8e9', // DC area
  BOS: '1569530142884-677f12a9ce1b', // Boston
  MIA: '1506905925346-21bda4d32df4', // Miami beach
  FLL: '1506905925346-21bda4d32df4', // Fort Lauderdale
  SEA: '1502175353753-8af64e925a22', // Seattle
  PHX: '1469854523086-cc02fe5d8800',  // Phoenix / Arizona red rock
  LAS: '1605833556294-ea5c7a74f57d', // Las Vegas strip
  HNL: '1507876466758-890ee1e4f7cc', // Hawaii
  OGG: '1507876466758-890ee1e4f7cc', // Maui
  SAN: '1538689621163-f0aa0c3db346', // San Diego
  MSP: '1548624313-0396c75e4b1a',    // Minneapolis
  DTW: '1548624313-0396c75e4b1a',    // Detroit
  IAH: '1506146332389-18140dc7b2fb', // Houston skyline
  MCO: '1564521543878-fc5ede79ea63', // Orlando
  PHL: '1569761316261-9a8696fa2ca3', // Philadelphia
  TPA: '1535498730771-e735b998cd64', // Tampa
  PDX: '1500534314209-a25ddb2bd429', // Portland
  SLC: '1581474588563-e4a3e2ef0234', // Salt Lake City
  MSY: '1568901346375-23c9450c58cd', // New Orleans
  STL: '1548624313-0396c75e4b1a',    // St. Louis
}

const AVIATION = '1436491865332-7a61a109cc05' // airplane wing fallback
const RUNWAY   = '1544620347-c4fd4a3d5957'    // airport runway

export function cityPhotoUrl(code, w = 800) {
  const id = PHOTOS[code] || AVIATION
  return `https://images.unsplash.com/photo-${id}?w=${w}&q=80&fit=crop`
}

export function runwayPhotoUrl(w = 1400) {
  return `https://images.unsplash.com/photo-${RUNWAY}?w=${w}&q=80&fit=crop`
}

export const heroPhotoUrl =
  `https://images.unsplash.com/photo-${AVIATION}?w=1400&q=80&fit=crop`
