import { ref } from "vue";
import { debounce } from "lodash";
import { route } from "ziggy-js";

const search = ref("");
const suggestions = ref([]);
const loading = ref(false);

const fetchSuggestions = debounce(async () => {
    if (!search.value) {
        suggestions.value = [];
        return;
    }

    loading.value = true;

    try {
        const response = await fetch(
            `${route("lots.search")}?search=${encodeURIComponent(
                search.value
            )}`,
            {
                headers: {
                    Accept: "application/json",
                },
                credentials: "same-origin",
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch suggestions");
        }

        const data = await response.json();
        suggestions.value = data.results;
        console.log(suggestions.value);
    } catch (err) {
        console.error(err);
        suggestions.value = [];
    } finally {
        loading.value = false;
    }
}, 300);

export function useMapSearchState() {
    return {
        search,
        suggestions,
        loading,
        fetchSuggestions,
    };
}
