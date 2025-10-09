import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import WeatherAnimation from "@/components/WeatherAnimation";
import { WeatherGround } from "@/components/WeatherGround";
import { fetchWeatherData } from "@/services/api";


const MapComponent = dynamic(() => import("../components/MapComponent"), {
  ssr: false, // Disable server-side rendering
});

type WeatherData = Record<string, Record<string, number>>[];

function getWeatherCategory(
  data: WeatherData
): "rain" | "cold" | "sunny" | "normal" {
  const temperature = data.find(d => d["Temperature"])?.["Temperature"] ?? {};
  const rain = data.find(d => d["Rain"])?.["Rain"] ?? {};
  const cloud = data.find(d => d["Cloud Cover"])?.["Cloud Cover"] ?? {};

  const tempMild = temperature["Mild (10°C to 20°C)"] ?? 0;
  const tempWarm = temperature["Warm (20°C to 35°C)"] ?? 0;
  const tempHot = temperature["Hot (35°C to 45°C)"] ?? 0;

  const noRain = rain["No Rain"] ?? 0;
  const heavyRain = rain["Heavy Rain"] ?? 0;
  const moderateRain = rain["Moderate Rain"] ?? 0;
  const lightRain = rain["Light Rain"] ?? 0;

  const sunny = cloud["Sunny"] ?? 0;
  const cloudy = cloud["Cloudy"] ?? 0;

  if (heavyRain + moderateRain + lightRain > 50) return "rain";
  if ((tempWarm > 70 && sunny > 40 && noRain > 60) || tempHot > 75) return "sunny";
  if (tempMild < 40 && cloudy > 50) return "cold";
  return "normal";
}

type CategoryColorMap = Record<string, string>;

const categoryColors: CategoryColorMap = {
  "Extremely Polluted": "bg-red-500",
  "Heavily Polluted": "bg-orange-500",
  "Moderate": "bg-yellow-400",
  "Cloudy": "bg-gray-400",
  "Partly Cloudy": "bg-gray-200",
  "Sunny": "bg-yellow-300",
  "Mild (10°C to 20°C)": "bg-green-300",
  "Warm (20°C to 35°C)": "bg-green-500",
  "Heavy Rain": "bg-blue-700",
  "Moderate Rain": "bg-blue-500",
  "Light Rain": "bg-blue-300",
  "No Rain": "bg-gray-100",
  "Calm": "bg-teal-200",
  "Light Breeze": "bg-teal-400",
  "Moderate Breeze": "bg-teal-600",
  "No Snow": "bg-white"
};


export default function Home() {
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [result, setResult] = useState<any>(null);
  const [weather, setWeather] = useState<string>('normal'); // sunny, rain, cold, normal
  const [loading, setLoading] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; long: number }>({
    lat: 28.6139,
    long: 77.209,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      lat: coordinates.lat,
      long: coordinates.long,
      date,
    };

    if(!date) {
      alert("Please select a date");
      setLoading(false);
      return;
    }
    const res = await fetchWeatherData(coordinates.lat, coordinates.long, date, setResult);
    console.log('res', res);
    setResult({
      data : res,
      payload: payload
    });
    const weatherCategory = getWeatherCategory(res as WeatherData);
    setWeather(weatherCategory);
    console.log('weatherCategory', weatherCategory);
    setLoading(false);
  };

  const bgScreenClass = useMemo(() => {
    let bgColor = 'bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500'
    if (weather === 'rain') {
      bgColor = 'bg-gradient-to-tr from-blue-950 via-gray-900 to-black'
    } else if (weather === 'sunny') {
      bgColor = 'bg-gradient-to-tr from-amber-700 via-amber-500 to-amber-300'
    } else if (weather === 'cold') {
      bgColor = 'bg-gradient-to-tr from-blue-400 via-blue-600 to-blue-200'
    } else if (weather === 'normal') {
      bgColor = 'bg-gradient-to-t from-emerald-950 via-emerald-400 to-blue-200'
    } else {
      bgColor = bgColor
    }

    return bgColor
  }, [weather])

  return (
    <div className={`flex flex-col h-max min-h-screen transition-all duration-1000 ease-in-out ${bgScreenClass} text-white overflow-auto`}>

      <WeatherAnimation weather={weather} />

      <WeatherGround weather={weather} />

      <header className="p-4 text-center bg-black/30 backdrop-blur-md shadow-lg">
        <h1 className="text-4xl font-extrabold">Weather Sense</h1>
      </header>

      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 md:p-6 sm:p-4 min-h-screen">
        {/* Map */}
        <div className="rounded-2xl overflow-hidden shadow-xl border border-white/20 min-h-[300px]">
          <MapComponent setCoordinates={setCoordinates} />
        </div>

        {/* Form + Result */}
        <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 flex flex-col justify-start shadow-lg border border-white/20">
          <form onSubmit={handleSubmit} className="flex flex-row justify-between gap-4 w-full flex-wrap">
            <label className="text-xs w-max">Select Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 rounded-lg text-white outline-none border flex-1"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 text-black py-2 rounded-lg font-semibold hover:bg-yellow-300 transition flex-1 min-h-max"
            >
              Predict Weather
            </button>
          </form>


            <div className="mt-6 p-6 rounded-xl bg-white/10 border border-white/20 text-center space-y-6">
              {loading && (
                <div className="text-center mt-4">
                  <p className="text-lg font-medium">Loading...</p>
                </div>
              )}
              {result?.payload && <h2 className="text-2xl font-bold mb-4">Results for lat:{(result.payload?.lat)?.toFixed(2)}, long:{(result.payload?.long)?.toFixed(2)} on {result.payload?.date}</h2>}
              {/* Pollution Section */}
              {
                result &&result.data.map((res: any) => (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">{Object.keys(res)[0]} (Probability)</h2>
                    <div className="flex flex-col gap-3">
                      {Object.entries(res[Object.keys(res)[0]]).map(([key, value]: any) => (
                        <div key={key} className="flex items-center gap-4">
                          <span className="w-36 text-left">{key}</span>
                          <div className="flex-1 h-4 bg-white/20 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${categoryColors[key] || "bg-gray-300"
                                }`}
                              style={{ width: `${value}%` }}
                            ></div>
                          </div>
                          <span className="w-12 text-right">{value?.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              }

            </div>


          

        </div>
      </main>
    </div>
  );
}


