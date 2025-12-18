import L from "leaflet";

import { useMapState } from "@/stores/useMapState";

const { lotsUndergroundLayer, lotsApartmentLayer } = useMapState();
export function useFeatureProcessing() {
    /* traverse through DBGeoJson data and change 'multipolygon'
     to 'polygon' */
    const processFeatures = (data) => {
        if (!data || !Array.isArray(data.features)) {
            console.warn("Invalid GeoJSON data structure");
            return [];
        }

        return (
            data.features
                // keep only valid geometries
                .filter((feature) => {
                    const isValid =
                        feature && feature.geometry && feature.geometry.type;

                    if (!isValid) {
                        console.warn(
                            "Skipping feature with null/missing geometry",
                            feature
                        );
                    }

                    return isValid; // ✅ KEEP valid ones
                })
                // normalize MultiPolygon → Polygon
                .map((feature) => {
                    if (feature.geometry.type === "MultiPolygon") {
                        const coords = feature.geometry.coordinates?.[0];
                        if (coords) {
                            feature.geometry = {
                                type: "Polygon",
                                coordinates: coords,
                            };
                        }
                    }
                    return feature;
                })
                .filter(validateFeature)
        );
    };

    // validate if the coordinates is correct
    const validateFeature = (feature) => {
        if (!feature.geometry?.coordinates) return false;

        const coords = feature.geometry.coordinates;

        if (feature.geometry.type === "Polygon") {
            if (!Array.isArray(coords) || !coords[0]) return false;

            return coords[0].every((coord) => {
                if (!Array.isArray(coord) || coord.length < 2) return false;
                const [lng, lat] = coord;
                return (
                    typeof lng === "number" &&
                    typeof lat === "number" &&
                    !isNaN(lng) &&
                    !isNaN(lat) &&
                    Math.abs(lat) <= 90 &&
                    Math.abs(lng) <= 180
                );
            });
        }

        return true;
    };

    const separateLotsByType = (features) => {
        if (!lotsUndergroundLayer.value || !lotsApartmentLayer.value) {
            console.error("Lot layers not initialized yet");
            return;
        }

        lotsUndergroundLayer.value.clearLayers();
        lotsApartmentLayer.value.clearLayers();

        features.forEach((feature) => {
            if (!feature.properties?.lot_type) {
                console.warn("Feature missing lot type:", feature);
                return;
            }

            const type = feature.properties.lot_type;

            const lotLayer = L.geoJSON(feature, {
                onEachFeature: (feature, layer) => {
                    layer.bindPopup(`Lot type: ${feature.properties.lot_type}`);
                },
            });

            if (type === "underground") {
                lotLayer.addTo(lotsUndergroundLayer.value);
            } else if (type === "apartment") {
                lotLayer.addTo(lotsApartmentLayer.value);
            } else {
                console.warn("Unknown lot type:", type, feature);
            }
        });
    };

    return {
        processFeatures,
        validateFeature,
        separateLotsByType,
    };
}
