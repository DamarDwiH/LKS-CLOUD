document.addEventListener('DOMContentLoaded', (event) => {
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            document.getElementById('ipAddress').innerText = data.ip;
        })
        .catch(error => {
            console.error('Error fetching IP address:', error);
            document.getElementById('ipAddress').innerText = 'Unable to fetch IP address';
        });
});

document.getElementById('apiForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const apiUrl = document.getElementById('apiUrlInput').value;
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Data received from API:', data); // Log the received data
            if (data.body) {
                data = JSON.parse(data.body); // Parse the body to get the array
            }
            if (Array.isArray(data)) {
                createCharts(data);
            } else {
                throw new Error('Received data is not an array');
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            alert('Error fetching data: ' + error.message);
        });
});

function createCharts(data) {
    const labels = data.map(item => new Date(item.timestamp).toLocaleString());
    const fields = ["gas_concentration", "distance", "humidity", "fire_intensity", "temperature", "wind_speed"];
    const chartsContainer = document.getElementById('chartsContainer');

    chartsContainer.innerHTML = ''; // Clear existing charts

    fields.forEach((field, index) => {
        const chartType = getChartType(field);
        const chartContainer = document.createElement('div');
        chartContainer.id = `chart-container-${field}`;
        chartContainer.style.width = '100%';
        chartContainer.style.height = chartType === 'gauge' ? '200px' : '300px'; // Adjust height for gauge
        chartContainer.style.marginBottom = '20px'; // Add space between charts
        chartsContainer.appendChild(chartContainer);

        if (chartType === 'gauge') {
            const value = parseFloat(data[data.length - 1][field]);
            new JustGage({
                id: chartContainer.id,
                value: value,
                min: 0,
                max: 100,
                title: field,
                height: 200, // Set the gauge height
                width: 200 // Set the gauge width
            });
        } else {
            const canvas = document.createElement('canvas');
            canvas.id = `chart-${field}`;
            chartContainer.appendChild(canvas);

            const ctx = canvas.getContext('2d');
            new Chart(ctx, {
                type: chartType,
                data: {
                    labels: labels,
                    datasets: [{
                        label: field,
                        data: data.map(item => parseFloat(item[field])),
                        borderColor: `hsl(${index * 60}, 70%, 50%)`,
                        backgroundColor: chartType === 'bar' ? `hsla(${index * 60}, 70%, 50%, 0.5)` : `hsl(${index * 60}, 70%, 50%)`,
                        fill: chartType !== 'line'
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: { display: true, title: { display: true, text: 'Timestamp' } },
                        y: { display: true, title: { display: true, text: 'Values' } }
                    }
                }
            });
        }
    });
}

function getChartType(field) {
    switch (field) {
        case 'gas_concentration':
            return 'line';
        case 'distance':
            return 'bar';
        case 'fire_intensity':
            return 'pie';
        case 'temperature':
            return 'gauge';
        case 'humidity':
            return 'doughnut';
        case 'wind_speed':
            return 'line';
        default:
            return 'line';
    }
}
