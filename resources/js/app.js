import { createApp, h } from "vue";
import { createInertiaApp } from "@inertiajs/vue3";
import { Link } from "@inertiajs/vue3";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

createInertiaApp({
    resolve: (name) => {
        const pages = import.meta.glob("./Pages/**/*.vue", { eager: true });
        return pages[`./Pages/${name}.vue`];
    },
    setup({ el, App, props, plugin }) {
        createApp({ render: () => h(App, props) })
            .use(plugin)
            .component("Link", Link)
            .mount(el);
    },

    title: (title) => `${title} | Panteon De Dasmarinas`,
});
