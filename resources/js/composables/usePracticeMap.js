import { ref } from "vue";
import L from "leaflet";

import { useMapState } from "@/stores/useMapState";
import { useControl } from "./map/useControl";
import { useDbGeoJson } from "./map/useDbGeoJson";
import { useMapSearchState } from "../stores/useMapSearchState";
import { pathFinder } from "./pathFinder";

const {
    map,
    googleLayer,
    entranceLayer,
    lotsUndergroundLayer,
    lotsApartmentLayer,
    sectionLayer,
    showSection,
    uniqueTypes,
    lotLayers,
    lotVisibility,
    showUnderground,
    showApartment,
} = useMapState();
const { initializeLayerControl, initializeDrawControl } = useControl();
const { fetchLotsDBGeoJson, fetchSectionsDBGeoJson } = useDbGeoJson();

const { searchResultLayer } = useMapSearchState();

const {
    fetchNavigationData,
    findShortestPath,
    findRouteToPlot,
    findNearestJunction,
    getEntranceJunction,
    junctions,
    loading,
    error,
} = pathFinder();

// Panteon Long and Lat
const LAT = 14.3052681;
const LONG = 120.9758;
const ZOOM_LVL = 18;
const MIN_RENDER_ZOOM = 20;
const RENDER_DEBOUNCE_MS = 2000;

// (EXPERIMENTAL)
// roughly ~1km x 1km area (adjust values)
const offsetLat = 0.001;
const offsetLng = 0.001;

const imageBounds = [
    [LAT - offsetLat, LONG - offsetLng], // south-west
    [LAT + offsetLat, LONG + offsetLng], // north-east
];

let imageUrl = "/images/map-overlay.jpg";

// no junction
const samplePath =
    "https://www.google.com/maps/dir/14.304631,120.975636/14.304806602040162744060580735094845294952392578125,120.976185992771007704504881985485553741455078125";

// with junction
const samplePathv2 =
    "https://www.google.com/maps/dir/14.304631,120.975636/14.3048291586219722404393905890174210071563720703125,120.976559224839661510486621409654617309570312k";

// in between junction
const samplePathv3 =
    "https://www.google.com/maps/dir/14.304631,120.975636/14.30464452558492638445386546663939952850341796875,120.976574797456379428695072419941425323486328125";

const google_path_mess =
    "https://www.google.com/maps/dir/14.304631,120.975636/14.305115800643793733115671784617006778717041015625,120.975157595301681112687219865620136260986328125";

const google_path_correct =
    "https://www.google.com/maps/dir/14.304631,120.975636/14.3059115,120.9764689/@14.304831,120.975668,221m/data=!3m1!1e3?entry=ttu&g_ep=EgoyMDI2MDExMy4wIKXMDSoASAFQAw%3D%3D";

