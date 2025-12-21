<script setup>
const props = defineProps({
    label: {
        type: String,
        required: true,
    },
    modelValue: {
        required: true,
    },
});
</script>
<template>
    <div class="text-white flex flex-col gap-y-2">
        <label>{{ label }}</label>
        <input :value="modelValue" class="border border-white" />
    </div>
</template>
