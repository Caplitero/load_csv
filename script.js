document.getElementById('csv_file').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const csvData = e.target.result;
            const rows = csvData.split('\n').map(row => row.split(','));
            const headers = rows[0]; // First row is headers
            
            // Generate checkboxes for each header for column selection
            const columnsContainer = document.getElementById('columns');
            columnsContainer.innerHTML = ''; // Clear previous checkboxes
            headers.forEach((header, index) => {
                const checkboxLabel = document.createElement('label');
                checkboxLabel.innerHTML = `<input type="checkbox" class="column-checkbox" value="${index}"> ${header}`;
                columnsContainer.appendChild(checkboxLabel);
                columnsContainer.appendChild(document.createElement('br'));
            });
            
            // Generate checkboxes for each header for image name selection
            const imageNameColumnsContainer = document.getElementById('image_name_columns');
            imageNameColumnsContainer.innerHTML = ''; // Clear previous checkboxes
            headers.forEach((header, index) => {
                const checkboxLabel = document.createElement('label');
                checkboxLabel.innerHTML = `<input type="checkbox" class="image-name-checkbox" value="${index}"> ${header}`;
                imageNameColumnsContainer.appendChild(checkboxLabel);
                imageNameColumnsContainer.appendChild(document.createElement('br'));
            });

            // Show CSV preview
            document.getElementById('csv_preview').innerText = `${file.name} loaded successfully!`;
        };
        reader.readAsText(file);
    }
});

document.getElementById('image_file').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        document.getElementById('image_preview').innerText = `${file.name} loaded successfully!`;
    }
});

document.getElementById('processButton').addEventListener('click', function() {
    const csvFileInput = document.getElementById('csv_file');
    const imageFileInput = document.getElementById('image_file');
    
    const selectedColumns = Array.from(document.querySelectorAll('.column-checkbox:checked'))
                                  .map(checkbox => checkbox.value);
    const selectedImageNameColumns = Array.from(document.querySelectorAll('.image-name-checkbox:checked'))
                                          .map(checkbox => checkbox.value);
    const delimiters = document.getElementById('delimiters').value.split(',').map(d => d.trim());
    const textXPosition = parseInt(document.getElementById('text_x_position').value, 10);
    const textYPosition = parseInt(document.getElementById('text_y_position').value, 10);

    if (!csvFileInput.files.length || !imageFileInput.files.length) {
        alert("Please upload both CSV and image files.");
        return;
    }

    const csvFile = csvFileInput.files[0];
    const imageFile = imageFileInput.files[0];

    const reader = new FileReader();
    reader.onload = function(event) {
        const csvData = event.target.result;
        processCSV(csvData, selectedColumns, selectedImageNameColumns, delimiters, imageFile, textXPosition, textYPosition);
    };

    reader.readAsText(csvFile);
});

// Function to process CSV and create images
function processCSV(csvData, selectedColumns, selectedImageNameColumns, delimiters, imageFile, textXPosition, textYPosition) {
    const rows = csvData.split('\n').map(row => row.split(','));

    const processedRows = rows.slice(1).map(row => {
        return selectedColumns.map(index => row[index]).join(' ');
    });

    // Create a zip file using JSZip
    const zip = new JSZip();

    const imageURL = URL.createObjectURL(imageFile);
    const img = new Image();
    img.src = imageURL;

    img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw the image on the canvas and add text
        processedRows.forEach((text, index) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous drawings
            ctx.drawImage(img, 0, 0); // Draw the image
            ctx.font = '30px Arial';
            ctx.fillStyle = 'black';
            ctx.fillText(text, textXPosition, textYPosition ); // Add text to the image

            // Use selected columns to generate the image name
            const imageName = selectedImageNameColumns.map(colIndex => rows[index + 1][colIndex]).join('_');
            const imgData = canvas.toDataURL('image/png');

            // Add the image to the zip file
            zip.file(`${imageName}.png`, imgData.split(',')[1], { base64: true });
        });

        // Generate the zip file and trigger a download
        zip.generateAsync({ type: 'blob' }).then(function(content) {
            const zipLink = document.createElement('a');
            zipLink.href = URL.createObjectURL(content);
            zipLink.download = `generated_images.zip`;
            zipLink.click(); // Trigger the download
        });
    };
}

document.getElementById('image_file').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('image_preview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // Display the image in the preview container
            preview.innerHTML = `<img src="${e.target.result}" alt="Image Preview" style="width: 100%;">`;
        };
        reader.readAsDataURL(file);
    }
});