export function usePracticeMap() {
    const initializeMap = async (mapContainerElem) => {
        map.value = L.map(mapContainerElem).setView([LAT, LONG], ZOOM_LVL);

        // adds the overlay image on the map
        // L.imageOverlay(imageUrl, imageBounds).addTo(map.value);

        initializeLayers();
        googleLayer.value.addTo(map.value);
        entranceLayer.value.addTo(map.value);
        // lotsUndergroundLayer.value.addTo(map.value);
        // lotsApartmentLayer.value.addTo(map.value);
        updateVisibility();
        markEntrance();
        markTestTarget();

        entranceLayer.value.on("click", onMapClick);

        // initializeLayerControl(
        //     map.value,
        //     { "Google Satellite": googleLayer.value }, // Base layers
        //     {
        //         Entrance: entranceLayer.value,
        //         Apartment: lotsApartmentLayer.value,
        //         Underground: lotsUndergroundLayer.value,
        //     } // Overlays
        // );
        initializeDrawControl(map.value);

        map.value.on("zoomend", updateVisibility);

        await fetchLotsDBGeoJson();
        await fetchSectionsDBGeoJson();

        // console.log(lotsUndergroundLayer.value.getLayers());
    };

    const initializeLayers = () => {
        if (!googleLayer.value) {
            googleLayer.value = L.tileLayer(
                "https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
                {
                    maxZoom: 30,
                    subdomains: ["mt0", "mt1", "mt2", "mt3"],
                },
            );
        }

        if (!entranceLayer.value) {
            entranceLayer.value = L.layerGroup();
        }

        if (!lotsUndergroundLayer.value) {
            lotsUndergroundLayer.value = L.layerGroup();
        }

        if (!lotsApartmentLayer.value) {
            lotsApartmentLayer.value = L.layerGroup();
        }
    };

    const markEntrance = () => {
        const marker = L.marker([14.304631, 120.975636]).addTo(
            entranceLayer.value,
        );

        marker.bindPopup("Here's the entrance");
    };

    function onMapClick(e) {
        alert("You clicked the map at " + e.latlng);
    }

    const updateVisibility = () => {
        if (!map.value) return;

        const zoom = map.value.getZoom();

        // too far
        if (zoom < MIN_RENDER_ZOOM) {
            // map.value.removeLayer(lotsUndergroundLayer.value);
            // map.value.removeLayer(lotsApartmentLayer.value);
            cleanupLayers();

            console.log("Lots hidden (zoom too far)");
        }
        // right zoom
        else {
            if (searchResultLayer.value.getLayers().length > 0) {
                // SEARCH MODE → only show search result
                cleanupLayers();

                if (!map.value.hasLayer(searchResultLayer.value)) {
                    searchResultLayer.value.addTo(map.value);
                }

                console.log("Search result visible");
            } else {
                if (showSection.value === true) {
                    sectionLayer.value.addTo(map.value);
                } else {
                    map.value.removeLayer(sectionLayer.value);
                }
                uniqueTypes.value.forEach((type) => {
                    if (lotVisibility.value.get(type) === true) {
                        lotLayers.value.get(type).addTo(map.value);
                    } else {
                        map.value.removeLayer(lotLayers.value.get(type));
                    }
                });
            }
            // lotLayers.value.get("underground").addTo(map.value);
            // console.log(lotLayers.value.get("underground"));
            // if (showUnderground.value && showApartment.value) {
            //     console.log("both");
            //     lotsUndergroundLayer.value.addTo(map.value);
            //     lotsApartmentLayer.value.addTo(map.value);
            // } else if (showUnderground.value && !showApartment.value) {
            //     console.log("underground");
            //     lotsUndergroundLayer.value.addTo(map.value);
            //     map.value.removeLayer(lotsApartmentLayer.value);
            // } else if (!showUnderground.value && showApartment.value) {
            //     console.log("apartment");
            //     lotsApartmentLayer.value.addTo(map.value);
            //     map.value.removeLayer(lotsUndergroundLayer.value);
            // }
        }

        // console.log(zoom);
    };

    // used if the zoom is too far
    const cleanupLayers = () => {
        map.value.removeLayer(sectionLayer.value);
        uniqueTypes.value.forEach((type) => {
            map.value.removeLayer(lotLayers.value.get(type));
        });
    };

    // properly destroys the map each render; used in View
    const cleanupMap = () => {
        if (map.value) {
            map.value.remove(); // Properly destroys map and removes all listeners
            map.value = null;
        }

        // Clear layer references
        entranceLayer.value = L.layerGroup();
        lotsUndergroundLayer.value = L.layerGroup();
        lotsApartmentLayer.value = L.layerGroup();
    };

    // continuously calls the updateVisibility
    setInterval(() => {
        console.log("updating...");
        updateVisibility();
    }, RENDER_DEBOUNCE_MS);

    fetchNavigationData();
    const markTestTarget = () => {
        const testPlot = L.marker([
            14.304806602040162744060580735094845294952392578125,
            120.976185992771007704504881985485553741455078125,
        ]).addTo(entranceLayer.value);

        // const testPlot = L.marker([
        //     14.304777907839792305821902118623256683349609375,
        //     120.976560652182428157175309024751186370849609375,
        // ]).addTo(entranceLayer.value);

        // const testPlot = L.marker([
        //     14.30464452558492638445386546663939952850341796875,
        //     120.976574797456379428695072419941425323486328125,
        // ]).addTo(entranceLayer.value);

        testPlot.bindPopup("This is the target plot");
    };

    // Test pathfinding functionality
    // NOTE: This method is not used
    const testPathfinding = () => {
        if (loading.value) {
            console.log("Pathfinding data still loading...");
            return;
        }

        if (error.value) {
            console.error("Pathfinding error:", error.value);
            return;
        }

        if (junctions.value.length === 0) {
            console.log("No junctions available for pathfinding");
            return;
        }

        // Test 1: Find entrance junction
        const entrance = getEntranceJunction();
        if (entrance) {
            console.log("Entrance found:", entrance);
        } else {
            console.log("No entrance junction found");
        }

        // Test 2: Find shortest path between first two junctions
        if (junctions.value.length >= 2) {
            const startJunction = junctions.value[0];
            const endJunction = junctions.value[1];

            console.log(
                `Testing path from junction ${startJunction.id} to junction ${endJunction.id}`,
            );

            const route = findShortestPath(startJunction.id, endJunction.id);
            console.log(route);

            if (route.success) {
                console.log("Path found!", {
                    path: route.path,
                    distance: route.totalDistance,
                    details: route.details,
                });

                console.log(route.details);
                // Draw the path on the map
                drawPathOnMap(route.details);
            } else {
                console.log("No path found between these junctions");
            }
        }

        // Test 3: Find route to your specific coordinates
        testPathToSpecificPlot();
    };

    // Test path to your specific coordinates
    // Fix the test function
    const testPathToSpecificPlot = () => {
        const coords = [
            120.976185992771007704504881985485553741455078125,
            14.304806602040162744060580735094845294952392578125,
        ];

        // const coords = [
        //     120.9765592248396615104866214096546173095703125, // long
        //     14.3048291586219722404393905890174210071563720703125, // lat
        // ];

        // const coords = [
        //     120.976574797456379428695072419941425323486328125,
        //     14.30464452558492638445386546663939952850341796875,
        // ];

        // ADD THIS DEBUG LOG
        console.log("Target coordinates:", {
            lat: coords[1],
            lng: coords[0],
            "Should be near entrance": {
                entrance_lat: 14.304631,
                entrance_lng: 120.975636,
            },
        });

        const targetPlot = {
            longitude: coords[0],
            latitude: coords[1], // Now using correct indices
            id: "target-plot",
        };

        console.log("Testing path to your specific plot:", {
            centerLng: coords[0],
            centerLat: coords[1],
        });

        const plotRoute = findRouteToPlot(targetPlot);
        console.log(plotRoute);

        if (plotRoute.success) {
            console.log("Route to your plot found!", {
                path: plotRoute.path,
                distance: plotRoute.totalDistance,
                details: plotRoute.details,
            });

            drawPathOnMap(plotRoute.details);
        } else {
            console.log(
                "No route found to your plot, drawing direct line from entrance",
            );

            // FIX: Pass latitude first, then longitude
            drawDirectPathFromEntrance(coords[1], coords[0]); // (lat, lng)
        }
    };

    // Fix the direct path function - rename params for clarity
    const drawDirectPathFromEntrance = (targetLat, targetLng) => {
        if (!map.value) return;

        if (window.directPathLayer) {
            map.value.removeLayer(window.directPathLayer);
        }

        // Entrance coordinates [lat, lng]
        const entranceCoords = [14.304631, 120.975636];

        // Leaflet expects [lat, lng]
        const coordinates = [
            entranceCoords,
            [targetLat, targetLng], // Now correctly ordered
        ];

        window.directPathLayer = L.polyline(coordinates, {
            color: "red",
            weight: 4,
            opacity: 0.7,
        }).addTo(map.value);

        // Add marker for target plot
        L.marker([targetLat, targetLng])
            .bindPopup(
                `Target Plot<br>Center: ${targetLat.toFixed(6)}, ${targetLng.toFixed(6)}`,
            )
            .addTo(map.value);

        map.value.fitBounds(coordinates);
    };

    // Draw line to nearest junction if no path found
    // NOTE: This function is not used
    const drawLineToNearestJunction = (
        targetLat,
        targetLng,
        nearestJunction,
    ) => {
        if (!map.value) return;

        // Clear previous nearest line
        if (window.nearestLineLayer) {
            map.value.removeLayer(window.nearestLineLayer);
        }

        const coordinates = [
            [targetLat, targetLng],
            [nearestJunction.latitude, nearestJunction.longitude],
        ];

        window.nearestLineLayer = L.polyline(coordinates, {
            color: "orange",
            weight: 3,
            opacity: 0.7,
            dashArray: "10, 10",
        }).addTo(map.value);

        // Add marker for nearest junction
        L.marker([nearestJunction.latitude, nearestJunction.longitude])
            .bindPopup(
                `Nearest Junction: ${nearestJunction.junctionNumber}<br>Type: ${nearestJunction.type}`,
            )
            .addTo(map.value);
    };

    // Draw path on map
    const drawPathOnMap = (routeDetails) => {
        if (!map.value || !routeDetails || routeDetails.length === 0) return;

        // Clear previous path layers
        if (window.testPathLayer) {
            map.value.removeLayer(window.testPathLayer);
        }

        const coordinates = routeDetails.map((detail) => [
            detail.latitude,
            detail.longitude,
        ]);

        // Create polyline for the path
        window.testPathLayer = L.polyline(coordinates, {
            color: "red",
            weight: 4,
            opacity: 0.7,
        }).addTo(map.value);

        // Add markers for junctions
        // routeDetails.forEach((detail, index) => {
        //     const marker = L.marker([detail.latitude, detail.longitude])
        //         .bindPopup(`Junction ${detail.junctionNumber} (${detail.type})`)
        //         .addTo(map.value);
        // });

        // Fit map to show the entire path
        if (coordinates.length > 0) {
            map.value.fitBounds(coordinates);
        }
    };

    return {
        initializeMap,
        cleanupMap,
        // pathfinder
        testPathfinding,
        testPathToSpecificPlot,
        drawPathOnMap,
        drawDirectPathFromEntrance,
    };
}
