import { useForm } from "@inertiajs/vue3";

const selectedFeatureForm = useForm({
    lot_id: null,
    lot_number: null,
    lot_type: null,
    deceased_record: null,
});

export function useMapSelectedFeatureState() {
    return {
        selectedFeatureForm,
    };
}
