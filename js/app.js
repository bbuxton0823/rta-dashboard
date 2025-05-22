// Main application JavaScript file for RTA Dashboard

// Global application state
const app = {
    data: null,
    filteredData: null,
    filters: {
        dateRange: null,
        programs: [],
        inspectors: [],
        cities: [],
        statuses: []
    },
    pagination: {
        currentPage: 1,
        itemsPerPage: 10,
        totalPages: 1
    }
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're running in a browser that doesn't support Chart.js
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded. Please check your network connection.');
        showAlert('Error loading charting library. Please check your network connection.', 'danger');
        return;
    }
    
    // Load real data first
    loadDataOrUseDummy();
    
    // Initialize date range picker
    initDateRangePicker();
    
    // Initialize event listeners
    initEventListeners();
});

// Load data from JSON file or use dummy data
function loadDataOrUseDummy() {
    fetch('./rta_data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('✅ Real data loaded successfully! Records:', data.main_data.length);
            console.log('First record:', data.main_data[0]);
            app.data = data;
            app.filteredData = [...data.main_data];
            
            // Initialize filters
            populateFilterDropdowns();
            
            // Initialize dashboard
            updateDashboard();
            
            // Initialize charts with real data
            initCharts();
            
            // Populate data table
            populateDataTable();
            
            // Populate form dropdowns
            populateFormDropdowns();
        })
        .catch(error => {
            console.error('❌ Error loading real data:', error);
            showAlert('Using sample data for demonstration. Real data could not be loaded.', 'warning');
            
            // Use dummy data
            useDummyData();
        });
}

// Use dummy data when JSON loading fails
function useDummyData() {
    console.log('⚠️ Falling back to dummy data');
    
    // Create sample data structure
    const dummyData = {
        main_data: generateDummyRecords(200),
        lookup_values: {
            'miType': ['Initial', 'Reloc'],
            'prog code': ['mtw_ss', 'vou_oth', 'pb_alm', 'pb_colm', 'pb_edge', 'pb_hill'],
            'cityCode': ['AT', 'BL', 'BR', 'BU', 'CL', 'DC', 'EG', 'EP', 'FC', 'HL'],
            'brSize': ['0', '1', '2', '3', '4', '5', '6', 'Shared'],
            'insp': ['Bycha', 'Ed', 'Patricia', 'Kevin', 'Daisia', 'Jacqueline']
        },
        columns: ['First Name', 'Last Name', 'Program code', 'Type of MI', 'Date RTA Received by HACSCM', 
                 'Date RTA Assigned to Inspector', 'Inspector', 'Date Inspected', 'Initial Inspection Result', 
                 'Property Address', 'City Code', 'BR Size', 'Proposed Contract Rent', 'Security Deposit Amount',
                 'Date RTA Approved', 'RTA Denial Reason'],
        sheet_names: ['Current', 'History', 'Lookup']
    };
    
    app.data = dummyData;
    app.filteredData = [...dummyData.main_data];
    
    // Initialize filters
    populateFilterDropdowns();
    
    // Initialize dashboard
    updateDashboard();
    
    // Initialize charts
    initCharts();
    
    // Populate data table
    populateDataTable();
    
    // Populate form dropdowns
    populateFormDropdowns();
}

