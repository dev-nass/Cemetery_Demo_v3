import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { route } from "ziggy-js";
import L from "leaflet";
import "leaflet-draw";

const MIN_RENDER_ZOOM = 20;
const RENDER_DEBOUNCE_MS = 150;

export function useMapLots() {
    // Reactive state
    const map = ref(null);
    const editableLayers = ref(null);
    const allSectionLayer = ref(null);
    const allLotsLayer = ref(null);
    const dbGeoJsonSections = ref([]);
    const dbGeoJsonLots = ref([]);
    const newGeoJsonData = ref(null);
    const selectedLotId = ref(null);

    // Computed
    const isSaveEnabled = computed(() => !!newGeoJsonData.value);
    const geoJsonOutput = computed(() =>
        newGeoJsonData.value
            ? JSON.stringify(newGeoJsonData.value, null, 2)
            : "No polygon drawn yet."
    );

    // lot styling
    const getLotStyle = (feature) => {
        const colors = {
            available: "#90EE90",
            occupied: "#FFB6C6",
            reserved: "#FFE66D",
        };

        return {
            fillColor: colors[feature.properties.status] || "#CCCCCC",
            weight: 1,
            color: "white",
            fillOpacity: 0.7,
        };
    };

    // Attach popup to lot
    const attachLotPopup = (feature, layer) => {
        layer.on("add", function () {
            const layerId = layer._leaflet_id;

            const popupContent = `
                <strong>lot: ${feature.properties.lot_id}</strong><br>
                Section: ${feature.properties.section}<br>
                Status: ${feature.properties.status}<br>
                <button onclick="window.selectLotForEditing(${layerId})" 
                    class="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Edit This lot
                </button>
            `;

            layer.bindPopup(popupContent);

            // Permanent tooltip label
            if (feature.properties?.Lot_id) {
                layer.bindTooltip(String(feature.properties.lot_id), {
                    permanent: true,
                    direction: "center",
                    className: "lot-label",
                    interactive: false,
                });
            }
        });

        // Shift+Click to edit
        layer.on("click", function (e) {
            if (e.originalEvent.shiftKey) {
                selectPolygonForEditing(layer);
                L.DomEvent.stopPropagation(e);
            }
        });
    };

    // Select polygon for editing
    const selectPolygonForEditing = (layerOrId) => {
        let layer;

        if (typeof layerOrId === "string" || typeof layerOrId === "number") {
            const id = parseInt(layerOrId);
            allLotsLayer.value?.eachLayer((l) => {
                if (l._leaflet_id === id) {
                    layer = l;
                }
            });
        } else {
            layer = layerOrId;
        }

        if (!layer) {
            console.error("Layer not found for id:", layerOrId);
            return;
        }

        // Clear previous selection
        editableLayers.value?.clearLayers();

        const geojson = layer.toGeoJSON();

        // Create editable layer
        const editableFeatureGroup = L.geoJSON(geojson, {
            style: {
                fillColor: geojson.properties?.status
                    ? {
                          available: "#90EE90",
                          occupied: "#FFB6C6",
                          reserved: "#FFE66D",
                      }[geojson.properties.status] || "#CCCCCC"
                    : "#CCCCCC",
                color: "#FFD700",
                weight: 3,
                fillOpacity: 0.7,
            },
        });

        editableFeatureGroup.eachLayer((l) => {
            editableLayers.value?.addLayer(l);
        });

        selectedLotId.value = geojson.properties?.lot_id;
        console.log(`lot ${geojson.properties?.Lot_id} selected for editing`);

        layer.closePopup();
    };

    // Process features
    const processFeatures = (data) => {
        if (!data || !data.features || !Array.isArray(data.features)) {
            console.warn("Invalid GeoJSON data structure");
            return [];
        }

        return data.features
            .filter((feature) => {
                // Filter out features with null/missing geometry first
                if (!feature || !feature.geometry || !feature.geometry.type) {
                    console.warn(
                        "Skipping feature with null/missing geometry:",
                        feature
                    );
                    return false;
                }
                return true;
            })
            .map((feature) => {
                // Convert MultiPolygon to Polygon (take first polygon)
                if (feature.geometry.type === "MultiPolygon") {
                    if (
                        feature.geometry.coordinates &&
                        feature.geometry.coordinates[0]
                    ) {
                        feature.geometry = {
                            type: "Polygon",
                            coordinates: feature.geometry.coordinates[0],
                        };
                    }
                }
                return feature;
            })
            .filter(validateFeature);
    };

    // Validate feature
    const validateFeature = (feature) => {
        if (!feature.geometry?.coordinates) return false;

        const coords = feature.geometry.coordinates;

        if (feature.geometry.type === "Polygon") {
            if (!Array.isArray(coords) || !coords[0]) return false;

            return coords[0].every((coord) => {
                if (!Array.isArray(coord) || coord.length < 2) return false;
                const [lng, lat] = coord;
                return (
                    typeof lng === "number" &&
                    typeof lat === "number" &&
                    !isNaN(lng) &&
                    !isNaN(lat) &&
                    Math.abs(lat) <= 90 &&
                    Math.abs(lng) <= 180
                );
            });
        }

        return true;
    };

    // Update layer visibility based on zoom
    const updateLayerVisibility = () => {
        if (!map.value) return;

        const zoom = map.value.getZoom();

        if (zoom < MIN_RENDER_ZOOM) {
            if (map.value.hasLayer(allLotsLayer.value)) {
                map.value.removeLayer(allLotsLayer.value);
                console.log("Lots hidden (zoom too far)");
            }
        } else {
            if (!map.value.hasLayer(allLotsLayer.value)) {
                map.value.addLayer(allLotsLayer.value);
                console.log("Lots visible");
            }
        }
    };

    // Fetch GeoJSON from database
    const fetchDBGeoJson = async () => {
        try {
            const response = await fetch(route("lots.geojson"));

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            const processedFeatures = processFeatures(data);
            dbGeoJsonLots.value = processedFeatures;

            // Remove existing layer
            if (allLotsLayer.value && map.value) {
                map.value.removeLayer(allLotsLayer.value);
            }

            // Only create layer if there are valid features
            if (processedFeatures.length > 0) {
                allLotsLayer.value = L.geoJSON(processedFeatures, {
                    style: getLotStyle,
                    onEachFeature: attachLotPopup,
                });

                updateLayerVisibility();
                console.log(`Loaded ${processedFeatures.length} Lots`);
            } else {
                console.warn("No valid Lots found in GeoJSON data");
                allLotsLayer.value = L.geoJSON([]); // Empty layer
            }
        } catch (err) {
            console.error("Error loading GeoJSON:", err);
            // Create empty layer on error
            allLotsLayer.value = L.geoJSON([]);
        }
    };

    // Initialize map
    const initializeMap = (mapContainer) => {
        if (!mapContainer) return;

        map.value = L.map(mapContainer, {
            renderer: L.canvas(),
            preferCanvas: true,
        }).setView([14.3052681, 120.9758], 18);

        L.tileLayer("https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
            maxZoom: 30,
            subdomains: ["mt0", "mt1", "mt2", "mt3"],
        }).addTo(map.value);

        // Inject CSS for lot labels
        injectLotLabelStyles();

        // Initialize editable layers
        editableLayers.value = new L.FeatureGroup();
        map.value.addLayer(editableLayers.value);

        // Initialize draw control
        initializeDrawControl();

        // Setup event handlers
        setupDrawHandlers();
        setupZoomHandler();

        // Fetch data
        fetchDBGeoJson();

        // Make select function globally accessible
        window.selectLotForEditing = selectPolygonForEditing;
    };

    // Inject CSS styles
    const injectLotLabelStyles = () => {
        if (document.getElementById("lot-label-styles")) return;

        const styleEl = document.createElement("style");
        styleEl.id = "lot-label-styles";
        styleEl.textContent = `
      .leaflet-tooltip.lot-label {
        background: rgba(255,255,255,0.85);
        border: 1px solid rgba(0,0,0,0.15);
        color: #000;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 3px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.15);
      }
      .leaflet-tooltip.lot-label::after { display: none; }
    `;
        document.head.appendChild(styleEl);
    };

    // Initialize draw control
    const initializeDrawControl = () => {
        if (!editableLayers.value) {
            console.error("editableLayers not initialized");
            return;
        }

        const drawControl = new L.Control.Draw({
            draw: {
                polygon: {
                    allowIntersection: false,
                    showArea: true,
                },
                marker: false,
                circle: false,
                rectangle: {
                    showArea: true,
                },
                polyline: false,
                circlemarker: false,
            },
            edit: {
                featureGroup: editableLayers.value,
                edit: {
                    selectedPathOptions: {
                        maintainColor: true,
                        opacity: 0.8,
                    },
                },
                remove: true,
            },
        });

        map.value.addControl(drawControl);
    };

    // Setup draw event handlers
    const setupDrawHandlers = () => {
        map.value.on(L.Draw.Event.CREATED, (e) => {
            const layer = e.layer;
            editableLayers.value.addLayer(layer);

            const geojson = layer.toGeoJSON();
            newGeoJsonData.value = geojson.geometry.coordinates;

            console.log("New polygon drawn:", newGeoJsonData.value);
        });

        map.value.on(L.Draw.Event.DELETED, () => {
            newGeoJsonData.value = null;
            selectedLotId.value = null;
            console.log("Polygon deleted");
        });

        map.value.on(L.Draw.Event.EDITED, (e) => {
            const layers = e.layers;
            layers.eachLayer((layer) => {
                const geojson = layer.toGeoJSON();
                newGeoJsonData.value = geojson.geometry.coordinates;
                console.log("Polygon edited:", newGeoJsonData.value);
            });
        });
    };

    // Setup zoom handler with debounce
    let zoomTimeout;
    const setupZoomHandler = () => {
        map.value.on("zoomend", () => {
            clearTimeout(zoomTimeout);
            zoomTimeout = setTimeout(updateLayerVisibility, RENDER_DEBOUNCE_MS);
        });
    };

    // Refresh map data
    const refreshMap = () => {
        editableLayers.value?.clearLayers();
        newGeoJsonData.value = null;
        selectedLotId.value = null;
        fetchDBGeoJson();
        console.log("Map data refreshed");
    };

    // Save lot (implement with your store function)
    const saveLot = async (LotData) => {
        if (!newGeoJsonData.value) return;

        try {
            // Import your storeLot function here
            // await storeLot(newGeoJsonData.value);
            console.log("Saving lot:", LotData);

            // After successful save, refresh
            await refreshMap();
        } catch (error) {
            console.error("Error saving lot:", error);
            throw error;
        }
    };

    // Cleanup on unmount
    onUnmounted(() => {
        if (map.value) {
            map.value.remove();
            map.value = null;
        }
        delete window.selectLotForEditing;
    });

    return {
        // State
        map,
        editableLayers,
        allLotsLayer,
        dbGeoJsonLots,
        newGeoJsonData,
        selectedLotId,

        // Computed
        isSaveEnabled,
        geoJsonOutput,

        // Methods
        initializeMap,
        selectPolygonForEditing,
        refreshMap,
        saveLot,
        fetchDBGeoJson,
    };
}
