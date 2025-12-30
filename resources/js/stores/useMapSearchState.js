import { ref } from "vue";
import L from "leaflet";

const search = ref("");
const suggestions = ref([]); // holds the suggestions data
const loading = ref(false); // use for async/await

const searchResultLayer = ref(L.layerGroup());

export function useMapSearchState() {
    return {
        search,
        suggestions,
        loading,

        searchResultLayer,
    };
}
