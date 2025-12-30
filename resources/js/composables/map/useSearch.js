import { debounce } from "lodash";
import { route } from "ziggy-js";

import { useMapSearchState } from "../../stores/useMapSearchState";

const { search, suggestions, loading } = useMapSearchState();

export function useSearch() {
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

    return {
        fetchSuggestions,
    };
}
