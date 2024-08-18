const apiUrl = 'https://pcmiler.alk.com/apis/rest/v1.0/Service.svc/polygons/state?states=NJ';
const apiKey = 'F61E9A1295D8A342A868030A51DC3CA6';

// Function to call the REST API, filter the parameter, and rearrange coordinates
async function fetchAndProcessData() {
    try {
        // Call the REST API
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization':  `${apiKey}`
            }
        });

        // Check if the response is ok (status code 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse the JSON response
        const data = await response.json();

        // Extract and process only the coordinates from the Polygon parameter
        const coordinatesArray = data.map(item => {
            const polygonString = item.Polygon;

            // Assuming polygonString is in the format "POLYGON((x1 y1, x2 y2, ...))"
            const matches = polygonString.match(/\(\((.*?)\)\)/);
            if (matches) {
                return matches[1].split(',').map(coord => {
                    const [x, y] = coord.trim().split(' ').map(Number);
                    if (isNaN(x) || isNaN(y)) {
                        console.warn(`Invalid coordinate pair found: ${coord}`);
                        return null;  // Return null for invalid coordinates
                    }
                    return [x, y];
                }).filter(coord => coord !== null); // Filter out null values
            } else {
                throw new Error('Invalid Polygon format');
            }
        });

        // Flatten the coordinates array (removing outer brackets)
        const flatCoordinates = coordinatesArray.flat();

        // Output the coordinates as JSON without outer brackets
        const output = flatCoordinates.map(coord => `[${coord[0]},${coord[1]}]`).join(',');
        console.log(output);
    } catch (error) {
        // Handle errors
        console.error('Error fetching or processing data:', error);
    }
}

// Call the function to execute the process
fetchAndProcessData();



/*
const apiUrl = 'https://pcmiler.alk.com/apis/rest/v1.0/Service.svc/polygons/state?states=NJ';
const apiKey = 'F61E9A1295D8A342A868030A51DC3CA6';

// Function to call the REST API, filter the parameter, and rearrange coordinates
async function fetchAndProcessData() {
    try {
        // Call the REST API
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization':  `${apiKey}`
            }
        });

        // Check if the response is ok (status code 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse the JSON response
const data = await response.json();

// Extract and process only the coordinates from the Polygon parameter
const coordinatesArray = data.map(item => {
    const polygonString = item.Polygon;

    // Assuming polygonString is in the format "POLYGON((x1 y1, x2 y2, ...))"
    const matches = polygonString.match(/\(\((.*?)\)\)/);
    if (matches) {
        return matches[1].split(',').map(coord => {
            const [x, y] = coord.trim().split(' ').map(Number);
            if (isNaN(x) || isNaN(y)) {
                console.warn(`Invalid coordinate pair found: ${coord}`);
                return null;  // Return null for invalid coordinates
            }
            return [x, y];
        }).filter(coord => coord !== null); // Filter out null values
    } else {
        throw new Error('Invalid Polygon format');
    }
});

// Output the coordinates array as JSON
console.log(JSON.stringify(coordinatesArray));
} catch (error) {
// Handle errors
console.error('Error fetching or processing data:', error);
}
}

// Call the function to execute the process
fetchAndProcessData();

*/
// Example function to use the fetched coordinates
async function integrateGeoJson() {
    const geoCoordinates = await fetchAndProcessData();
    if (geoCoordinates) {
        // Construct the GeoJSON data object
        const geoJsonData = {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'Polygon',
                        coordinates: geoCoordinates // Wrap the coordinates in another array
                    }
                }]
            }
        };

        // Output the GeoJSON data for debugging purposes
        console.log('GeoJSON Data:', JSON.stringify(geoJsonData, null, 2));

        // Assuming you have a map instance already created and available as `map`
        map.on('load', function () {
            // Add GeoJSON data source to the map
            if (map.getSource('hqSource')) {
                map.removeSource('hqSource');
            }
            map.addSource('hqSource', geoJsonData);

            // Add a layer to draw the polygon
            if (map.getLayer('hqPoly')) {
                map.removeLayer('hqPoly');
            }
            map.addLayer({
                id: 'hqPoly',
                type: 'fill',
                source: 'hqSource',
                paint: {
                    'fill-color': '#000',
                    'fill-opacity': 0.5
                }
            });

            // Add a black outline around the polygon
            if (map.getLayer('hqoutline')) {
                map.removeLayer('hqoutline');
            }
            map.addLayer({
                id: 'hqoutline',
                type: 'line',
                source: 'hqSource',
                layout: {},
                paint: {
                    'line-color': '#000',
                    'line-width': 3
                }
            });
        });
    }
}

// Execute the function to integrate GeoJSON data into the map
integrateGeoJson();
