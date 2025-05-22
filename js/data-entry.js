// Data Entry module for RTA Dashboard

// Initialize data entry form
function initDataEntryForm() {
    if (!app.data) return;
    
    // Set up form validation
    setupFormValidation();
    
    // Set up dynamic field relationships
    setupDynamicFields();
    
    // Initialize event listeners
    setupFormEventListeners();
}

// Set up form validation rules
function setupFormValidation() {
    // Form validation rules
    const form = document.getElementById('rtaForm');
    
    form.addEventListener('submit', function(event) {
        if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
            
            // Add validation styling
            form.classList.add('was-validated');
            
            // Show validation message
            showAlert('Please correct the errors in the form before submitting.', 'warning');
        } else {
            // Clear validation styling for next use
            form.classList.remove('was-validated');
        }
    });
    
    // Custom validation for rent amount
    const contractRentInput = document.getElementById('contractRent');
    contractRentInput.addEventListener('input', function() {
        const value = parseFloat(this.value);
        
        if (value < 0) {
            this.setCustomValidity('Rent amount cannot be negative');
        } else if (value > 5000) {
            this.setCustomValidity('Rent amount seems unusually high. Please verify.');
        } else {
            this.setCustomValidity('');
        }
    });
    
    // Custom validation for security deposit
    const securityDepositInput = document.getElementById('securityDeposit');
    securityDepositInput.addEventListener('input', function() {
        const value = parseFloat(this.value);
        const rentValue = parseFloat(contractRentInput.value);
        
        if (value < 0) {
            this.setCustomValidity('Security deposit cannot be negative');
        } else if (rentValue && value > rentValue * 2) {
            this.setCustomValidity('Security deposit exceeds twice the monthly rent, which is unusual.');
        } else {
            this.setCustomValidity('');
        }
    });
    
    // Date validation for inspection date
    const inspectionDateInput = document.getElementById('inspectionDate');
    const receiveDateInput = document.getElementById('receiveDate');
    const assignDateInput = document.getElementById('assignDate');
    
    inspectionDateInput.addEventListener('change', function() {
        const inspectionDate = new Date(this.value);
        const receiveDate = new Date(receiveDateInput.value);
        const assignDate = new Date(assignDateInput.value);
        
        if (receiveDate && inspectionDate < receiveDate) {
            this.setCustomValidity('Inspection date cannot be before RTA received date');
        } else if (assignDate && inspectionDate < assignDate) {
            this.setCustomValidity('Inspection date cannot be before assignment date');
        } else {
            this.setCustomValidity('');
        }
    });
    
    // Date validation for assignment date
    assignDateInput.addEventListener('change', function() {
        const assignDate = new Date(this.value);
        const receiveDate = new Date(receiveDateInput.value);
        
        if (receiveDate && assignDate < receiveDate) {
            this.setCustomValidity('Assignment date cannot be before RTA received date');
        } else {
            this.setCustomValidity('');
            
            // Revalidate inspection date if it exists
            if (inspectionDateInput.value) {
                const inspectionDate = new Date(inspectionDateInput.value);
                if (inspectionDate < assignDate) {
                    inspectionDateInput.setCustomValidity('Inspection date cannot be before assignment date');
                } else {
                    inspectionDateInput.setCustomValidity('');
                }
            }
        }
    });
}

// Set up dynamic field relationships
function setupDynamicFields() {
    // Make inspector selection required when inspection date is set
    const inspectionDateInput = document.getElementById('inspectionDate');
    const inspectorSelect = document.getElementById('inspector');
    
    inspectionDateInput.addEventListener('change', function() {
        if (this.value) {
            inspectorSelect.setAttribute('required', 'required');
        } else {
            inspectorSelect.removeAttribute('required');
        }
    });
    
    // Make inspection result required when inspection date is set
    const inspectionResultSelect = document.getElementById('inspectionResult');
    
    inspectionDateInput.addEventListener('change', function() {
        if (this.value) {
            inspectionResultSelect.setAttribute('required', 'required');
        } else {
            inspectionResultSelect.removeAttribute('required');
        }
    });
    
    // Auto-calculate typical security deposit (1 month rent)
    const contractRentInput = document.getElementById('contractRent');
    const securityDepositInput = document.getElementById('securityDeposit');
    
    contractRentInput.addEventListener('change', function() {
        if (this.value && !securityDepositInput.value) {
            securityDepositInput.value = this.value;
        }
    });
}

