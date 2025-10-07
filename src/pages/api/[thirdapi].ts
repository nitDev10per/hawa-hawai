
// /pages/api/proxy.ts
import type { NextApiRequest, NextApiResponse } from "next";

// Utility function for safe fetch
async function fetchNASAData(
  lon: number,
  lat: number,
  startYear: number,
  endYear: number,
  parameters: string[],
  monthStart: number,
  dayStart: number,
  monthEnd: number,
  dayEnd: number
) {
  const allRecords: any[] = [];

  console.log('parameters', parameters, lon, lat, startYear, endYear, monthStart, dayStart, monthEnd, dayEnd);

  for (let year = startYear; year <= endYear; year++) {
    try {
      // Handle invalid dates (e.g., Feb 29 non-leap years)
      const startRange = new Date(year, monthStart - 1, dayStart);
      const endRange = new Date(year, monthEnd - 1, dayEnd);

      if (isNaN(startRange.getTime()) || isNaN(endRange.getTime())) {
        continue;
      }

      const startStr = `${startRange.getFullYear()}${String(
        startRange.getMonth() + 1
      ).padStart(2, "0")}${String(startRange.getDate()).padStart(2, "0")}`;
      const endStr = `${endRange.getFullYear()}${String(
        endRange.getMonth() + 1
      ).padStart(2, "0")}${String(endRange.getDate()).padStart(2, "0")}`;

      const paramStr = parameters.join(",");

      const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=${paramStr}&community=RE&longitude=${lon}&latitude=${lat}&start=${startStr}&end=${endStr}&format=JSON&units=metric&header=true&time-standard=utc`;

      const response = await fetch(url, { method: "GET" });
      if (!response.ok) {
        console.error(`[ERROR] Request failed for year ${year}: ${response.statusText}`);
        continue;
      }

      const data = await response.json();

      const [lon_, lat_, elev_] = data.geometry.coordinates;
      const params = data.properties.parameter;
      const dates = Object.keys(params[parameters[0]]);

      for (const d of dates) {
        const record: any = {
          Longitude: lon_,
          Latitude: lat_,
          Elevation: elev_,
          Date: new Date(
            parseInt(d.substring(0, 4)),
            parseInt(d.substring(4, 6)) - 1,
            parseInt(d.substring(6, 8))
          ),
        };

        let missing = false;
        for (const p of parameters) {
          const val = params?.[p]?.[d] ?? -999.0;
          record[p] = val;
          if (val === -999.0) missing = true;
        }

        if (!missing) allRecords.push(record);
      }
    } catch (err) {
      console.error(`[ERROR] Failed for year ${year}:`, err);
      continue;
    }
  }

  return allRecords;
}

const paramsMap: Map<string, string> = new Map([
  ["aod", "Air Quality"],
  ["temp", "Temperature"],
  ["cloud", "Cloud Cover"],
  ["rain", "Rain"],
  ["snow", "Snow"],
  ["wind", "Wind"],
]);



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { thirdapi, ...query } = req.query;

    const url = `http://127.0.0.1:5000/api/${thirdapi}?${new URLSearchParams(query as any)}`;
    const response = await fetch(url);
    const data = await response.json();

    console.log('response2', data);

    const {
      lat,
      lon,
      start_year,
      end_year,
      month_start,
      day_start,
      month_end,
      day_end,
      parameters,
    } = data;

    const records = await fetchNASAData(
      Number(lon),
      Number(lat),
      Number(start_year),
      Number(end_year),
      parameters,
      Number(month_start) || 1,
      Number(day_start) || 1,
      Number(month_end) || 12,
      Number(day_end) || 31
    );

    console.log('response2', records);

    const afterResUrl = `http://127.0.0.1:5000/api/${thirdapi}_after_res?api_result=${encodeURIComponent(
      JSON.stringify(records)
    )}`;

    const afterRes = await fetch(afterResUrl);
    const afterResData = await afterRes.json();

    const key = paramsMap.get(thirdapi as string) || "Result";

    res.status(200).json({ [key]: afterResData });
  } catch (err: any) {
    console.error("[API ERROR]", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

