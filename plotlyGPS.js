const speedOfLight = 3 * 10**8; 

const trace1 = {
    x: [], // координати X для супутників
    y: [], // координати Y для супутників
    mode: 'markers',
    type: 'scatter',
    name: 'Satellites',
    marker: { color: 'blue' }
};

const trace2 = {
    x: [], // координати X для об'єкта
    y: [], // координати Y для об'єкта
    mode: 'markers',
    type: 'scatter',
    name: 'Object',
    marker: { color: 'red' }
};

const data = [trace1, trace2];

const layout = {
    title: 'Satellite and Object Positions',
    xaxis: { title: 'X Coordinate' },
    yaxis: { title: 'Y Coordinate' }
};

Plotly.newPlot('plot', data, layout);

const satellites = {};
function processMessage(message) {
    const { id, x, y, sentAt, receivedAt } = message;

    if (!satellites[id]) {
        if (Object.keys(satellites).length >= 3) 
            delete satellites[Object.keys(satellites)[0]];
        satellites[id] = { x: [], y: [], sentAt: [], receivedAt: [] };
    } else {
        satellites[id].x = [];
        satellites[id].y = [];
        satellites[id].sentAt = [];
        satellites[id].receivedAt = [];
    }

    satellites[id].x.push(x);
    satellites[id].y.push(y);
    satellites[id].sentAt.push(sentAt);
    satellites[id].receivedAt.push(receivedAt);

    updateChart();
}

function updateChart() {
    const satelliteX = [];
    const satelliteY = [];
    const sentAtTimes = [];
    const receivedAtTimes = [];

    for (const id in satellites) {
        satelliteX.push(...satellites[id].x);
        satelliteY.push(...satellites[id].y);
        sentAtTimes.push(...satellites[id].sentAt);
        receivedAtTimes.push(...satellites[id].receivedAt);
    }

    if (satelliteX.length >= 3 && satelliteY.length >= 3) {
        const distances = sentAtTimes.map((sentAt, index) => {
            const receivedAt = receivedAtTimes[index];
            return speedOfLight * ((receivedAt - sentAt) / 1000); 
        });

        // Perform calculations as described in the image
        const A = 2 * (satelliteX[1] - satelliteX[0]);
        const B = 2 * (satelliteY[1] - satelliteY[0]);
        const C = Math.pow(distances[0], 2) - Math.pow(distances[1], 2) - Math.pow(satelliteX[0], 2) + Math.pow(satelliteX[1], 2) - Math.pow(satelliteY[0], 2) + Math.pow(satelliteY[1], 2);

        const D = 2 * (satelliteX[2] - satelliteX[1]);
        const E = 2 * (satelliteY[2] - satelliteY[1]);
        const F = Math.pow(distances[1], 2) - Math.pow(distances[2], 2) - Math.pow(satelliteX[1], 2) + Math.pow(satelliteX[2], 2) - Math.pow(satelliteY[1], 2) + Math.pow(satelliteY[2], 2);

        if ((D - A) === 0 || (B - D) === 0) {
            console.error('Ділення на нуль.');
            return;
        }

        const Xc = (C * E - F * B) / (E * A - B * D);
        const Yc = (C * D - A * F) / (B * D - A * E);

        trace1.x = satelliteX;
        trace1.y = satelliteY;
        trace2.x = [Xc];
        trace2.y = [Yc];

        console.log(satellites);
        console.log(`${trace1.x} and ${trace1.y}`);
        console.log(`${trace2.x} and ${trace2.y}`);
    }

    Plotly.restyle('plot', 'x', [trace1.x, trace2.x]);
    Plotly.restyle('plot', 'y', [trace1.y, trace2.y]);
}

const socket = new WebSocket('ws://localhost:4001');

socket.onopen = () => {
    console.log('Підключено до WebSocket сервера');
};

socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    processMessage(message);
};

socket.onclose = () => {
    console.log('З\'єднання закрито');
};

socket.onerror = (error) => {
    console.error('Помилка WebSocket:', error);
};

function updateGPSParameters(params) {
    fetch('http://localhost:4001/config', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Parameters updated:', data);
    })
    .catch(error => {
        console.error('Error updating parameters:', error);
    });
}

const params = {
    satelliteSpeed: 120,
    objectSpeed: 20
};

updateGPSParameters(params);