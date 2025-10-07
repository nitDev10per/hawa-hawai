import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import WeatherAnimation from "@/components/WeatherAnimation";
import { WeatherGround } from "@/components/WeatherGround";
import { fetchWeatherData } from "@/services/api";


const MapComponent = dynamic(() => import("../components/MapComponent"), {
  ssr: false, // Disable server-side rendering
});


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
    const res = await fetchWeatherData(coordinates.lat, coordinates.long, date, setResult);
    console.log('res', res);
    setResult({
      data : res,
      payload: payload
    });
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
    <div className={`flex flex-col min-h-screen max-h-max transition-all duration-1000 ease-in-out ${bgScreenClass} text-white overflow-hidden`}>

      <WeatherAnimation weather={weather} />

      <WeatherGround weather={weather} />

      <header className="p-4 text-center bg-black/30 backdrop-blur-md shadow-lg">
        <h1 className="text-4xl font-extrabold">Weather Sense</h1>
      </header>

      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        {/* Map */}
        <div className="rounded-2xl overflow-hidden shadow-xl border border-white/20">
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
              className="w-full bg-yellow-400 text-black py-2 rounded-lg font-semibold hover:bg-yellow-300 transition flex-1"
            >
              Predict Weather
            </button>
          </form>

          {!loading ? result && (
            <div className="mt-6 p-6 rounded-xl bg-white/10 border border-white/20 text-center space-y-6">
              <h2 className="text-2xl font-bold mb-4">Results for lat:{(result.payload.lat).toFixed(2)}, long:{(result.payload.long).toFixed(2)} on {result.payload.date}</h2>
              {/* Pollution Section */}
              {
                result.data.map((res: any) => (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">{Object.keys(res)[0]} (Probability)</h2>
                    <div className="flex flex-col gap-3">
                      {Object.entries(res[Object.keys(res)[0]]).map(([key, value]: any) => (
                        <div key={key} className="flex items-center gap-4">
                          <span className="w-36 text-left">{key}</span>
                          <div className="flex-1 h-4 bg-white/20 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${key === "Extremely Polluted"
                                ? "bg-red-500"
                                : key === "Heavily Polluted"
                                  ? "bg-orange-400"
                                  : "bg-yellow-300"
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
              {/* <div>
                <h2 className="text-xl font-semibold mb-4">Air Quality (Probability)</h2>
                <div className="flex flex-col gap-3">
                  {Object.entries(result.data[0]).map(([key, value]: any) => (
                    <div key={key} className="flex items-center gap-4">
                      <span className="w-36 text-left">{key}</span>
                      <div className="flex-1 h-4 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${key === "Extremely Polluted"
                            ? "bg-red-500"
                            : key === "Heavily Polluted"
                              ? "bg-orange-400"
                              : "bg-yellow-300"
                            }`}
                          style={{ width: `${value}%` }}
                        ></div>
                      </div>
                      <span className="w-12 text-right">{value?.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div> */}

              {/* Weather Section */}
              {/* <div>
                <h2 className="text-xl font-semibold mb-4">Weather (Probability)</h2>
                <div className="flex flex-col gap-3">
                  {Object.entries(result.data[1]).map(([key, value]: any) => (
                    <div key={key} className="flex items-center gap-4">
                      <span className="w-36 text-left">{key}</span>
                      <div className="flex-1 h-4 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${key === "Sunny"
                            ? "bg-yellow-400"
                            : key === "Partly Cloudy"
                              ? "bg-blue-300"
                              : "bg-gray-400"
                            }`}
                          style={{ width: `${value}%` }}
                        ></div>
                      </div>
                      <span className="w-12 text-right">{value?.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div> */}
            </div>

          ) : (
            <div className="mt-6 p-6 rounded-xl bg-white/10 border border-white/20 text-center">
              <p>Loading...</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
