import { ref } from "vue";
import { route } from "ziggy-js";

export function pathFinder() {
    const junctions = ref([]);
    const pathways = ref([]);
    const graph = ref(null);
    const loading = ref(false);
    const error = ref(null);

    /**
     * Fetch navigation data from API
     * and feed those data to junctions and pathways states
     */
    const fetchNavigationData = async () => {
        try {
            loading.value = true;
            error.value = null;

            const [junctionsRes, pathwaysRes] = await Promise.all([
                fetch(route("junctions.index")), // Replace with your actual route name
                fetch(route("pathways.index")), // Replace with your actual route name
            ]);

            if (!junctionsRes.ok || !pathwaysRes.ok) {
                throw new Error("Failed to fetch navigation data");
            }

            const junctionsData = await junctionsRes.json();
            const pathwaysData = await pathwaysRes.json();

            junctions.value = junctionsData.data || junctionsData;
            pathways.value = pathwaysData.data || pathwaysData;

            // console.log(junctions.value);
            // console.log(pathways.value);

            // Build graph immediately after loading data
            graph.value = buildGraph(pathways.value);

            // console.log("Navigation data loaded:", {
            //     junctions: junctions.value.length,
            //     pathways: pathways.value.length,
            // });
        } catch (err) {
            console.error("Error loading navigation data:", err);
            error.value = err.message || "Failed to load navigation data";
        } finally {
            loading.value = false;
        }
    };

    /**
     * Build adjacency graph from pathways data,
     * Groups pathways data based on their "from" and "to"
     * "from" as the key and "to" as values
     * @param {Array} pathways - Array of pathway objects from API
     * @returns {Object} Graph structure
     */
    const buildGraph = (pathways) => {
        // NOTE: becomes Object of Array with objects {}; check code equivalent
        const graph = {};

        pathways.forEach((pathway) => {
            const from = pathway.from_junction_id;
            const to = pathway.to_junction_id;
            const distance = parseFloat(pathway.distance_meters);

            // Initialize arrays if they don't exist
            if (!graph[from]) {
                graph[from] = [];
            }

            // Add edge with distance and pathway reference
            graph[from].push({
                junctionId: to,
                distance: distance,
                pathwayId: pathway.id,
                coordinates: pathway.coordinates, // Store for later display
            });
        });

        console.log("Graph", graph);

        return graph;
    };

    /**
     * FIX: UNDERSTAND THIS AGAIN
     *
     * Reconstruct the path from previous nodes
     * @param {Object} previous - Previous nodes mapping
     * @param {Number} start - Start junction ID
     * @param {Number} end - End junction ID
     * @returns {Array} Path as array of junction IDs
     */
    const reconstructPath = (previous, start, end) => {
        const path = [];
        let current = end;

        // Build path backwards from end to start
        while (current !== undefined) {
            path.unshift(current);

            if (current === start) {
                break;
            }

            current = previous[current]?.junctionId;
        }

        // If path doesn't start with start junction, no route found
        if (path[0] !== start) {
            return [];
        }

        return path;
    };

    /**
     * FIX: Understand this again
     *
     * Build detailed route information for display
     * @param {Array} path - Array of junction IDs
     * @param {Array} allJunctions - All junction objects
     * @param {Object} previous - Previous nodes mapping
     * @returns {Array} Detailed route information
     */
    const buildRouteDetails = (path, allJunctions, previous) => {
        const details = [];

        for (let i = 0; i < path.length; i++) {
            const junctionId = path[i];
            const junction = allJunctions.find((j) => j.id === junctionId);

            if (!junction) continue;

            const detail = {
                junctionId: junctionId,
                junctionNumber: junction.junction_number,
                type: junction.type,
                latitude: junction.latitude,
                longitude: junction.longitude,
                coordinates: [junction.longitude, junction.latitude],
            };

            // Add pathway coordinates for the route to this junction
            if (i > 0 && previous[junctionId]) {
                detail.pathwayCoordinates = previous[junctionId].coordinates;
                detail.pathwayId = previous[junctionId].pathwayId;
            }

            details.push(detail);
        }

        return details;
    };

    /**
     * Dijkstra's shortest path algorithm
     * @param {Number} startJunctionId - Starting junction ID
     * @param {Number} endJunctionId - Destination junction ID
     * @returns {Object} Route information
     */
    const findShortestPath = (startJunctionId, endJunctionId) => {
        if (!graph.value) {
            console.error(
                "Graph not initialized. Call fetchNavigationData first.",
            );
            return {
                success: false,
                path: [],
                totalDistance: Infinity,
                details: [],
            };
        }

        // Initialize distances and previous nodes

        // holds the obj of junction ids and set their distance based on the startJunctionId param
        // 2: 50.2; meaning that junction id 2 has 50.2 meters away from the the startJunctionId param
        const distances = {};
        const previous = {};

        const unvisited = new Set(); // holds the a

        // Get all unique junction IDs from graph
        // so baically we are doing this because some junction are not
        // included as keys because they are the last one,
        // meaning they have no "from" and "to" on the graph.value
        const junctionIds = new Set([
            ...Object.keys(graph.value).map(Number), // gets all junction id that are on "from"
            ...Object.values(graph.value) // gets all junction id that are on "to"
                .flat()
                .map((edge) => edge.junctionId),
        ]);

        // Initialize all distances to infinity
        junctionIds.forEach((id) => {
            distances[id] = Infinity;
            unvisited.add(id);
        });

        // Distance to start is 0
        distances[startJunctionId] = 0;

        // Main algorithm loop
        while (unvisited.size > 0) {
            // Find unvisited node with smallest distance
            let currentJunction = null;
            let smallestDistance = Infinity;

            // junctionId, because the values of unvisited set are junctionIds
            for (const junctionId of unvisited) {
                // if we encounter the distances[startJunctionId] = 0; this IF statement will run
                if (distances[junctionId] < smallestDistance) {
                    smallestDistance = distances[junctionId];
                    currentJunction = junctionId;
                }
            }

            // If we can't reach any more nodes, break
            if (
                currentJunction === null ||
                distances[currentJunction] === Infinity
            ) {
                break;
            }

            // If we reached the destination, we can stop
            if (currentJunction === endJunctionId) {
                break;
            }

            // Remove current from unvisited
            unvisited.delete(currentJunction);

            // Check all neighbors,
            // all the junctions that share the same from junction id
            const neighbors = graph.value[currentJunction] || [];

            // NOTE: Continue here
            for (const neighbor of neighbors) {
                const neighborId = neighbor.junctionId;

                // Calculate alternative distance
                const alt = distances[currentJunction] + neighbor.distance;

                // If this path is shorter, update
                // Similarly, at firtst if we encounter the distances[startJunctionId] = 0;
                // this IF statement will run
                if (alt < distances[neighborId]) {
                    distances[neighborId] = alt;
                    previous[neighborId] = {
                        junctionId: currentJunction,
                        pathwayId: neighbor.pathwayId,
                        coordinates: neighbor.coordinates,
                    };
                }
            }
        }

        // NOTE: Continue up to here (what previous value are we passing if we don't alt < distance[neighborId])
        // Reconstruct path
        const path = reconstructPath(previous, startJunctionId, endJunctionId);

        // Get detailed route information
        const routeDetails = buildRouteDetails(path, junctions.value, previous);

        return {
            success: path.length > 0,
            path: path, // Array of junction IDs
            totalDistance: distances[endJunctionId],
            details: routeDetails,
        };
    };

    /**
     * Calculate distance between two coordinates (Haversine formula)
     * @param {Number} lat1 - Latitude of first point
     * @param {Number} lon1 - Longitude of first point
     * @param {Number} lat2 - Latitude of second point
     * @param {Number} lon2 - Longitude of second point
     * @returns {Number} Distance in meters
     */
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371000; // Earth's radius in meters
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lon2 - lon1) * Math.PI) / 180;

        const a =
            Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
    };

    /**
     * Find nearest junction to a given coordinate,
     * access the junctions state and find the nearest
     * @param {Number} latitude - Target latitude
     * @param {Number} longitude - Target longitude
     * @returns {Object|null} Nearest junction object
     */
    const findNearestJunction = (latitude, longitude) => {
        let nearest = null;
        let minDistance = Infinity;

        junctions.value.forEach((junction) => {
            const distance = calculateDistance(
                latitude,
                longitude,
                junction.latitude,
                junction.longitude,
            );

            if (distance < minDistance) {
                minDistance = distance;
                nearest = junction;
            }
        });

        return nearest;
    };

    /**
     * Get entrance junction
     * @returns {Object|null} Entrance junction object
     */
    const getEntranceJunction = () => {
        return junctions.value.find((j) => j.type === "entrance") || null;
    };

    /**
     * Find route from entrance to a plot
     * @param {Object} plot - Plot object with longitude and latitude
     * @returns {Object} Route information
     */
    const findRouteToPlot = (plot) => {
        const entrance = getEntranceJunction();
        if (!entrance) {
            console.error("No entrance junction found");
            return {
                success: false,
                path: [],
                totalDistance: Infinity,
                details: [],
            };
        }

        const nearestJunction = findNearestJunction(
            plot.latitude,
            plot.longitude,
        );

        if (!nearestJunction) {
            console.error("No nearby junction found for plot");
            return {
                success: false,
                path: [],
                totalDistance: Infinity,
                details: [],
            };
        }

        return findShortestPath(entrance.id, nearestJunction.id);
    };

    // Return all functions and reactive data
    return {
        // Reactive data
        junctions,
        pathways,
        graph,
        loading,
        error,

        // Methods
        fetchNavigationData,
        buildGraph,
        findShortestPath,
        calculateDistance,
        findNearestJunction,
        getEntranceJunction,
        findRouteToPlot,
    };
}