// Generate dummy records for demonstration
function generateDummyRecords(count) {
    const records = [];
    const programs = ['mtw_ss', 'vou_oth', 'pb_alm', 'pb_colm', 'pb_edge', 'pb_hill'];
    const cities = ['AT', 'BL', 'BR', 'BU', 'CL', 'DC', 'EG', 'EP', 'FC', 'HL'];
    const inspectors = ['Bycha', 'Ed', 'Patricia', 'Kevin', 'Daisia', 'Jacqueline'];
    const brSizes = ['0', '1', '2', '3', '4', '5', '6', 'Shared'];
    const miTypes = ['Initial', 'Reloc'];
    const inspectionResults = ['Pass', 'Fail', 'Canceled'];
    const denialReasons = ['', '', '', '', 'Failed inspection', 'Rent too high', 'Landlord withdrew'];
    
    // Generate random dates within the last year
    function randomDate(start, end) {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }
    
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    for (let i = 0; i < count; i++) {
        // Random base properties
        const firstName = `FirstName${i}`;
        const lastName = `LastName${i}`;
        const program = programs[Math.floor(Math.random() * programs.length)];
        const miType = miTypes[Math.floor(Math.random() * miTypes.length)];
        const cityCode = cities[Math.floor(Math.random() * cities.length)];
        const brSize = brSizes[Math.floor(Math.random() * brSizes.length)];
        const rent = Math.floor(Math.random() * 2000) + 500;
        const securityDeposit = rent;
        const propertyAddress = `${1000 + i} Test Street, City, State 12345`;
        
        // Random dates and process flow
        const receiveDate = randomDate(oneYearAgo, today);
        
        // 80% of records have been assigned to an inspector
        const hasAssignment = Math.random() < 0.8;
        const assignDate = hasAssignment ? randomDate(receiveDate, new Date(receiveDate.getTime() + 14 * 24 * 60 * 60 * 1000)) : null;
        const inspector = hasAssignment ? inspectors[Math.floor(Math.random() * inspectors.length)] : '';
        
        // 70% of assigned have been inspected
        const hasInspection = hasAssignment && Math.random() < 0.7;
        const inspectDate = hasInspection ? randomDate(assignDate, new Date(assignDate.getTime() + 14 * 24 * 60 * 60 * 1000)) : null;
        const inspectionResult = hasInspection ? inspectionResults[Math.floor(Math.random() * inspectionResults.length)] : '';
        
        // 90% of passed inspections are approved, 10% of failed are approved after fixes
        const isPassed = hasInspection && inspectionResult === 'Pass';
        const isFailed = hasInspection && inspectionResult === 'Fail';
        const isApproved = (isPassed && Math.random() < 0.9) || (isFailed && Math.random() < 0.1);
        const isDenied = (isFailed && Math.random() < 0.7) || (Math.random() < 0.05);
        
        const approveDate = isApproved ? randomDate(inspectDate || assignDate, new Date((inspectDate || assignDate).getTime() + 30 * 24 * 60 * 60 * 1000)) : null;
        const denialReason = isDenied ? denialReasons[Math.floor(Math.random() * denialReasons.length)] : '';
        
        // Process metrics
        const daysToAssignment = hasAssignment ? Math.round((assignDate - receiveDate) / (24 * 60 * 60 * 1000)) : null;
        const daysToInspection = hasInspection ? Math.round((inspectDate - assignDate) / (24 * 60 * 60 * 1000)) : null;
        const daysToApproval = isApproved ? Math.round((approveDate - assignDate) / (24 * 60 * 60 * 1000)) : null;
        
        records.push({
            'First Name': firstName,
            'Last Name': lastName,
            'Program code': program,
            'Type of MI': miType,
            'Date RTA Received by HACSCM': receiveDate.toISOString().split('T')[0],
            'Date RTA Assigned to Inspector': hasAssignment ? assignDate.toISOString().split('T')[0] : '',
            'Inspector': inspector,
            'Date Inspected': hasInspection ? inspectDate.toISOString().split('T')[0] : '',
            'Initial Inspection Result': inspectionResult,
            'ReCheck Date': '',
            'ReCheck Result': '',
            'Property Address': propertyAddress,
            'City Code': cityCode,
            'BR Size': brSize,
            'Proposed Contract Rent': rent,
            'Security Deposit Amount': securityDeposit,
            'Landlord name': `Landlord ${i}`,
            'Landlord phone': `(555) 555-${1000 + i}`,
            'Date RTA Approved': isApproved ? approveDate.toISOString().split('T')[0] : '',
            'Approved Contract Rent': isApproved ? rent : '',
            'Date to Fiscal': isApproved ? randomDate(approveDate, new Date(approveDate.getTime() + 7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0] : '',
            'RTA Denial Reason': denialReason,
            'Notes': '',
            'Rent Reasonableness Date': isApproved ? randomDate(inspectDate || assignDate, approveDate).toISOString().split('T')[0] : '',
            'Number of Days From Receipt to Caseworker Assignment': daysToAssignment,
            'Number of Days from Caseworker Assignment to Inspection': daysToInspection,
            'Number of Days from Caseworker Assignment to Rent Reasonableness': isApproved ? Math.floor(daysToApproval * 0.7) : null,
            'Number of Days from Caseworker Assignment to RTA Approval/Denial': daysToApproval
        });
    }
    
    return records;
}

// Initialize charts with dummy data for initial display
function initChartsWithDummyData() {
    // Process Timeline Chart
    const processTimelineCtx = document.getElementById('processTimelineChart');
    if (processTimelineCtx) {
        new Chart(processTimelineCtx, {
            type: 'bar',
            data: {
                labels: ['Receipt to Assignment', 'Assignment to Inspection', 'Inspection to Rent Determination', 'Determination to Approval/Denial'],
                datasets: [{
                    label: 'Average Days',
                    data: [3, 5, 7, 5],
                    backgroundColor: '#0d6efd',
                    borderWidth: 0
                },
                {
                    label: 'Benchmark',
                    data: [3, 5, 7, 10],
                    backgroundColor: 'rgba(0,0,0,0)',
                    borderColor: '#dc3545',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    type: 'line'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Days'
                        }
                    }
                }
            }
        });
    }
    
    // Status Chart
    const statusCtx = document.getElementById('statusChart');
    if (statusCtx) {
        new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: ['Approved', 'Denied', 'Pending'],
                datasets: [{
                    data: [48, 12, 40],
                    backgroundColor: ['#198754', '#dc3545', '#ffc107'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%'
            }
        });
    }
    
    // Inspection Chart
    const inspectionCtx = document.getElementById('inspectionChart');
    if (inspectionCtx) {
        new Chart(inspectionCtx, {
            type: 'doughnut',
            data: {
                labels: ['Pass', 'Fail', 'Canceled', 'Not Inspected'],
                datasets: [{
                    data: [45, 15, 5, 35],
                    backgroundColor: ['#198754', '#dc3545', '#6c757d', '#f8f9fa'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%'
            }
        });
    }
    
    // Program Chart
    const programCtx = document.getElementById('programChart');
    if (programCtx) {
        new Chart(programCtx, {
            type: 'bar',
            data: {
                labels: ['mtw_ss', 'vou_oth', 'pb_alm', 'pb_colm', 'pb_edge', 'pb_hill'],
                datasets: [
                    {
                        label: 'Approved',
                        data: [28, 22, 15, 12, 10, 8],
                        backgroundColor: '#198754'
                    },
                    {
                        label: 'Denied',
                        data: [5, 4, 3, 3, 2, 2],
                        backgroundColor: '#dc3545'
                    },
                    {
                        label: 'Pending',
                        data: [15, 12, 10, 8, 6, 5],
                        backgroundColor: '#ffc107'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: true
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    // City Chart
    const cityCtx = document.getElementById('cityChart');
    if (cityCtx) {
        new Chart(cityCtx, {
            type: 'bar',
            data: {
                labels: ['AT', 'BL', 'BR', 'BU', 'CL', 'DC', 'EG', 'EP', 'FC', 'HL'],
                datasets: [{
                    label: 'Applications',
                    data: [45, 38, 32, 28, 25, 22, 18, 15, 12, 10],
                    backgroundColor: '#0d6efd',
                    borderWidth: 0
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    // Sparkline for Total Applications
    const totalSparklineCtx = document.getElementById('totalSparkline');
    if (totalSparklineCtx) {
        const data = Array(30).fill(0).map((_, i) => 900 + Math.random() * 300);
        new Chart(totalSparklineCtx, {
            type: 'line',
            data: {
                labels: Array(30).fill(''),
                datasets: [{
                    data: data,
                    borderColor: '#0d6efd',
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: {
                        target: 'origin',
                        above: 'rgba(13, 110, 253, 0.1)'
                    },
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                },
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        display: false
                    }
                }
            }
        });
    }
    
    // Sparkline for Approval Rate
    const approvalRateSparklineCtx = document.getElementById('approvalRateSparkline');
    if (approvalRateSparklineCtx) {
        const data = Array(30).fill(0).map(() => 40 + Math.random() * 20);
        new Chart(approvalRateSparklineCtx, {
            type: 'line',
            data: {
                labels: Array(30).fill(''),
                datasets: [{
                    data: data,
                    borderColor: '#198754',
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: {
                        target: 'origin',
                        above: 'rgba(25, 135, 84, 0.1)'
                    },
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                },
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        display: false
                    }
                }
            }
        });
    }
    
    // Sparkline for Processing Days
    const processingDaysSparklineCtx = document.getElementById('processingDaysSparkline');
    if (processingDaysSparklineCtx) {
        const data = Array(30).fill(0).map(() => 20 + Math.random() * 10);
        new Chart(processingDaysSparklineCtx, {
            type: 'line',
            data: {
                labels: Array(30).fill(''),
                datasets: [{
                    data: data,
                    borderColor: '#0dcaf0',
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: {
                        target: 'origin',
                        above: 'rgba(13, 202, 240, 0.1)'
                    },
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                },
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        display: false
                    }
                }
            }
        });
    }
    
    // Sparkline for Pending Inspections
    const pendingSparklineCtx = document.getElementById('pendingSparkline');
    if (pendingSparklineCtx) {
        const data = Array(30).fill(0).map(() => 300 + Math.random() * 150);
        new Chart(pendingSparklineCtx, {
            type: 'line',
            data: {
                labels: Array(30).fill(''),
                datasets: [{
                    data: data,
                    borderColor: '#ffc107',
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: {
                        target: 'origin',
                        above: 'rgba(255, 193, 7, 0.1)'
                    },
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                },
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        display: false
                    }
                }
            }
        });
    }
}

// Initialize date range picker
function initDateRangePicker() {
    $('#dateRange').daterangepicker({
        startDate: moment().subtract(30, 'days'),
        endDate: moment(),
        ranges: {
           'Today': [moment(), moment()],
           'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
           'Last 7 Days': [moment().subtract(6, 'days'), moment()],
           'Last 30 Days': [moment().subtract(29, 'days'), moment()],
           'This Month': [moment().startOf('month'), moment().endOf('month')],
           'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
    }, function(start, end) {
        app.filters.dateRange = {
            start: start.format('YYYY-MM-DD'),
            end: end.format('YYYY-MM-DD')
        };
        applyFilters();
    });
}

// Initialize event listeners
function initEventListeners() {
    // Filter change events
    document.getElementById('programFilter').addEventListener('change', function() {
        app.filters.programs = Array.from(this.selectedOptions).map(option => option.value);
        applyFilters();
    });
    
    document.getElementById('inspectorFilter').addEventListener('change', function() {
        app.filters.inspectors = Array.from(this.selectedOptions).map(option => option.value);
        applyFilters();
    });
    
    document.getElementById('cityFilter').addEventListener('change', function() {
        app.filters.cities = Array.from(this.selectedOptions).map(option => option.value);
        applyFilters();
    });
    
    document.getElementById('statusFilter').addEventListener('change', function() {
        app.filters.statuses = Array.from(this.selectedOptions).map(option => option.value);
        applyFilters();
    });
    
    // Reset filters button
    document.getElementById('resetFilters').addEventListener('click', resetFilters);
    
    // Form submission
    document.getElementById('rtaForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveFormData();
    });
    
    // Reset form button
    document.getElementById('resetForm').addEventListener('click', function() {
        document.getElementById('rtaForm').reset();
    });
    
    // Search functionality
    document.getElementById('searchButton').addEventListener('click', function() {
        const searchTerm = document.getElementById('searchRecords').value.trim().toLowerCase();
        if (searchTerm) {
            searchRecords(searchTerm);
        } else {
            applyFilters(); // Reset to filtered view without search
        }
    });
    
    // Navigation smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
}

// Populate filter dropdowns
function populateFilterDropdowns() {
    if (!app.data) return;
    
    // Program filter
    const programFilter = document.getElementById('programFilter');
    programFilter.innerHTML = ''; // Clear any existing options
    const programs = app.data.lookup_values['prog code'] || [];
    programs.forEach(program => {
        const option = document.createElement('option');
        option.value = program;
        option.textContent = program;
        programFilter.appendChild(option);
    });
    
    // Inspector filter
    const inspectorFilter = document.getElementById('inspectorFilter');
    inspectorFilter.innerHTML = ''; // Clear any existing options
    const inspectors = app.data.lookup_values['insp'] || [];
    inspectors.forEach(inspector => {
        const option = document.createElement('option');
        option.value = inspector;
        option.textContent = inspector;
        inspectorFilter.appendChild(option);
    });
    
    // City filter
    const cityFilter = document.getElementById('cityFilter');
    cityFilter.innerHTML = ''; // Clear any existing options
    const cities = app.data.lookup_values['cityCode'] || [];
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        cityFilter.appendChild(option);
    });
}

// Apply filters to data
function applyFilters() {
    if (!app.data) return;
    
    app.filteredData = app.data.main_data.filter(record => {
        // Date filter
        if (app.filters.dateRange) {
            const recordDate = record['Date RTA Received by HACSCM'];
            if (recordDate) {
                const date = new Date(recordDate);
                const startDate = new Date(app.filters.dateRange.start);
                const endDate = new Date(app.filters.dateRange.end);
                
                if (date < startDate || date > endDate) {
                    return false;
                }
            }
        }
        
        // Program filter
        if (app.filters.programs.length > 0) {
            if (!app.filters.programs.includes(record['Program code'])) {
                return false;
            }
        }
        
        // Inspector filter
        if (app.filters.inspectors.length > 0) {
            if (!app.filters.inspectors.includes(record['Inspector'])) {
                return false;
            }
        }
        
        // City filter
        if (app.filters.cities.length > 0) {
            if (!app.filters.cities.includes(record['City Code'])) {
                return false;
            }
        }
        
        // Status filter
        if (app.filters.statuses.length > 0) {
            let recordStatus = '';
            
            if (record['Date RTA Approved']) {
                recordStatus = 'approved';
            } else if (record['RTA Denial Reason']) {
                recordStatus = 'denied';
            } else {
                recordStatus = 'pending';
            }
            
            if (!app.filters.statuses.includes(recordStatus)) {
                return false;
            }
        }
        
        return true;
    });
    
    // Reset pagination
    app.pagination.currentPage = 1;
    
    // Update UI
    updateDashboard();
    updateCharts();
    populateDataTable();
}

// Reset all filters
function resetFilters() {
    // Reset date range picker
    $('#dateRange').data('daterangepicker').setStartDate(moment().subtract(30, 'days'));
    $('#dateRange').data('daterangepicker').setEndDate(moment());
    app.filters.dateRange = null;
    
    // Reset dropdown selections
    document.getElementById('programFilter').selectedIndex = -1;
    document.getElementById('inspectorFilter').selectedIndex = -1;
    document.getElementById('cityFilter').selectedIndex = -1;
    document.getElementById('statusFilter').selectedIndex = -1;
    
    // Reset filter arrays
    app.filters.programs = [];
    app.filters.inspectors = [];
    app.filters.cities = [];
    app.filters.statuses = [];
    
    // Reset search box
    document.getElementById('searchRecords').value = '';
    
    // Apply reset (show all data)
    app.filteredData = app.data ? [...app.data.main_data] : [];
    updateDashboard();
    updateCharts();
    populateDataTable();
}

// Update dashboard with current data
function updateDashboard() {
    if (!app.filteredData) return;
    
    // Update total applications count
    document.getElementById('totalApplications').textContent = app.filteredData.length;
    
    // Calculate approval rate
    const approvedCount = app.filteredData.filter(record => record['Date RTA Approved']).length;
    const approvalRate = app.filteredData.length > 0 ? Math.round((approvedCount / app.filteredData.length) * 100) : 0;
    document.getElementById('approvalRate').textContent = approvalRate + '%';
    
    // Calculate average processing days
    let totalDays = 0;
    let countWithDays = 0;
    
    app.filteredData.forEach(record => {
        const receiveDate = new Date(record['Date RTA Received by HACSCM']);
        let endDate;
        
        if (record['Date RTA Approved']) {
            endDate = new Date(record['Date RTA Approved']);
        } else if (record['RTA Denial Reason']) {
            // Use the Date to Fiscal as end date for denied applications, if available
            endDate = record['Date to Fiscal'] ? new Date(record['Date to Fiscal']) : null;
        }
        
        if (receiveDate && endDate && !isNaN(receiveDate) && !isNaN(endDate)) {
            const days = Math.round((endDate - receiveDate) / (1000 * 60 * 60 * 24));
            if (days >= 0 && days < 1000) { // Sanity check to exclude outliers
                totalDays += days;
                countWithDays++;
            }
        }
    });
    
    const avgDays = countWithDays > 0 ? Math.round(totalDays / countWithDays) : 0;
    document.getElementById('avgProcessingDays').textContent = avgDays;
    
    // Calculate pending inspections
    const pendingInspectionCount = app.filteredData.filter(record => 
        record['Inspector'] && 
        !record['Date Inspected'] && 
        !record['Date RTA Approved'] && 
        !record['RTA Denial Reason']
    ).length;
    
    document.getElementById('pendingInspections').textContent = pendingInspectionCount;
}

// Search records by term
function searchRecords(term) {
    if (!app.data) return;
    
    app.filteredData = app.data.main_data.filter(record => {
        // Check for matches in key fields
        return (
            (record['First Name'] && String(record['First Name']).toLowerCase().includes(term)) ||
            (record['Last Name'] && String(record['Last Name']).toLowerCase().includes(term)) ||
            (record['Property Address'] && String(record['Property Address']).toLowerCase().includes(term)) ||
            (record['City Code'] && String(record['City Code']).toLowerCase().includes(term)) ||
            (record['Program code'] && String(record['Program code']).toLowerCase().includes(term)) ||
            (record['Landlord name'] && String(record['Landlord name']).toLowerCase().includes(term))
        );
    });
    
    // Reset pagination
    app.pagination.currentPage = 1;
    
    // Update UI
    updateDashboard();
    updateCharts();
    populateDataTable();
}

// Populate data table with filtered records
function populateDataTable() {
    if (!app.filteredData) return;
    
    const tableBody = document.querySelector('#rtaTable tbody');
    tableBody.innerHTML = '';
    
    // Calculate pagination
    const totalRecords = app.filteredData.length;
    app.pagination.totalPages = Math.ceil(totalRecords / app.pagination.itemsPerPage);
    
    // Get current page records
    const startIndex = (app.pagination.currentPage - 1) * app.pagination.itemsPerPage;
    const endIndex = Math.min(startIndex + app.pagination.itemsPerPage, totalRecords);
    const pageRecords = app.filteredData.slice(startIndex, endIndex);
    
    // Create rows for current page
    pageRecords.forEach((record, index) => {
        const row = document.createElement('tr');
        
        // Determine record status
        let status = 'Pending';
        let statusClass = 'status-pending';
        
        if (record['Date RTA Approved']) {
            status = 'Approved';
            statusClass = 'status-approved';
        } else if (record['RTA Denial Reason']) {
            status = 'Denied';
            statusClass = 'status-denied';
        }
        
        // Determine inspection status
        let inspectionStatus = 'Not Scheduled';
        
        if (record['Date Inspected']) {
            inspectionStatus = record['Initial Inspection Result'] || 'Completed';
        } else if (record['Inspector']) {
            inspectionStatus = 'Scheduled';
        }
        
        // Calculate process duration
        let processDuration = '-';
        const receiveDate = new Date(record['Date RTA Received by HACSCM']);
        let endDate;
        
        if (record['Date RTA Approved']) {
            endDate = new Date(record['Date RTA Approved']);
        } else if (record['RTA Denial Reason'] && record['Date to Fiscal']) {
            endDate = new Date(record['Date to Fiscal']);
        } else if (receiveDate && !isNaN(receiveDate)) {
            endDate = new Date(); // Current date for pending records
        }
        
        if (receiveDate && endDate && !isNaN(receiveDate) && !isNaN(endDate)) {
            const days = Math.round((endDate - receiveDate) / (1000 * 60 * 60 * 24));
            if (days >= 0) {
                processDuration = days + ' days';
            }
        }
        
        // Create table cells
        row.innerHTML = `
            <td>${record['First Name'] || ''} ${record['Last Name'] || ''}</td>
            <td>${record['Program code'] || ''}</td>
            <td>${formatDate(record['Date RTA Received by HACSCM'])}</td>
            <td>${record['Property Address'] || ''}</td>
            <td>${record['City Code'] || ''}</td>
            <td>${record['BR Size'] || ''}</td>
            <td>${inspectionStatus}</td>
            <td>${processDuration}</td>
            <td><span class="status-badge ${statusClass}">${status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary view-record" data-index="${startIndex + index}">
                    <i class="bi bi-eye"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-record').forEach(button => {
        button.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            showRecordDetails(app.filteredData[index]);
        });
    });
    
    // Update pagination
    updatePagination();
}

// Update pagination controls
function updatePagination() {
    const paginationContainer = document.getElementById('tablePagination');
    paginationContainer.innerHTML = '';
    
    if (app.pagination.totalPages <= 1) {
        return;
    }
    
    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${app.pagination.currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>`;
    paginationContainer.appendChild(prevLi);
    
    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, app.pagination.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(app.pagination.totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = `page-item ${i === app.pagination.currentPage ? 'active' : ''}`;
        pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        paginationContainer.appendChild(pageLi);
    }
    
    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${app.pagination.currentPage === app.pagination.totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>`;
    paginationContainer.appendChild(nextLi);
    
    // Add event listeners to pagination controls
    paginationContainer.querySelectorAll('.page-link').forEach((link, index) => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (index === 0) {
                // Previous button
                if (app.pagination.currentPage > 1) {
                    app.pagination.currentPage--;
                    populateDataTable();
                }
            } else if (index === paginationContainer.querySelectorAll('.page-link').length - 1) {
                // Next button
                if (app.pagination.currentPage < app.pagination.totalPages) {
                    app.pagination.currentPage++;
                    populateDataTable();
                }
            } else {
                // Page number
                app.pagination.currentPage = parseInt(this.textContent);
                populateDataTable();
            }
        });
    });
}

// Show record details in modal
function showRecordDetails(record) {
    if (!record) return;
    
    const modalBody = document.getElementById('recordModalBody');
    modalBody.innerHTML = '';
    
    // Create details in groups
    const detailGroups = [
        {
            title: 'Applicant Information',
            fields: [
                { label: 'First Name', field: 'First Name' },
                { label: 'Last Name', field: 'Last Name' },
                { label: 'Type of MI', field: 'Type of MI' },
                { label: 'Program Code', field: 'Program code' }
            ]
        },
        {
            title: 'Property Information',
            fields: [
                { label: 'Property Address', field: 'Property Address' },
                { label: 'City Code', field: 'City Code' },
                { label: 'BR Size', field: 'BR Size' },
                { label: 'Proposed Contract Rent', field: 'Proposed Contract Rent', formatter: formatCurrency },
                { label: 'Security Deposit', field: 'Security Deposit Amount', formatter: formatCurrency },
                { label: 'Landlord Name', field: 'Landlord name' },
                { label: 'Landlord Phone', field: 'Landlord phone' }
            ]
        },
        {
            title: 'Process Timeline',
            fields: [
                { label: 'Date RTA Received', field: 'Date RTA Received by HACSCM', formatter: formatDate },
                { label: 'Date Assigned to Inspector', field: 'Date RTA Assigned to Inspector', formatter: formatDate },
                { label: 'Inspector', field: 'Inspector' },
                { label: 'Date Inspected', field: 'Date Inspected', formatter: formatDate },
                { label: 'Initial Inspection Result', field: 'Initial Inspection Result' },
                { label: 'Recheck Date', field: 'ReCheck Date', formatter: formatDate },
                { label: 'Recheck Result', field: 'ReCheck Result' },
                { label: 'Rent Reasonableness Date', field: 'Rent Reasonableness Date', formatter: formatDate }
            ]
        },
        {
            title: 'Approval Information',
            fields: [
                { label: 'Date RTA Approved', field: 'Date RTA Approved', formatter: formatDate },
                { label: 'Approved Contract Rent', field: 'Approved Contract Rent', formatter: formatCurrency },
                { label: 'Date to Fiscal', field: 'Date to Fiscal', formatter: formatDate },
                { label: 'RTA Denial Reason', field: 'RTA Denial Reason' },
                { label: 'Notes', field: 'Notes' }
            ]
        },
        {
            title: 'Process Metrics',
            fields: [
                { label: 'Days from Receipt to Assignment', field: 'Number of Days From Receipt to Caseworker Assignment' },
                { label: 'Days from Assignment to Inspection', field: 'Number of Days from Caseworker Assignment to Inspection' },
                { label: 'Days from Assignment to Rent Determination', field: 'Number of Days from Caseworker Assignment to Rent Reasonableness' },
                { label: 'Days from Assignment to Approval/Denial', field: 'Number of Days from Caseworker Assignment to RTA Approval/Denial' }
            ]
        }
    ];
    
    // Create detail groups
    detailGroups.forEach(group => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'detail-group';
        
        const groupTitle = document.createElement('h5');
        groupTitle.className = 'mb-3';
        groupTitle.textContent = group.title;
        groupDiv.appendChild(groupTitle);
        
        const row = document.createElement('div');
        row.className = 'row';
        
        group.fields.forEach(field => {
            const value = record[field.field];
            let displayValue = value;
            
            // Format value if needed
            if (field.formatter && value) {
                displayValue = field.formatter(value);
            } else if (value === '' || value === null || value === undefined) {
                displayValue = 'N/A';
            }
            
            const fieldCol = document.createElement('div');
            fieldCol.className = 'col-md-6 mb-2';
            
            const fieldLabel = document.createElement('div');
            fieldLabel.className = 'detail-label';
            fieldLabel.textContent = field.label;
            
            const fieldValue = document.createElement('div');
            fieldValue.className = 'detail-value';
            fieldValue.textContent = displayValue;
            
            fieldCol.appendChild(fieldLabel);
            fieldCol.appendChild(fieldValue);
            row.appendChild(fieldCol);
        });
        
        groupDiv.appendChild(row);
        modalBody.appendChild(groupDiv);
    });
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('recordModal'));
    modal.show();
    
    // Set up edit button
    document.getElementById('editRecord').addEventListener('click', function() {
        modal.hide();
        populateFormForEdit(record);
        document.getElementById('data-entry').scrollIntoView({ behavior: 'smooth' });
    });
}

// Populate form dropdowns from lookup data
function populateFormDropdowns() {
    if (!app.data || !app.data.lookup_values) return;
    
    // MI Type dropdown
    const miTypeSelect = document.getElementById('miType');
    miTypeSelect.innerHTML = ''; // Clear existing options
    const miTypes = app.data.lookup_values['miType'] || [];
    miTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        miTypeSelect.appendChild(option);
    });
    
    // Program Code dropdown
    const programCodeSelect = document.getElementById('programCode');
    programCodeSelect.innerHTML = ''; // Clear existing options
    const programCodes = app.data.lookup_values['prog code'] || [];
    programCodes.forEach(code => {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = code;
        programCodeSelect.appendChild(option);
    });
    
    // City Code dropdown
    const cityCodeSelect = document.getElementById('cityCode');
    cityCodeSelect.innerHTML = ''; // Clear existing options
    const cityCodes = app.data.lookup_values['cityCode'] || [];
    cityCodes.forEach(code => {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = code;
        cityCodeSelect.appendChild(option);
    });
    
    // BR Size dropdown
    const brSizeSelect = document.getElementById('brSize');
    brSizeSelect.innerHTML = ''; // Clear existing options
    const brSizes = app.data.lookup_values['brSize'] || [];
    brSizes.forEach(size => {
        const option = document.createElement('option');
        option.value = size;
        option.textContent = size;
        brSizeSelect.appendChild(option);
    });
    
    // Inspector dropdown
    const inspectorSelect = document.getElementById('inspector');
    inspectorSelect.innerHTML = ''; // Clear existing options
    const inspectors = app.data.lookup_values['insp'] || [];
    inspectors.forEach(inspector => {
        const option = document.createElement('option');
        option.value = inspector;
        option.textContent = inspector;
        inspectorSelect.appendChild(option);
    });
    
    // Add empty option at beginning of each dropdown
    [miTypeSelect, programCodeSelect, cityCodeSelect, brSizeSelect, inspectorSelect].forEach(select => {
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = '-- Select --';
        select.insertBefore(emptyOption, select.firstChild);
        select.selectedIndex = 0;
    });
}

// Save form data
function saveFormData() {
    // Get form values
    const newRecord = {
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
    
    // Add to data (in a real app, this would be a server POST)
    if (app.data && app.data.main_data) {
        app.data.main_data.unshift(newRecord);
        app.filteredData = [...app.data.main_data];
        
        // Update UI
        updateDashboard();
        updateCharts();
        populateDataTable();
        
        // Reset form
        document.getElementById('rtaForm').reset();
        
        // Show success message
        showAlert('Record saved successfully!', 'success');
    } else {
        showAlert('Error saving record. Please try again.', 'danger');
    }
}

// Populate form for editing a record
function populateFormForEdit(record) {
    if (!record) return;
    
    document.getElementById('firstName').value = record['First Name'] || '';
    document.getElementById('lastName').value = record['Last Name'] || '';
    document.getElementById('miType').value = record['Type of MI'] || '';
    document.getElementById('programCode').value = record['Program code'] || '';
    document.getElementById('receiveDate').value = formatDateForInput(record['Date RTA Received by HACSCM']);
    document.getElementById('assignDate').value = formatDateForInput(record['Date RTA Assigned to Inspector']);
    document.getElementById('propertyAddress').value = record['Property Address'] || '';
    document.getElementById('cityCode').value = record['City Code'] || '';
    document.getElementById('brSize').value = record['BR Size'] || '';
    document.getElementById('contractRent').value = record['Proposed Contract Rent'] || '';
    document.getElementById('securityDeposit').value = record['Security Deposit Amount'] || '';
    document.getElementById('landlordName').value = record['Landlord name'] || '';
    document.getElementById('inspector').value = record['Inspector'] || '';
    document.getElementById('inspectionDate').value = formatDateForInput(record['Date Inspected']);
    document.getElementById('inspectionResult').value = record['Initial Inspection Result'] || '';
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format date for input fields (YYYY-MM-DD)
function formatDateForInput(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    return date.toISOString().slice(0, 10);
}

// Format currency values
function formatCurrency(value) {
    if (!value) return '';
    
    const number = parseFloat(value);
    if (isNaN(number)) return value;
    
    return '$' + number.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// Show alert message
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Check if an alert already exists and remove it
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Insert at the top of the container
    const container = document.querySelector('.container-fluid');
    container.insertBefore(alertDiv, container.firstChild);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.classList.remove('show');
            setTimeout(() => alertDiv.remove(), 300);
        }
    }, 5000);
}