import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import WeatherAnimation from "@/components/WeatherAnimation";
import { WeatherGround } from "@/components/WeatherGround";

const MapComponent = dynamic(() => import("../components/MapComponent"), {
  ssr: false, // Disable server-side rendering
});


export default function Home() {
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [result, setResult] = useState<any>(null);
  const [weather, setWeather] = useState<string>('sunny'); // sunny, rain, cold, normal

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult({
      temp: "28°C",
      condition: "☀️ Sunny with light breeze",
      humidity: "60%",
    });
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
        <h1 className="text-4xl font-extrabold">Hawa Hawai</h1>
      </header>

      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        {/* Map */}
        <div className="rounded-2xl overflow-hidden shadow-xl border border-white/20">
          <MapComponent />
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

          {result && (
            <div className="mt-6 p-4 rounded-xl bg-white/10 border border-white/20 text-center">
              <h3 className="text-xl font-bold mb-2">
                Future Weather for {location || "Selected Location"} on {date}
              </h3>
              <p className="text-lg">{result.condition}</p>
              <p className="mt-2">🌡 Temperature: {result.temp}</p>
              <p>💧 Humidity: {result.humidity}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
