<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { usePracticeMap } from "../composables/usePracticeMap";

const { initializeMap } = usePracticeMap();
const mapContainer = ref(null);

onMounted(() => {
    initializeMap(mapContainer.value);
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
