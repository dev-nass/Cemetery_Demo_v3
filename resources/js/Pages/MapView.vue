<script setup>
import { ref } from "vue";
import { LMap, LTileLayer } from "@vue-leaflet/vue-leaflet";
import * as L from "leaflet";
import "leaflet-draw";

// =========================================================
// 1. IMPORT the Leaflet Marker Icon assets using ESM syntax
// =========================================================
import markerIconUrl from "leaflet/dist/images/marker-icon.png";
import markerIconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png";

// =========================================================
// 2. APPLY the fix by merging options with the imported paths
// =========================================================
delete L.Icon.Default.prototype._getIconUrl;

// You can use L.Icon.Default.mergeOptions or set options directly
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIconRetinaUrl,
    iconUrl: markerIconUrl,
    shadowUrl: markerShadowUrl,
    // Add these for good measure, sometimes needed for Leaflet.Draw controls
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41],
});
// Often necessary when importing images
L.Icon.Default.imagePath = "";

const zoom = ref(10);
const center = ref([51.505, -0.09]); // Example coordinates (London)
const map = ref(null); // Reference to the LMap component

const onMapReady = () => {
    // 2. Get the raw Leaflet map instance from the ref
    const leafletMap = map.value.leafletObject;

    // 3. Initialize the Leaflet.Draw control
    const drawnItems = new L.FeatureGroup();
    leafletMap.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
        edit: {
            featureGroup: drawnItems,
        },
        draw: {
            polygon: true,
            polyline: true,
            circle: false, // Example: disable circle drawing
            marker: true,
        },
    });

    // 4. Add the control to the map
    leafletMap.addControl(drawControl);

    // 5. Set up the event listener for when a feature is created
    leafletMap.on(L.Draw.Event.CREATED, (e) => {
        const layer = e.layer;
        drawnItems.addLayer(layer);

        // IMPORTANT: Log the GeoJSON data so you can save it to your Laravel backend
        console.log("New feature GeoJSON:", layer.toGeoJSON());
    });
};
</script>

<template>
    <div style="height: 600px; width: 100%">
        <l-map ref="map" :zoom="zoom" :center="center" @ready="onMapReady">
            <l-tile-layer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                layer-type="base"
                name="OpenStreetMap"
            ></l-tile-layer>
        </l-map>
    </div>
</template>
