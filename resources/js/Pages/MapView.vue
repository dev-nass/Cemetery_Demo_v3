<template>
    <div class="map-wrapper">
        <!-- Map Container -->
        <div ref="mapContainer" id="map"></div>

        <!-- Control Panel -->
        <div class="control-panel">
            <h3 class="text-lg font-bold mb-2">Lot Controls</h3>

            <!-- Layer Toggle Controls -->
            <div class="mb-4 p-3 bg-gray-50 rounded">
                <p class="text-sm font-semibold mb-2">Show Layers:</p>
                <div class="flex flex-col gap-2">
                    <label class="flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            v-model="showUnderground"
                            @change="toggleUndergroundLayer(showUnderground)"
                            class="mr-2 w-4 h-4"
                        />
                        <span class="text-sm">Underground Lots</span>
                    </label>
                    <label class="flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            v-model="showApartment"
                            @change="toggleApartmentLayer(showApartment)"
                            class="mr-2 w-4 h-4"
                        />
                        <span class="text-sm">Apartment Lots</span>
                    </label>
                </div>
            </div>

            <!-- Selected Lot Info -->
            <div v-if="selectedLotId" class="mb-4 p-2 bg-blue-50 rounded">
                <p class="text-sm font-semibold">
                    Selected Lot: {{ selectedLotId }}
                </p>
            </div>

            <!-- GeoJSON Output -->
            <div class="mb-4">
                <label class="block text-sm font-medium mb-1"
                    >Current GeoJSON:</label
                >
                <pre
                    class="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32"
                    >{{ geoJsonOutput }}</pre
                >
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-2">
                <button
                    @click="handleSave"
                    :disabled="!isSaveEnabled"
                    :class="[
                        'px-4 py-2 rounded font-medium transition-colors',
                        isSaveEnabled
                            ? 'bg-blue-500 hover:bg-blue-600 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed',
                    ]"
                >
                    {{ isSaveEnabled ? "Save Lot" : "Draw a Lot First" }}
                </button>

                <button
                    @click="refreshMap"
                    class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-medium"
                >
                    Refresh
                </button>
            </div>

            <!-- Stats -->
            <div class="mt-4 text-sm text-gray-600">
                <p>Total Lots: {{ dbGeoJsonLots?.length || 0 }}</p>
                <p class="text-xs mt-1">
                    Tip: Shift+Click to edit existing lots
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useMapLots } from "../composables/useMap.js";

const mapContainer = ref(null);

const {
    // State
    map,
    dbGeoJsonLots,
    selectedLotId,
    showUnderground,
    showApartment,

    // Computed
    isSaveEnabled,
    geoJsonOutput,

    // Methods
    initializeMap,
    refreshMap,
    saveLot,
    toggleUndergroundLayer,
    toggleApartmentLayer,
} = useMapLots();

onMounted(() => {
    initializeMap(mapContainer.value);
});

const handleSave = async () => {
    try {
        await saveLot();
        alert("Lot saved successfully!");
    } catch (error) {
        alert("Error saving lot: " + error.message);
    }
};
</script>

<style scoped>
.map-wrapper {
    position: relative;
    width: 100%;
    height: 100vh;
}

#map {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
}

.control-panel {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: white;
    padding: 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    max-width: 28rem;
    z-index: 1000;
    max-height: calc(100vh - 2rem);
    overflow-y: auto;
}

/* Ensure Leaflet container takes full size */
:deep(.leaflet-container) {
    width: 100%;
    height: 100%;
    font-family: inherit;
}
</style>
