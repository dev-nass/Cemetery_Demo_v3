import L from "leaflet";

export function useControl() {
    /**
     * Parameters:
     *  -   mapInstance:    since I can't use the actual "map.value" due to timing / life cycle issue,
     * it always "null" when I use it inside here. hence, I used its instance.
     *  -   baseLayers:     for tile layer (google map view for this instance).
     *  -   overlay:        additional layers that will be passed by useMap.js.
     */
    // const initializeLayerControl = (mapInstance, baseLayers, overlays) => {
    //     if (!mapInstance) return;
    //     if (!baseLayers || !overlays) return;

    //     L.control.layers(baseLayers, overlays).addTo(mapInstance);
    // };

    /**
     * Paramters:
     * -    mapInstance:    similar usage to one above
     */
    const initializeDrawControl = (mapInstance) => {
        if (!mapInstance) {
            console.error("Map instance is null or undefined");
            return;
        }

        const drawControl = new L.Control.Draw({
            draw: {
                polygon: {
                    allowIntersection: false,
                    showArea: true,
                },
                marker: true,
                circle: false,
                rectangle: {
                    showArea: true,
                },
                polyline: false,
                circlemarker: false,
            },
        });

        mapInstance.addControl(drawControl); // Using parameter
    };

    return {
        // initializeLayerControl,
        initializeDrawControl,
    };
}
