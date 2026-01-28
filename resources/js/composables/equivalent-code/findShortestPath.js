const graph = {
    1: [
        // ✓ Key is the junction ID (number or string)
        {
            junctionId: 2,
            distance: 50.5,
            pathwayId: 101,
            coordinates: [
                [120.975636, 14.304631],
                [120.9757, 14.3047],
            ],
        },
        {
            junctionId: 3,
            distance: 75.2,
            pathwayId: 102,
            coordinates: [
                [120.975636, 14.304631],
                [120.9758, 14.3048],
            ],
        },
    ],
    2: [
        // ✓ Key is the junction ID
        {
            junctionId: 4,
            distance: 30.1,
            pathwayId: 103,
            coordinates: [
                [120.9757, 14.3047],
                [120.9759, 14.3049],
            ],
        },
    ],
    3: [
        // ✓ Key is the junction ID
        {
            junctionId: 4,
            distance: 25.3,
            pathwayId: 104,
            coordinates: [
                [120.9758, 14.3048],
                [120.9759, 14.9049],
            ],
        },
    ],
};

const distances = {};
const unvisited = new Set();

const junctionIds = new Set([
    ...Object.keys(graph).map(Number), // [1, 2, 3]
    ...Object.values(graph)
        .flat()
        .map((edge) => edge.junctionId), // [2, 3, 4, 4]
]);

console.log(junctionIds); // Set { 1, 2, 3, 4 } ✓

// Initialize all distances to infinity
junctionIds.forEach((id) => {
    distances[id] = Infinity;
    unvisited.add(id);
});

console.log(distances);
console.log(unvisited);
