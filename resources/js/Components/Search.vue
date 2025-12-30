<script setup>
import { ref } from "vue";

const showSuggestions = ref(false);

const props = defineProps({
    modelValue: {
        type: String,
        required: true,
    },
    suggestions: {
        type: Array,
        default: () => [],
    },
});

const emit = defineEmits(["update:modelValue", "select-suggestion"]);

const onInput = (e) => {
    emit("update:modelValue", e.target.value);
};

const onFocus = () => {
    showSuggestions.value = true;
};

const notFocus = () => {
    showSuggestions.value = false;
};
</script>
<template>
    <div class="mt-2 relative">
        <div
            class="flex items-center rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1 outline-white/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-500"
        >
            <input
                id="q"
                type="text"
                name="q"
                :value="modelValue"
                placeholder="Search name or lot ..."
                autocomplete="off"
                @input="onInput"
                @focus="onFocus"
                @blur="notFocus"
                class="block min-w-0 grow bg-transparent py-1.5 pr-3 pl-1 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm/6"
            />
        </div>
        <div
            v-if="showSuggestions"
            :class="{ invisible: !suggestions.length }"
            class="absolute z-999 w-full bg-gray-700 py-2 px-3 outline-1 -outline-offset-1 outline-white/10 rounded-b-lg"
        >
            <p
                v-for="suggestion in suggestions"
                :key="suggestion.id"
                @mousedown.prevent="emit('select-suggestion', suggestion)"
                class="rounded-md px-2.5 py-2 text-sm text-white hover:bg-white/20"
            >
                {{ suggestion.first_name + " " + suggestion.last_name }}
            </p>
        </div>
    </div>
</template>
