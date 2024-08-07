function editDevotion(rowId) {
    // Retrieve data from the table row
    let table = document.getElementById('devotionsTable');
    let row = table.rows[rowId]; // Adjust index if needed

    let devotionName = row.cells[0].innerText;
    let devotionType = row.cells[1].innerText;
    let devotionTiming = row.cells[1].innerText;

    // Display edit form and populate with current data
    document.getElementById('editName').value = devotionName;
    document.getElementById('editType').value = devotionType;
    document.getElementById('editTiming').value = devotionType;
    document.getElementById('editForm').style.display = 'block';

    // Optional: You can also hide the edit button or other actions
    // row.cells[2].innerHTML = ''; // Uncomment to hide the Edit button
}

// Optional: Submit handler for saving changes
document.getElementById('editForm').addEventListener('submit', function(event) {
    event.preventDefault();
    // Perform AJAX request or form submission to update data
    // Example: Update data using fetch API
    let formData = new FormData(this);
    fetch('/update-devotion', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Updated:', data);
        // Optional: Update table row with new data
        // Update row.cells[0].innerText = data.devotionName;
        // Update row.cells[1].innerText = data.devotionType;
        // Hide edit form after successful update
        document.getElementById('editForm').style.display = 'none';
    })
    .catch(error => console.error('Error updating:', error));
});