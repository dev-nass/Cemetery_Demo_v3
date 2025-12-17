import { ref } from "vue";
export function useMapState() {
    const map = ref(null);
    const googleLayer = ref(null); // tile layer (google map view)
    const entranceLayer = ref(null); // holds the entance marker

    return {
        map,
        googleLayer,
        entranceLayer,
    };
}
