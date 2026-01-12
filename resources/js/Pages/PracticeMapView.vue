<script setup>
import DrawerElem from "../Components/DrawerElem.vue";
import ModalElem from "../Components/ModalElem.vue";
import Search from "../Components/Search.vue";
import { ref, onMounted, onUnmounted, onBeforeUnmount, computed } from "vue";

import { usePracticeMap } from "../composables/usePracticeMap";
import { useSearch } from "../composables/map/useSearch";

import { useMapState } from "@/stores/useMapState";
import { useMapSelectedFeatureState } from "@/stores/useMapSelectedFeatureState";
import { useMapSearchState } from "@/stores/useMapSearchState";

// Stores (State)
const { selectedFeatureForm } = useMapSelectedFeatureState();
const {
    map,
    showUnderground,
    showApartment,
    uniqueTypes,
    lotVisibility,
    showSection,
} = useMapState();
const { search, suggestions } = useMapSearchState();

// Composables
const { initializeMap, cleanupMap } = usePracticeMap();
const { fetchSuggestions, showSearchResult } = useSearch(map);
const mapContainer = ref(null);

// Event Handler
const onChangeVisibility = (type) => {
    const current = lotVisibility.value.get(type) ?? false;
    lotVisibility.value.set(type, !current);
};

const onChangeSectionVisibility = () => {
    showSection.value = !showSection.value;
};

const sectionDrawer = ref(false);

const closeSectionDrawer = () => (sectionDrawer.value = false);

onMounted(() => {
    initializeMap(mapContainer.value);
    window.openSectionDrawer = () => {
        sectionDrawer.value = true;
    };
});

onBeforeUnmount(() => {
    cleanupMap(); // Clean up before component is destroyed
    delete window.openSectionDrawer;
});
</script>

<template>
    <section class="h-dvh w-screen">
        <div class="px-10 py-5 flex items-center justify-between">
            <button
                command="show-modal"
                commandfor="drawer"
                class="flex items-center gap-x-2 rounded-md bg-white/10 px-2.5 py-2 text-sm font-semibold text-white inset-ring inset-ring-white/5 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-white/5 disabled:hover:bg-white/5"
                :disabled="!selectedFeatureForm.lot_id"
            >
                Open Drawer
            </button>
            <Search
                v-model="search"
                :suggestions="suggestions"
                @input="fetchSuggestions"
                @select-suggestion="showSearchResult"
            />
            <button
                command="show-modal"
                commandfor="dialog"
                class="flex items-center gap-x-2 rounded-md bg-white/10 px-2.5 py-2 text-sm font-semibold text-white inset-ring inset-ring-white/5 hover:bg-white/20"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="lucide lucide-list-filter-icon lucide-list-filter"
                >
                    <path d="M2 5h20" />
                    <path d="M6 12h12" />
                    <path d="M9 19h6" />
                </svg>
                Filter
            </button>
        </div>
        <div
            ref="mapContainer"
            id="map"
            class="h-full w-full"
            style="height: 100vh"
        ></div>
    </section>

    <!-- Section Feature Drawer -->
    <div
        v-if="sectionDrawer"
        id="section-drawer"
        aria-labelledby="section-drawer"
        class="fixed inset-0 size-auto max-h-none overflow-hidden bg-transparent backdrop:bg-gray-900/50 z-999"
    >
        <div tabindex="0" class="absolute inset-0 pl-10 sm:pl-16">
            <!-- Panel -->
            <div
                class="relative ml-auto h-full max-w-md bg-gray-700 py-6 shadow-xl"
            >
                <!-- Close button -->
                <button
                    type="button"
                    @click="closeSectionDrawer"
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
    </div>

    <!-- Drawer -->
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

    <!-- Modal -->
    <el-dialog>
        <dialog
            id="dialog"
            aria-labelledby="dialog-title"
            class="fixed inset-0 size-auto max-h-none max-w-none overflow-y-auto bg-transparent backdrop:bg-transparent"
        >
            <el-dialog-backdrop
                class="fixed inset-0 bg-gray-900/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
            ></el-dialog-backdrop>

            <div
                tabindex="0"
                class="flex min-h-full items-end justify-center p-4 text-center focus:outline-none sm:items-center sm:p-0"
            >
                <el-dialog-panel
                    class="relative transform overflow-hidden rounded-lg bg-gray-800 text-left shadow-xl outline -outline-offset-1 outline-white/10 transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
                >
                    <div class="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div class="sm:flex sm:items-start">
                            <div
                                class="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-500/10 sm:mx-0 sm:size-10"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    class="lucide lucide-info-icon lucide-info text-yellow-400"
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 16v-4" />
                                    <path d="M12 8h.01" />
                                </svg>
                            </div>
                            <div
                                class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left"
                            >
                                <h3
                                    id="dialog-title"
                                    class="text-base font-semibold text-white"
                                >
                                    Filter Map
                                </h3>
                                <div class="mt-2">
                                    <div
                                        class="flex space-x-2 text-sm text-gray-400"
                                    >
                                        <div>
                                            <ModalElem
                                                name="Section"
                                                :modelValue="showSection"
                                                @update:modelValue="
                                                    onChangeSectionVisibility()
                                                "
                                            />
                                        </div>
                                        <div
                                            v-for="type in uniqueTypes"
                                            :key="type"
                                        >
                                            <ModalElem
                                                :name="type"
                                                :modelValue="
                                                    lotVisibility.get(type)
                                                "
                                                @update:modelValue="
                                                    onChangeVisibility(type)
                                                "
                                            />
                                        </div>
                                        <!-- <ModalElem
                                            name="underground"
                                            v-model="showUnderground"
                                        />

                                        <ModalElem
                                            name="apartment"
                                            v-model="showApartment"
                                        /> -->
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        class="bg-gray-700/25 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6"
                    >
                        <button
                            type="button"
                            command="close"
                            commandfor="dialog"
                            class="mt-3 inline-flex w-full justify-center rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white inset-ring inset-ring-white/5 hover:bg-white/20 sm:mt-0 sm:w-auto"
                        >
                            Close
                        </button>
                    </div>
                </el-dialog-panel>
            </div>
        </dialog>
    </el-dialog>
</template>
