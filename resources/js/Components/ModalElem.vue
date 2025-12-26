<script setup>
const props = defineProps({
    // 'name' is used as 'FOR' 'ID' 'NAME' attributes
    name: {
        type: String,
        required: true,
    },
    modelValue: {
        required: true,
    },
});

const emit = defineEmits(["update:modelValue"]);

const onChange = (e) => {
    emit("update:modelValue", e.target.checked);
};
</script>
<template>
    <div class="flex h-6 items-center">
        <div
            class="group relative inline-flex w-8 shrink-0 rounded-full bg-white/5 p-px inset-ring inset-ring-white/10 outline-offset-2 outline-indigo-500 transition-colors duration-200 ease-in-out has-checked:bg-indigo-500 has-focus-visible:outline-2"
        >
            <span
                class="size-4 rounded-full bg-white shadow-xs ring-1 ring-gray-900/5 transition-transform duration-200 ease-in-out group-has-checked:translate-x-3.5"
            ></span>
            <input
                :id="name"
                type="checkbox"
                :name="name"
                :checked="modelValue"
                @change="onChange"
                class="absolute inset-0 size-full appearance-none focus:outline-hidden"
            />
        </div>
    </div>

    <label :for="name" class="text-sm/6 text-gray-400">
        {{ name.charAt(0).toUpperCase() + name.slice(1) }}
    </label>
</template>
