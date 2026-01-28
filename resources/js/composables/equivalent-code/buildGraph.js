// NOTE: EQUIVALENT CODE:
const person = {
    firstName: "John",
    lastName: "Doe",
};

const newKey = "coordinates";
const newValue = [];

person[newKey] = newValue;
person[newKey].push({ 1: "norte", 2: "south" });

console.log(person);

// NOTE: EQUIVALENT CODE 2:
const person = {
    firstName: "John",
    lastName: "Doe",
};

const newKey = "coordinates";
const newValue = [];

person[newKey] = newValue;
person[newKey].push({
    junctionId: 1,
    distance: "27m",
    pathwayId: 2,
    coordinates: [14.21234298347, 120.827348234], // Store for later display
});

person[newKey].push({
    junctionId: 2,
    distance: "29m",
    pathwayId: 2,
    coordinates: [14.1123991234, 120.23234234], // Store for later display
});

console.log(person.coordinates[1]);
