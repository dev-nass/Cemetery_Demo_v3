import { route } from "ziggy-js";
import { useMapState } from "@/stores/useMapState";
import { useFeatureProcessing } from "./useFeatureProcessing";

const { map, googleLayer, entranceLayer, dbGeoJsonLots } = useMapState();
const { processFeatures, separateLotsByType } = useFeatureProcessing();

export function useDbGeoJson() {
    const fetchDBGeoJson = async () => {
        try {
            const response = await fetch(route("lots.geojson"));

            if (!response.ok) {
                throw new Error(`HTTP error! status ${response.status}`);
            }

            const data = await response.json();

            const processedFeatures = processFeatures(data);
            dbGeoJsonLots.value = processedFeatures;

            console.log("Total features:", dbGeoJsonLots.value.length);

            separateLotsByType(dbGeoJsonLots.value);
        } catch (error) {
            console.error("Error loading GeoJSON:", error);
        }
    };

    return {
        fetchDBGeoJson,
    };
}
