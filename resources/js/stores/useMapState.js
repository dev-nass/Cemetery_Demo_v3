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
const uniqueTypes = ref([]);
const lotLayers = ref(new Map());
const lotVisibility = ref(new Map());
const dbGeoJsonLots = ref([]);

const showUnderground = ref(true);
const showApartment = ref(true);

export function useMapState() {
    return {
        map,
        // layers
        googleLayer,
        entranceLayer,
        lotsApartmentLayer,
        lotsUndergroundLayer,

        uniqueTypes,
        lotLayers,
        lotVisibility,
        dbGeoJsonLots,

        showUnderground,
        showApartment,
    };
}
