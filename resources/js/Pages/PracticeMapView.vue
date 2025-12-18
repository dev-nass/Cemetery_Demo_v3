<script setup>
import { ref, onMounted, onUnmounted, onBeforeUnmount } from "vue";
import { usePracticeMap } from "../composables/usePracticeMap";

const { initializeMap, cleanupMap } = usePracticeMap();
const mapContainer = ref(null);

onMounted(() => {
    initializeMap(mapContainer.value);
});

onBeforeUnmount(() => {
    cleanupMap(); // Clean up before component is destroyed
});
</script>

<template>
    <section class="h-dvh w-screen">
        <div
            ref="mapContainer"
            id="map"
            class="h-full w-full"
            style="height: 100vh"
        ></div>
    </section>
</template>
