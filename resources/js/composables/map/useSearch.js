import { debounce } from "lodash";
import { route } from "ziggy-js";

import { useMapSearchState } from "../../stores/useMapSearchState";

const { search, suggestions, loading, searchResultLayer } = useMapSearchState();

export function useSearch(mapInstance) {
    const fetchSuggestions = debounce(async () => {
        if (!search.value) {
            suggestions.value = [];
            return;
        }

        loading.value = true;

        try {
            const response = await fetch(
                `${route("lots.search")}?search=${encodeURIComponent(
                    search.value
                )}`,
                {
                    headers: {
                        Accept: "application/json",
                    },
                    credentials: "same-origin",
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch suggestions");
            }

            const data = await response.json();
            suggestions.value = data.results;
            console.log(suggestions.value);
        } catch (err) {
            console.error(err);
            suggestions.value = [];
        } finally {
            loading.value = false;
        }
    }, 300);

    // 'feature' param refer to the selected suggestion
    const showSearchResult = (feature) => {
        searchResultLayer.value.clearLayers();
        const map = search;

        console.log("Picked Result: ", feature);

        const lot = feature.burial_record?.lot;

        if (!lot || !lot.coordinates) {
            console.error("No lot data available for this record");
            return;
        }

        // Extract coordinates from MultiPolygon GeoJSON
        // coordinates structure: [[[[[lng, lat], [lng, lat], ...]]]
        const polygonCoords = lot.coordinates.coordinates[0][0];

        const centroid = calculateCentroid(polygonCoords);
        // console.log("Centroid:", centroid);

        // Add both polygon and marker to the search result layer
        markCentroid(feature, centroid, lot);
        markPolygon(polygonCoords);
    };

    // calculates the center of the polygon
    const calculateCentroid = (polygonCoordinate) => {
        if (!polygonCoordinate || !polygonCoordinate.length) {
            console.error(
                `Unable to calculate centroid, invalid polygon coordinates`
            );
            return;
        }

        // Calculate centroid of the polygon
        let latSum = 0;
        let lngSum = 0;
        const pointCount = polygonCoordinate.length - 1; // Exclude last point (duplicate of first)

        for (let i = 0; i < pointCount; i++) {
            lngSum += polygonCoordinate[i][0];
            latSum += polygonCoordinate[i][1];
        }

        const centroidLng = lngSum / pointCount;
        const centroidLat = latSum / pointCount;

        return [centroidLat, centroidLng]; // Leaflet uses [lat, lng] ;
    };

    const markCentroid = (feature, centroid, lot) => {
        // Create a marker at the centroid
        const marker = L.marker(centroid, {
            icon: L.divIcon({
                className: "search-result-marker",
                html: `<div class="bg-red-500 w-8 h-8 rounded-full border-4 border-white shadow-lg animate-pulse"></div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 16],
            }),
        });

        // Add popup to marker
        marker
            .bindPopup(
                `
                <div class="p-1">
                    <h3 class="font-bold">${feature.first_name} ${
                    feature.last_name
                }</h3>
                    <p class="text-sm">Section: ${
                        lot.section?.section_name || "N/A"
                    }</p>
                    <p class="text-sm">Lot: ${lot.lot_number || "N/A"}</p>
                    <p class="text-sm">Type: ${lot.lot_type || "N/A"}</p>
                </div>`
            )
            .openPopup();

        searchResultLayer.value.addLayer(marker);

        // Optional: Open popup after a delay for smooth animation
        setTimeout(() => {
            marker.openPopup();
        }, 1600);
    };

    const markPolygon = (polygonCoordinate) => {
        if (!polygonCoordinate || !polygonCoordinate.length) {
            console.error(
                `Unable to mark polygon, invalid polygon coordinates`
            );
            return;
        }

        const latLngs = polygonCoordinate
            .slice(0, -1)
            .map((coord) => [coord[1], coord[0]]);
        const polygon = L.polygon(latLngs, {
            color: "#ef4444",
            fillColor: "#ef4444",
            fillOpacity: 0.3,
            weight: 3,
        });

        searchResultLayer.value.addLayer(polygon);

        // Fit map bounds to show the polygon
        mapInstance.value.fitBounds(polygon.getBounds(), {
            padding: [50, 50],
            maxZoom: 20,
        });
    };

    return {
        fetchSuggestions,
        showSearchResult,
    };
}
