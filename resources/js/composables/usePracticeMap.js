import { ref } from "vue";
import L from "leaflet";

import { useMapState } from "@/stores/useMapState";
import { useControl } from "./map/useControl";
import { useDbGeoJson } from "./map/useDbGeoJson";

const {
    map,
    googleLayer,
    entranceLayer,
    lotsUndergroundLayer,
    lotsApartmentLayer,
    showUnderground,
    showApartment,
} = useMapState();
const { initializeLayerControl, initializeDrawControl } = useControl();
const { fetchDBGeoJson } = useDbGeoJson();

const MIN_RENDER_ZOOM = 20;
const RENDER_DEBOUNCE_MS = 2000;

export function usePracticeMap() {
    const initializeMap = async (mapContainerElem) => {
        map.value = L.map(mapContainerElem).setView([14.3052681, 120.9758], 18);

        initializeLayers();
        googleLayer.value.addTo(map.value);
        entranceLayer.value.addTo(map.value);
        // lotsUndergroundLayer.value.addTo(map.value);
        // lotsApartmentLayer.value.addTo(map.value);
        updateVisibility();
        markEntrance();

        entranceLayer.value.on("click", onMapClick);

        // initializeLayerControl(
        //     map.value,
        //     { "Google Satellite": googleLayer.value }, // Base layers
        //     {
        //         Entrance: entranceLayer.value,
        //         Apartment: lotsApartmentLayer.value,
        //         Underground: lotsUndergroundLayer.value,
        //     } // Overlays
        // );
        initializeDrawControl(map.value);

        map.value.on("zoomend", updateVisibility);

        await fetchDBGeoJson();

        // console.log(lotsUndergroundLayer.value.getLayers());
    };

    const initializeLayers = () => {
        if (!googleLayer.value) {
            googleLayer.value = L.tileLayer(
                "https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
                {
                    maxZoom: 30,
                    subdomains: ["mt0", "mt1", "mt2", "mt3"],
                }
            );
        }

        if (!entranceLayer.value) {
            entranceLayer.value = L.layerGroup();
        }

        if (!lotsUndergroundLayer.value) {
            lotsUndergroundLayer.value = L.layerGroup();
        }

        if (!lotsApartmentLayer.value) {
            lotsApartmentLayer.value = L.layerGroup();
        }
    };

    const markEntrance = () => {
        const marker = L.marker([14.304631, 120.975636]).addTo(
            entranceLayer.value
        );

        marker.bindPopup("Here's the entrance");
    };

    function onMapClick(e) {
        alert("You clicked the map at " + e.latlng);
    }

    const updateVisibility = () => {
        if (!map.value) return;

        const zoom = map.value.getZoom();

        // too far
        if (zoom < MIN_RENDER_ZOOM) {
            map.value.removeLayer(lotsUndergroundLayer.value);
            map.value.removeLayer(lotsApartmentLayer.value);

            console.log("Lots hidden (zoom too far)");
        }
        // right zoom
        else {
            if (showUnderground.value && showApartment.value) {
                console.log("both");
                lotsUndergroundLayer.value.addTo(map.value);
                lotsApartmentLayer.value.addTo(map.value);
            } else if (showUnderground.value && !showApartment.value) {
                console.log("underground");
                lotsUndergroundLayer.value.addTo(map.value);
                map.value.removeLayer(lotsApartmentLayer.value);
            } else if (!showUnderground.value && showApartment.value) {
                console.log("apartment");
                lotsApartmentLayer.value.addTo(map.value);
                map.value.removeLayer(lotsUndergroundLayer.value);
            }
        }

        // console.log(zoom);
    };

    // properly destroys the map each render; used in View
    const cleanupMap = () => {
        if (map.value) {
            map.value.remove(); // Properly destroys map and removes all listeners
            map.value = null;
        }

        // Clear layer references
        entranceLayer.value = L.layerGroup();
        lotsUndergroundLayer.value = L.layerGroup();
        lotsApartmentLayer.value = L.layerGroup();
    };

    // not used because the logic needs reactive state TRUE OR FALSE
    // continuously calls the updateVisibility
    setInterval(() => {
        console.log("updating...");
        updateVisibility();
    }, RENDER_DEBOUNCE_MS);

    return {
        initializeMap,
        cleanupMap,
    };
}
