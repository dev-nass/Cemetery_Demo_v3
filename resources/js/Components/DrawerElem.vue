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
</script>
<template>
    <div class="sm:col-span-4">
        <label :for="name" class="block text-sm/6 font-medium text-white">{{
            name.charAt(0).toUpperCase() + name.slice(1)
        }}</label>
        <div class="mt-2">
            <div
                class="flex items-center rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1 outline-white/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-500"
            >
                <input
                    :id="name"
                    type="text"
                    :name="name"
                    :value="modelValue"
                    class="block min-w-0 grow bg-transparent py-1.5 pr-3 pl-1 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm/6"
                />
            </div>
        </div>
    </div>
</template>