// Set up form event listeners
function setupFormEventListeners() {
    // Reset form button
    document.getElementById('resetForm').addEventListener('click', function() {
        document.getElementById('rtaForm').reset();
        document.getElementById('rtaForm').classList.remove('was-validated');
    });
    
    // Set today's date as default for receive date
    const receiveDateInput = document.getElementById('receiveDate');
    if (!receiveDateInput.value) {
        receiveDateInput.value = new Date().toISOString().slice(0, 10);
    }
    
    // Autofill city based on first 3 digits of zip code (simulated functionality)
    // In a real implementation, this would use an address/zip code API
    const propertyAddressInput = document.getElementById('propertyAddress');
    const cityCodeSelect = document.getElementById('cityCode');
    
    propertyAddressInput.addEventListener('blur', function() {
        // Simple simulation - not actual functionality
        // In a real app, this would extract zip from address and look up city
        const address = this.value.trim();
        if (address && address.length > 10 && cityCodeSelect.value === '') {
            // Get a random city code from the list as a simulation
            const cityOptions = cityCodeSelect.options;
            if (cityOptions.length > 1) {
                const randomIndex = Math.floor(Math.random() * (cityOptions.length - 1)) + 1;
                cityCodeSelect.selectedIndex = randomIndex;
            }
        }
    });
}

// Populate form with data from record for editing
function populateFormWithRecord(record) {
    if (!record) return;
    
    // Personal Info
    document.getElementById('firstName').value = record['First Name'] || '';
    document.getElementById('lastName').value = record['Last Name'] || '';
    document.getElementById('miType').value = record['Type of MI'] || '';
    
    // Program Info
    document.getElementById('programCode').value = record['Program code'] || '';
    document.getElementById('receiveDate').value = formatDateForInput(record['Date RTA Received by HACSCM']);
    document.getElementById('assignDate').value = formatDateForInput(record['Date RTA Assigned to Inspector']);
    
    // Property Info
    document.getElementById('propertyAddress').value = record['Property Address'] || '';
    document.getElementById('cityCode').value = record['City Code'] || '';
    document.getElementById('brSize').value = record['BR Size'] || '';
    
    // Rent Info
    document.getElementById('contractRent').value = record['Proposed Contract Rent'] || '';
    document.getElementById('securityDeposit').value = record['Security Deposit Amount'] || '';
    document.getElementById('landlordName').value = record['Landlord name'] || '';
    
    // Inspection Info
    document.getElementById('inspector').value = record['Inspector'] || '';
    document.getElementById('inspectionDate').value = formatDateForInput(record['Date Inspected']);
    document.getElementById('inspectionResult').value = record['Initial Inspection Result'] || '';
    
    // Scroll to form
    document.getElementById('data-entry').scrollIntoView({ behavior: 'smooth' });
}

// Save edited form data
function saveEditedFormData(originalRecord) {
    // Get form values
    const updatedRecord = {
        ...originalRecord,
        'First Name': document.getElementById('firstName').value,
        'Last Name': document.getElementById('lastName').value,
        'Type of MI': document.getElementById('miType').value,
        'Program code': document.getElementById('programCode').value,
        'Date RTA Received by HACSCM': document.getElementById('receiveDate').value,
        'Date RTA Assigned to Inspector': document.getElementById('assignDate').value,
        'Property Address': document.getElementById('propertyAddress').value,
        'City Code': document.getElementById('cityCode').value,
        'BR Size': document.getElementById('brSize').value,
        'Proposed Contract Rent': document.getElementById('contractRent').value,
        'Security Deposit Amount': document.getElementById('securityDeposit').value,
        'Landlord name': document.getElementById('landlordName').value,
        'Inspector': document.getElementById('inspector').value,
        'Date Inspected': document.getElementById('inspectionDate').value,
        'Initial Inspection Result': document.getElementById('inspectionResult').value
    };
    
    // In a real app, this would send the update to a server
    // For this demo, we'll update the record in the data array
    
    // Find the record index
    const index = app.data.main_data.findIndex(record => 
        record['First Name'] === originalRecord['First Name'] &&
        record['Last Name'] === originalRecord['Last Name'] &&
        record['Date RTA Received by HACSCM'] === originalRecord['Date RTA Received by HACSCM']
    );
    
    if (index !== -1) {
        app.data.main_data[index] = updatedRecord;
        
        // Update filtered data if needed
        const filteredIndex = app.filteredData.findIndex(record => 
            record['First Name'] === originalRecord['First Name'] &&
            record['Last Name'] === originalRecord['Last Name'] &&
            record['Date RTA Received by HACSCM'] === originalRecord['Date RTA Received by HACSCM']
        );
        
        if (filteredIndex !== -1) {
            app.filteredData[filteredIndex] = updatedRecord;
        }
        
        // Update UI
        updateDashboard();
        updateCharts();
        populateDataTable();
        
        // Reset form
        document.getElementById('rtaForm').reset();
        
        // Show success message
        showAlert('Record updated successfully!', 'success');
    } else {
        showAlert('Error updating record. Please try again.', 'danger');
    }
}

// Format date for input fields (YYYY-MM-DD)
function formatDateForInput(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    return date.toISOString().split('T')[0];
}