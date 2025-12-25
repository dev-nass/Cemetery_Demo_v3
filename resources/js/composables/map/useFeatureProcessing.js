import L from "leaflet";

import { useMapState } from "@/stores/useMapState";
import { useMapSelectedFeatureState } from "@/stores/useMapSelectedFeatureState";

const { lotsUndergroundLayer, lotsApartmentLayer } = useMapState();
const { selectedFeatureForm } = useMapSelectedFeatureState();

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
                style: getLotStyle,
                onEachFeature: onEachFeatureCustom,
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

    const onEachFeatureCustom = (feature, layer) => {
        attachLotPopup(feature, layer);
        attachEventToSelectLot(feature, layer);
    };

    // lot styling
    const getLotStyle = (feature) => {
        const colors = {
            available: "#90EE90",
            occupied: "#FFB6C6",
            reserved: "#FFE66D",
        };

        return {
            fillColor: colors[feature.properties.status] || "#CCCCCC",
            weight: 1,
            color: "black",
            fillOpacity: 0.7,
        };
    };

    const attachLotPopup = (feature, layer) => {
        layer.on("add", function () {
            const layerId = layer._leaflet_id;

            const popupContent = `
                <strong>Lot: ${feature.properties.lot_id}</strong><br>
                Section: ${feature.properties.section}<br>
                Type: ${feature.properties.lot_type}<br>
                Status: ${feature.properties.status}<br>
                Fullname: ${
                    feature.properties.deceased_record?.full_name ?? "N/A"
                }<br>
                <button onclick="window.selectLotForEditing(${layerId})" 
                    class="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Edit This lot
                </button>
            `;

            layer.bindPopup(popupContent);

            // Permanent tooltip label
            // if (feature.properties?.lot_id) {
            //     layer.bindTooltip(String(feature.properties.lot_id), {
            //         permanent: true,
            //         direction: "center",
            //         className: "lot-label",
            //         interactive: false,
            //     });
            // }
        });
    };

    const attachEventToSelectLot = (feature, layer) => {
        layer.on("click", function () {
            handleSelectLotForEditing(feature.properties);
        });
    };

    const handleSelectLotForEditing = (featureProperties) => {
        Object.assign(selectedFeatureForm, featureProperties);
        console.log("Select lot for editing:", selectedFeatureForm.lot_id);
    };

    return {
        processFeatures,
        validateFeature,
        separateLotsByType,
    };
}
