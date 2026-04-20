import axios from 'axios';

const GHANA_POST_BASE = 'https://ghanapostgps.speakingcomputer.com';
const API_KEY = process.env.EXPO_PUBLIC_GHANA_POST_API_KEY || '';

export interface GhanaPostResult {
  postCode: string;
  regionName: string;
  districtName: string;
  streetName?: string;
  latitude: number;
  longitude: number;
}

/**
 * Looks up a GhanaPostGPS digital address and returns the decoded location.
 * Returns null if the API key is missing, the address is blank, or the request fails.
 */
export async function lookupGhanaPostAddress(
  gpsAddress: string,
): Promise<GhanaPostResult | null> {
  if (!API_KEY || !gpsAddress.trim()) return null;

  try {
    const res = await axios.get(
      `${GHANA_POST_BASE}/v1/Client/GetGPSAddressInfo`,
      {
        params: { GPSName: gpsAddress.trim().toUpperCase(), Type: 0 },
        headers: { 'x-api-key': API_KEY },
        timeout: 8000,
      },
    );

    // The API wraps the result in different shapes — handle common variants
    const raw = res.data?.Data?.address ?? res.data?.Data ?? res.data;
    if (!raw) return null;

    return {
      postCode:     raw.PostCode     ?? gpsAddress,
      regionName:   raw.RegionName   ?? '',
      districtName: raw.DistrictName ?? '',
      streetName:   raw.StreetName,
      latitude:     parseFloat(raw.Latitude  ?? raw.lat  ?? '0'),
      longitude:    parseFloat(raw.Longitude ?? raw.lng  ?? '0'),
    };
  } catch {
    return null;
  }
}
