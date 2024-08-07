document.getElementById('searchForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    const devotionName = document.getElementById('devotion_name').value;
    const devotionType = document.getElementById('devotion_type').value;
    const devotionTiming = document.getElementById('devotion_timing').value;

    let params = {};

    if (devotionName) params.devotion_name = devotionName;
    if (devotionType) params.devotion_type = devotionType;
    if (devotionTiming) params.devotion_timing = devotionTiming;

    // Construct URL with query parameters based on filled fields
    const url = `/search?${new URLSearchParams(params).toString()}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayResults(data); // Function to display search results
        })
        .catch(error => console.error('Error searching:', error));
});

function displayResults(results) {
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = ''; // Clear previous results

    if (results.length === 0) {
        searchResults.innerHTML = 'No results found.';
        return;
    }

    const resultList = document.createElement('ul');
    results.forEach(result => {
        const listItem = document.createElement('li');
        listItem.textContent = `${result.devotion_name} - ${result.devotion_type} - ${result.devotion_timing}`;
        resultList.appendChild(listItem);
    });

    searchResults.appendChild(resultList);
}

function fetchDevotions() {
    fetch('/devotions')
        .then(response => response.json())
        .then(data => {
            renderDevotions(data); // Call function to render devotions
        })
        .catch(error => console.error('Error fetching data:', error));
}

// Function to render devotions in HTML
function renderDevotions(devotions) {
    const container = document.getElementById('devotions-container');
    container.innerHTML = ''; // Clear previous content

    devotions.forEach(devotion => {
        const devotionElement = document.createElement('div');
        devotionElement.classList.add('devotion');
        
        devotionElement.innerHTML = `
            <h3>${devotion.devotion_name}</h3>
            <p>Type: ${devotion.devotion_type}</p>
            <p>${devotion.devotion_description}</p>
        `;
        
        container.appendChild(devotionElement);
    });
}

// Fetch devotions when the page loads
fetchDevotions();