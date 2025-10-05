import { useEffect, useState } from "react";
import Snowfall from "react-snowfall"; // ❄ Snow effect
import Particles from "react-tsparticles"; // 🔥 Sun / Heat effect
import Rain from "react-rain-animation"; // 🌧 Rain effect
import "react-rain-animation/lib/style.css";

export default function WeatherAnimation({ weather }: { weather: string }) {
    if (weather === "rain") {
        return (
            <div className="absolute top-0 inset-0 z-10 pointer-events-none max-h-full max-w-screen overflow-hidden">
                <Rain numDrops={200} />
                {/* Lightning flash effect */}
                <div className="animate-lightning absolute inset-0 bg-white opacity-0" />
            </div>
        );
    }

    if (weather === "cold") {
        return (
            <div className="absolute inset-0 z-10 pointer-events-none">
                <Snowfall snowflakeCount={100} />
            </div>
        );
    }

    if (weather === "sunny") {
        return (
            <div className="absolute left-20 top-10 z-10 flex items-center justify-center pointer-events-none">
                <div
                    className="w-40 h-40 bg-yellow-400 rounded-full shadow-[0_0_80px_rgba(255,165,0,0.8)]
               animate-pulse"
                    style={{
                        animation: "floatSun 6s ease-in-out infinite, pulse 2s infinite",
                    }}
                />

                {/* Fire particles */}
                <Particles
                    options={{
                        particles: {
                            color: { value: "#ff4500" },
                            move: { speed: 2 },
                            size: { value: 1, random: true },
                            number: { value: 80 },
                        },
                    }}
                    className="absolute w-full h-full"
                    
                />
            </div>
        );
    }

    return null;
}
