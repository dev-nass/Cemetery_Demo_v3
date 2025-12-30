import { ref } from "vue";

const search = ref("");
const suggestions = ref([]);
const loading = ref(false);

export function useMapSearchState() {
    return {
        search,
        suggestions,
        loading,
    };
}
