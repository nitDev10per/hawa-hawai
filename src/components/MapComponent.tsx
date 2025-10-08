"use client";

import { useState, useEffect, use } from "react";
import { MapContainer, TileLayer, Marker, useMap, LayersControl, useMapEvents } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";
import { GeoSearchControl } from "leaflet-geosearch";
import L from "leaflet";

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Add search control only once
function SearchControl({ setMarker }: { setMarker: (pos: LatLngExpression) => void }) {
    const map = useMap();

    useEffect(() => {
        const provider = new OpenStreetMapProvider();

        const GeoSearchControlClass = GeoSearchControl as any;
        const searchControl = new GeoSearchControlClass({
            provider,

            showMarker: false,
            autoClose: true,
            retainZoomLevel: false,
        });

        map.addControl(searchControl);

        const handleResult = (e: any) => {
            const { x, y } = e.location;
            const coords: LatLngExpression = [y, x];
            setMarker(coords);
            map.setView(coords, 13);
        };

        map.on("geosearch/showlocation", handleResult);

        return () => {
            map.off("geosearch/showlocation", handleResult);
            map.removeControl(searchControl);
        };
    }, [map, setMarker]);

    return null;
}

// Locate button
function LocateButton({ setMarker }: { setMarker: (pos: LatLngExpression) => void }) {
    const map = useMap();

    const locate = () => {
        if (!navigator.geolocation) return alert("Geolocation not supported");
        navigator.geolocation.getCurrentPosition((pos) => {
            const coords: LatLngExpression = [pos.coords.latitude, pos.coords.longitude];
            setMarker(coords);
            map.setView(coords, 13);
        });
    };

    return (
        <button
            onClick={locate}
            className="absolute top-4 left-4 z-50 p-2 bg-white rounded shadow hover:bg-gray-200"
        >
            📍
        </button>
    );
}

function ClickHandler({ setMarker }: { setMarker: (pos: LatLngExpression) => void }) {
    useMapEvents({
        click(e) {
            const coords: LatLngExpression = [e.latlng.lat, e.latlng.lng];
            setMarker(coords);
        },
    });
    return null;
}

export default function MapComponent({ setCoordinates }: { setCoordinates: (coords: { lat: number; long: number }) => void }) {
    const defaultCenter: LatLngExpression = [28.6139, 77.209];
    const [markerPosition, setMarkerPosition] = useState<any | null>(null);

    useEffect(() => {
        setCoordinates({ lat: markerPosition ? markerPosition[0] : defaultCenter[0] as number, long: markerPosition ? markerPosition[1] : defaultCenter[1] as number });
    }, [markerPosition]);

    return (
        <div className="relative h-full lg:min-h-[90vh] w-full md:min-h-[400px] sm:min-h-[300px]">
            <MapContainer
                center={defaultCenter}
                zoom={5}
                style={{ height: "100%", width: "100%", zIndex: 0 }}
            >
                <LayersControl position="topright">
                    <LayersControl.BaseLayer checked name="Street Map">
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; OpenStreetMap contributors'
                        />
                    </LayersControl.BaseLayer>

                    <LayersControl.BaseLayer name="Satellite">
                        <TileLayer
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                            attribution='&copy; ESRI & Satellite'
                        />
                    </LayersControl.BaseLayer>
                </LayersControl>

                {/* Search + Locate */}
                <SearchControl setMarker={setMarkerPosition} />
                <LocateButton setMarker={setMarkerPosition} />
                <ClickHandler setMarker={setMarkerPosition} />

                {/* Marker */}
                {markerPosition && <Marker position={markerPosition} />}
            </MapContainer>

            {/* Show coordinates */}
            {markerPosition && (
                <p className="absolute bottom-4 left-4 z-100 bg-black/50 text-white p-2 rounded">
                    Coordinates: {markerPosition[0].toFixed(6)}, {markerPosition[1].toFixed(6)}
                </p>
            )}

            <style jsx global>{`
  /* Input box */
  .leaflet-control-geosearch input {
    background-color: white !important;
    color: black !important;
  }

  .leaflet-control-geosearch .results {
    background: #fff;
    color: black;
}

  .leaflet-control-geosearch button {
    background-color: white !important;
    color: black !important;
  }

  
`}</style>


        </div>
    );
}
