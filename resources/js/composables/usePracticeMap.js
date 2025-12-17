import { ref } from "vue";
import L from "leaflet";

import { useMapState } from "./stores/useMapState";
import { useControl } from "./map/useControl";

const { map, googleLayer, entranceLayer } = useMapState();
const { initializeLayerControl, initializeDrawControl } = useControl();

export function usePracticeMap() {
    const initializeMap = (mapContainerElem) => {
        map.value = L.map(mapContainerElem).setView([14.3052681, 120.9758], 18);

        initializeLayers();
        googleLayer.value.addTo(map.value);
        entranceLayer.value.addTo(map.value);
        markEntrance();

        // map.value.on("click", onMapClick);
        initializeLayerControl(
            map.value,
            { "Google Satellite": googleLayer.value }, // Base layers
            { Entrance: entranceLayer.value } // Overlays
        );
        initializeDrawControl(map.value);
    };

    const initializeLayers = () => {
        googleLayer.value = L.tileLayer(
            "https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
            {
                maxZoom: 30,
                subdomains: ["mt0", "mt1", "mt2", "mt3"],
            }
        );

        entranceLayer.value = L.layerGroup();
    };

    const markEntrance = () => {
        const marker = L.marker([14.304631, 120.975636]).addTo(
            entranceLayer.value
        );

        marker.bindPopup("Here's the entrance");
    };

    // function onMapClick(e) {
    //     alert("You clicked the map at " + e.latlng);
    // }

    return {
        initializeMap,
    };
}
