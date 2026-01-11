import { route } from "ziggy-js";
import { useMapState } from "@/stores/useMapState";
import { useFeatureProcessing } from "./useFeatureProcessing";

const { map, googleLayer, entranceLayer, dbGeoJsonLots, dbGeoJsonSections } =
    useMapState();
const { processFeatures, separateLotsByType, separateSections } =
    useFeatureProcessing();

export function useDbGeoJson() {
    const fetchLotsDBGeoJson = async () => {
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

    const fetchSectionsDBGeoJson = async () => {
        try {
            const response = await fetch(route("sections.geojson"));

            if (!response.ok) {
                throw new Error(`HTTP error! status ${response.status}`);
            }

            const data = await response.json();

            const processedFeatures = processFeatures(data);
            dbGeoJsonSections.value = processedFeatures;

            console.log("Total sections:", dbGeoJsonSections.value.length);
            separateSections(dbGeoJsonSections.value);
        } catch (error) {
            console.error("Error loading GeoJSON:", error);
        }
    };

    return {
        fetchLotsDBGeoJson,
        fetchSectionsDBGeoJson,
    };
}
