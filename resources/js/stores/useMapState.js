import { ref } from "vue";
import L from "leaflet";

// ✅ Create refs OUTSIDE the function (module scope)
const map = ref(null);
const googleLayer = ref(null); // tile layer (google map view)
const entranceLayer = ref(L.layerGroup());
const lotsUndergroundLayer = ref(L.layerGroup());
const lotsApartmentLayer = ref(L.layerGroup());
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

        dbGeoJsonLots,

        showUnderground,
        showApartment,
    };
}
