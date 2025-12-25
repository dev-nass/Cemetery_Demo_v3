<script setup>
import DrawerElem from "../Components/DrawerElem.vue";
import { ref, onMounted, onUnmounted, onBeforeUnmount } from "vue";

import { useMapState } from "../stores/useMapState";
import { usePracticeMap } from "../composables/usePracticeMap";
import { useMapSelectedFeatureState } from "@/stores/useMapSelectedFeatureState";

const { initializeMap, cleanupMap } = usePracticeMap();
const mapContainer = ref(null);

const { selectedFeatureForm } = useMapSelectedFeatureState();
const { showUnderground, showApartment } = useMapState();

onMounted(() => {
    initializeMap(mapContainer.value);
});

onBeforeUnmount(() => {
    cleanupMap(); // Clean up before component is destroyed
});
</script>

<template>
    <input v-model="showUnderground" type="checkbox" />
    <input v-model="showApartment" type="checkbox" />
    <section class="h-dvh w-screen">
        <button
            command="show-modal"
            commandfor="drawer"
            class="border border-violet-500 text-violet-500 py-2 px-3 my-2 rounded-2xl transition duration-300 hover:bg-violet-500 hover:text-black"
        >
            Open Drawer
        </button>
        <div
            ref="mapContainer"
            id="map"
            class="h-full w-full"
            style="height: 100vh"
        ></div>
    </section>

    <!-- Include this script tag or install `@tailwindplus/elements` via npm: -->
    <dialog
        id="drawer"
        aria-labelledby="drawer-title"
        class="fixed inset-0 size-auto max-h-none max-w-none overflow-hidden bg-transparent not-open:hidden backdrop:bg-transparent"
    >
        <!-- Backdrop -->
        <div
            class="absolute inset-0 bg-gray-900/50 transition-opacity duration-500 ease-in-out"
        ></div>

        <div tabindex="0" class="absolute inset-0 pl-10 sm:pl-16">
            <!-- Panel -->
            <div
                class="relative ml-auto h-full max-w-md bg-gray-700 py-6 shadow-xl"
            >
                <!-- Close button -->
                <button
                    type="button"
                    @click="$event.target.closest('dialog').close()"
                    class="absolute top-6 left-4 text-gray-400 hover:text-white"
                >
                    ✕
                </button>

                <div class="px-6">
                    <h2
                        id="drawer-title"
                        class="ms-3 text-base font-semibold text-white"
                    >
                        Lot Information
                    </h2>
                </div>

                <div class="mt-6 flex flex-col gap-y-5 px-6">
                    <DrawerElem
                        name="Lot ID"
                        :modelValue="selectedFeatureForm.lot_id"
                    />
                    <DrawerElem
                        name="Lot Number"
                        :modelValue="selectedFeatureForm.lot_number"
                    />
                    <DrawerElem
                        name="Lot Type"
                        :modelValue="selectedFeatureForm.lot_type"
                    />
                </div>
            </div>
        </div>
    </dialog>
</template>
