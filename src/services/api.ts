type WeatherResponse = {
  rain?: any;
  wind?: any;
  temp?: any;
  cloud?: any;
  snow?: any;
  aod?: any;
};

const BASE_URL = "/api";

export async function fetchWeatherData(
  lat: number,
  long: number,
  date: string,
  setRes: (res: any) => void
) {
  try {
    const endpoints = ["temp", "rain", "wind", "cloud", "snow", "aod"];

    // Parallel API calls
    const responses = await Promise.all(
      endpoints.map((ep) =>
        fetch(`${BASE_URL}/${ep}?lat=${lat}&long=${long}&date=${date}`).then(async (res) => {
          if (!res.ok) throw new Error(`${ep} API error: ${res.status}`);
          const data = await res.json();
          setRes((prev: any) => {
            return {
              ...prev,
              data: [
                ...(prev?.data || []),
                data, // directly merge response object keys
              ],
            }
          });
          
          return data;
        })
      )
    );
    // // Map responses back to endpoints
    // const result: any = {};
    // endpoints.forEach((ep, idx) => {
    //   result[ep as keyof any] = responses[idx];
    // });

    return responses;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
}
