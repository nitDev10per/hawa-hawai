function WeatherGround({ weather }: { weather: string }) {
  if (weather === "sunny") {
    return (
      <div className="fixed bottom-[-100px] left-0 z-0 w-full h-40 flex justify-center items-end pointer-events-none">
        {/* Flames */}
        <img src="/fuego.gif" alt="Flames" className="w-full" />
      </div>
    );
  }

  if (weather === "cold") {
    return (
      <div className="fixed bottom-0 left-0 w-full h-40 flex justify-center items-end pointer-events-none">
        {/* Ice mountains */}
        <div className="w-0 h-0 border-l-[50px] border-r-[50px] border-b-[100px] border-transparent border-b-blue-200 mx-4" />
        <div className="w-0 h-0 border-l-[40px] border-r-[40px] border-b-[80px] border-transparent border-b-blue-300 mx-4" />
        {/* Ice cube */}
        <div className="w-12 h-12 bg-blue-100 border border-blue-300 rotate-12 opacity-80 mx-4" />
      </div>
    );
  }

  if (weather === "rain") {
    return (
      <div className="fixed bottom-0 left-0 w-full h-32 bg-blue-500/70 animate-river pointer-events-none">
        {/* Flow effect */}
      </div>
    );
  }

  if (weather === "normal") {
    return (
      <div className="fixed bottom-0 left-0 w-full h-32 bg-green-500/60 pointer-events-none">
        {/* Grass effect */}
      </div>
    );
  }

  return null;
}
export { WeatherGround };