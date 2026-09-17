export interface UserMatchingProfile {
  id: string;
  age: number;
  locationCity: string;
  locationLat?: number | null;
  locationLng?: number | null;
  pujaDays: string[];
  timeSlots: string[];
  interests: string[];
  bio?: string | null;
}

// Calculate approximate haversine distance in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function calculateVibeMatch(
  me: UserMatchingProfile,
  candidate: UserMatchingProfile
): { vibeScore: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Normalize day and slot names for clean comparison (deduplicated)
  const myDays = Array.from(new Set(me.pujaDays.map((d) => d.toUpperCase())));
  const theirDays = Array.from(new Set(candidate.pujaDays.map((d) => d.toUpperCase())));
  const sharedDays = myDays.filter((d) => theirDays.includes(d));

  const mySlots = Array.from(new Set(me.timeSlots.map((s) => s.toUpperCase())));
  const theirSlots = Array.from(new Set(candidate.timeSlots.map((s) => s.toUpperCase())));
  const sharedSlots = mySlots.filter((s) => theirSlots.includes(s));

  // 1. Puja Days Alone Compatibility (40% max)
  let dayScore = 0;
  if (myDays.length > 0 && sharedDays.length > 0) {
    const dayRatio = sharedDays.length / Math.max(myDays.length, theirDays.length);
    dayScore = Math.round(dayRatio * 40);
    score += dayScore;
    const formattedDays = sharedDays.map((d) => {
      switch (d) {
        case 'SHASHTI': return 'Shashti';
        case 'SAPTAMI': return 'Saptami';
        case 'ASHTAMI': return 'Ashtami';
        case 'NABAMI': return 'Nabami';
        case 'DASHAMI': return 'Dashami';
        default: return d.charAt(0) + d.slice(1).toLowerCase();
      }
    });
    reasons.push(`✓ Both alone on ${formattedDays.join(', ')}`);
  }

  // 2. Time Slot Compatibility (30% max)
  let slotScore = 0;
  if (mySlots.length > 0 && sharedSlots.length > 0) {
    const slotRatio = sharedSlots.length / Math.max(mySlots.length, theirSlots.length);
    slotScore = Math.round(slotRatio * 30);
    score += slotScore;
    const formattedSlots = sharedSlots.map((s) => {
      switch (s) {
        case 'MORNING': return 'Morning';
        case 'AFTERNOON': return 'Lunch';
        case 'EVENING': return 'Evening';
        case 'NIGHT': return 'Night';
        default: return s.charAt(0) + s.slice(1).toLowerCase();
      }
    });
    reasons.push(`✓ Matching free time (${formattedSlots.join(', ')})`);
  }

  // 3. Location Compatibility (30% max)
  let isSameCity = false;
  if (me.locationLat && me.locationLng && candidate.locationLat && candidate.locationLng) {
    const dist = calculateDistance(
      me.locationLat,
      me.locationLng,
      candidate.locationLat,
      candidate.locationLng
    );
    if (dist <= 5) {
      score += 30;
      isSameCity = true;
      reasons.push(`✓ Same neighborhood (~${Math.round(dist)} km away)`);
    } else if (dist <= 15) {
      score += 22;
      reasons.push(`✓ Nearby location (~${Math.round(dist)} km)`);
    } else if (dist <= 30) {
      score += 15;
      reasons.push(`✓ Within metro area (~${Math.round(dist)} km)`);
    } else {
      score += 5;
    }
  } else if (me.locationCity && candidate.locationCity) {
    const myCityNorm = me.locationCity.trim().toLowerCase();
    const theirCityNorm = candidate.locationCity.trim().toLowerCase();
    if (myCityNorm === theirCityNorm || myCityNorm.includes(theirCityNorm) || theirCityNorm.includes(myCityNorm)) {
      score += 30;
      isSameCity = true;
      reasons.push(`✓ Same location (${candidate.locationCity})`);
    } else {
      score += 8;
    }
  }

  // Perfect Match Boost: Same days + same times + same location
  if (dayScore >= 35 && slotScore >= 25 && isSameCity) {
    score = 100;
    reasons.unshift('🔥 Perfect Schedule & Location Match!');
  } else {
    // Normalization minimum if there is any overlap
    score = Math.max(score, sharedDays.length > 0 || sharedSlots.length > 0 ? 30 : 15);
  }

  const finalScore = Math.min(100, score);
  return {
    vibeScore: finalScore,
    reasons: reasons.slice(0, 3),
  };
}
