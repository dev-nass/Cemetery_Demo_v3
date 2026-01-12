import { ref } from "vue";
import L from "leaflet";

// ✅ Create refs OUTSIDE the function (module scope)
const map = ref(null);
const googleLayer = ref(null); // tile layer (google map view)
const entranceLayer = ref(L.layerGroup());

// previous implementation (not used due to hard coding)
const lotsUndergroundLayer = ref(L.layerGroup());
const lotsApartmentLayer = ref(L.layerGroup());

// ensure no hardcode
const sectionLayer = ref(L.layerGroup());
const uniqueTypes = ref([]);
const lotLayers = ref(new Map());
const lotVisibility = ref(new Map());
const dbGeoJsonLots = ref([]);
const dbGeoJsonSections = ref([]);

const showSection = ref(false);
const showUnderground = ref(false);
const showApartment = ref(false);

export function useMapState() {
    return {
        map,
        // layers
        googleLayer,
        entranceLayer,
        lotsApartmentLayer,
        lotsUndergroundLayer,

        sectionLayer,
        showSection,
        uniqueTypes,
        lotLayers,
        lotVisibility,
        dbGeoJsonLots,
        dbGeoJsonSections,

        showUnderground,
        showApartment,
    };
}
