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
    const endpoints = [ "temp", "rain", "wind", "cloud", "snow", "aod" ];

    // Parallel API calls
    const responses = await Promise.all(
      endpoints.map((ep) =>
        fetch(`${BASE_URL}/${ep}?lat=${lat}&long=${long}&date=${date}`).then((res) => {
          if (!res.ok) throw new Error(`${ep} API error: ${res.status}`);
          // const data = res.json();
          // setRes((prev: any) => {
          //   return {
          //     payload: prev?.payload,
          //     data: {
          //       ...prev?.data,
          //       ...data,
          //     }
          //   }
          // });
          return res.json();
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
