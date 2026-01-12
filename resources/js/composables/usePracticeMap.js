import { ref } from "vue";
import L from "leaflet";

import { useMapState } from "@/stores/useMapState";
import { useControl } from "./map/useControl";
import { useDbGeoJson } from "./map/useDbGeoJson";
import { useMapSearchState } from "../stores/useMapSearchState";

const {
    map,
    googleLayer,
    entranceLayer,
    lotsUndergroundLayer,
    lotsApartmentLayer,
    sectionLayer,
    showSection,
    uniqueTypes,
    lotLayers,
    lotVisibility,
    showUnderground,
    showApartment,
} = useMapState();
const { initializeLayerControl, initializeDrawControl } = useControl();
const { fetchLotsDBGeoJson, fetchSectionsDBGeoJson } = useDbGeoJson();

const { searchResultLayer } = useMapSearchState();

// Panteon Long and Lat
const LAT = 14.3052681;
const LONG = 120.9758;
const ZOOM_LVL = 18;
const MIN_RENDER_ZOOM = 20;
const RENDER_DEBOUNCE_MS = 2000;

// (EXPERIMENTAL)
// roughly ~1km x 1km area (adjust values)
const offsetLat = 0.001;
const offsetLng = 0.001;

const imageBounds = [
    [LAT - offsetLat, LONG - offsetLng], // south-west
    [LAT + offsetLat, LONG + offsetLng], // north-east
];

let imageUrl = "/images/map-overlay.jpg";

export function usePracticeMap() {
    const initializeMap = async (mapContainerElem) => {
        map.value = L.map(mapContainerElem).setView([LAT, LONG], ZOOM_LVL);

        // adds the overlay image on the map
        // L.imageOverlay(imageUrl, imageBounds).addTo(map.value);

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

        await fetchLotsDBGeoJson();
        await fetchSectionsDBGeoJson();

        // console.log(lotsUndergroundLayer.value.getLayers());
    };

    const initializeLayers = () => {
        if (!googleLayer.value) {
            googleLayer.value = L.tileLayer(
                "https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
                {
                    maxZoom: 30,
                    subdomains: ["mt0", "mt1", "mt2", "mt3"],
                },
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
            entranceLayer.value,
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
            // map.value.removeLayer(lotsUndergroundLayer.value);
            // map.value.removeLayer(lotsApartmentLayer.value);
            cleanupLayers();

            console.log("Lots hidden (zoom too far)");
        }
        // right zoom
        else {
            if (searchResultLayer.value.getLayers().length > 0) {
                // SEARCH MODE → only show search result
                cleanupLayers();

                if (!map.value.hasLayer(searchResultLayer.value)) {
                    searchResultLayer.value.addTo(map.value);
                }

                console.log("Search result visible");
            } else {
                if (showSection.value === true) {
                    sectionLayer.value.addTo(map.value);
                } else {
                    map.value.removeLayer(sectionLayer.value);
                }
                uniqueTypes.value.forEach((type) => {
                    if (lotVisibility.value.get(type) === true) {
                        lotLayers.value.get(type).addTo(map.value);
                    } else {
                        map.value.removeLayer(lotLayers.value.get(type));
                    }
                });
            }
            // lotLayers.value.get("underground").addTo(map.value);
            // console.log(lotLayers.value.get("underground"));
            // if (showUnderground.value && showApartment.value) {
            //     console.log("both");
            //     lotsUndergroundLayer.value.addTo(map.value);
            //     lotsApartmentLayer.value.addTo(map.value);
            // } else if (showUnderground.value && !showApartment.value) {
            //     console.log("underground");
            //     lotsUndergroundLayer.value.addTo(map.value);
            //     map.value.removeLayer(lotsApartmentLayer.value);
            // } else if (!showUnderground.value && showApartment.value) {
            //     console.log("apartment");
            //     lotsApartmentLayer.value.addTo(map.value);
            //     map.value.removeLayer(lotsUndergroundLayer.value);
            // }
        }

        // console.log(zoom);
    };

    // used if the zoom is too far
    const cleanupLayers = () => {
        map.value.removeLayer(sectionLayer.value);
        uniqueTypes.value.forEach((type) => {
            map.value.removeLayer(lotLayers.value.get(type));
        });
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
