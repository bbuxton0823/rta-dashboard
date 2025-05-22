// Charts module for RTA Dashboard

// Chart objects to store references for updates
const chartObjects = {
    statusChart: null,
    inspectionChart: null,
    programChart: null,
    cityChart: null,
    processTimelineChart: null
};

// Chart colors
const chartColors = {
    primary: '#0d6efd',
    success: '#198754',
    warning: '#ffc107',
    danger: '#dc3545',
    info: '#0dcaf0',
    secondary: '#6c757d',
    light: '#f8f9fa',
    dark: '#212529'
};

// Initialize all charts
function initCharts() {
    if (!app.filteredData) return;
    
    // Create charts
    createStatusChart();
    createInspectionChart();
    createProgramChart();
    createCityChart();
    createProcessTimelineChart();
    
    // Create sparklines for metric cards
    createSparklines();
}

// Update all charts with filtered data
function updateCharts() {
    if (!app.filteredData) return;
    
    updateStatusChart();
    updateInspectionChart();
    updateProgramChart();
    updateCityChart();
    updateProcessTimelineChart();
    
    // Update sparklines
    updateSparklines();
}

// Create status distribution chart
function createStatusChart() {
    const ctx = document.getElementById('statusChart').getContext('2d');
    
    // Calculate status distribution
    const statusData = calculateStatusDistribution();
    
    chartObjects.statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Approved', 'Denied', 'Pending'],
            datasets: [{
                data: [
                    statusData.approved,
                    statusData.denied,
                    statusData.pending
                ],
                backgroundColor: [
                    chartColors.success,
                    chartColors.danger,
                    chartColors.warning
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 15,
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '70%'
        }
    });
}

// Update status chart with new data
function updateStatusChart() {
    if (!chartObjects.statusChart) return;
    
    const statusData = calculateStatusDistribution();
    
    chartObjects.statusChart.data.datasets[0].data = [
        statusData.approved,
        statusData.denied,
        statusData.pending
    ];
    
    chartObjects.statusChart.update();
}

// Create inspection results chart
function createInspectionChart() {
    const ctx = document.getElementById('inspectionChart').getContext('2d');
    
    // Calculate inspection results distribution
    const inspectionData = calculateInspectionResults();
    
    chartObjects.inspectionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Pass', 'Fail', 'Canceled', 'Not Inspected'],
            datasets: [{
                data: [
                    inspectionData.pass,
                    inspectionData.fail,
                    inspectionData.canceled,
                    inspectionData.notInspected
                ],
                backgroundColor: [
                    chartColors.success,
                    chartColors.danger,
                    chartColors.secondary,
                    chartColors.light
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 15,
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '70%'
        }
    });
}

// Update inspection chart with new data
function updateInspectionChart() {
    if (!chartObjects.inspectionChart) return;
    
    const inspectionData = calculateInspectionResults();
    
    chartObjects.inspectionChart.data.datasets[0].data = [
        inspectionData.pass,
        inspectionData.fail,
        inspectionData.canceled,
        inspectionData.notInspected
    ];
    
    chartObjects.inspectionChart.update();
}

// Create program performance chart
function createProgramChart() {
    const ctx = document.getElementById('programChart').getContext('2d');
    
    // Calculate program distribution
    const programData = calculateProgramDistribution();
    
    chartObjects.programChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: programData.labels,
            datasets: [
                {
                    label: 'Approved',
                    data: programData.approved,
                    backgroundColor: chartColors.success
                },
                {
                    label: 'Denied',
                    data: programData.denied,
                    backgroundColor: chartColors.danger
                },
                {
                    label: 'Pending',
                    data: programData.pending,
                    backgroundColor: chartColors.warning
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    stacked: true,
                    grid: {
                        display: false
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

// Update program chart with new data
function updateProgramChart() {
    if (!chartObjects.programChart) return;
    
    const programData = calculateProgramDistribution();
    
    chartObjects.programChart.data.labels = programData.labels;
    chartObjects.programChart.data.datasets[0].data = programData.approved;
    chartObjects.programChart.data.datasets[1].data = programData.denied;
    chartObjects.programChart.data.datasets[2].data = programData.pending;
    
    chartObjects.programChart.update();
}

// Create city distribution chart
function createCityChart() {
    const ctx = document.getElementById('cityChart').getContext('2d');
    
    // Calculate city distribution
    const cityData = calculateCityDistribution();
    
    chartObjects.cityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: cityData.labels,
            datasets: [{
                label: 'Applications',
                data: cityData.counts,
                backgroundColor: chartColors.primary,
                borderWidth: 0
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                },
                y: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Update city chart with new data
function updateCityChart() {
    if (!chartObjects.cityChart) return;
    
    const cityData = calculateCityDistribution();
    
    chartObjects.cityChart.data.labels = cityData.labels;
    chartObjects.cityChart.data.datasets[0].data = cityData.counts;
    
    chartObjects.cityChart.update();
}

// Create process timeline chart
function createProcessTimelineChart() {
    const ctx = document.getElementById('processTimelineChart').getContext('2d');
    
    // Calculate process timeline metrics
    const timelineData = calculateProcessTimeline();
    
    chartObjects.processTimelineChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: timelineData.labels,
            datasets: [{
                label: 'Average Days',
                data: timelineData.averages,
                backgroundColor: chartColors.primary,
                borderWidth: 0
            },
            {
                label: 'Benchmark',
                data: timelineData.benchmarks,
                backgroundColor: 'rgba(0,0,0,0)',
                borderColor: chartColors.danger,
                borderWidth: 2,
                borderDash: [5, 5],
                type: 'line'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw || 0;
                            if (context.datasetIndex === 0) {
                                return `Average: ${value.toFixed(1)} days`;
                            } else {
                                return `Target: ${value} days`;
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
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

// Update process timeline chart with new data
function updateProcessTimelineChart() {
    if (!chartObjects.processTimelineChart) return;
    
    const timelineData = calculateProcessTimeline();
    
    chartObjects.processTimelineChart.data.datasets[0].data = timelineData.averages;
    
    chartObjects.processTimelineChart.update();
}

// Create sparklines for metric cards
function createSparklines() {
    // Sample data for sparklines - in a real app, this would come from time-series data
    const totalHistory = generateRandomHistory(30, 800, 1200);
    const approvalHistory = generateRandomHistory(30, 50, 90);
    const processingHistory = generateRandomHistory(30, 10, 30);
    const pendingHistory = generateRandomHistory(30, 20, 100);
    
    // Total applications sparkline
    new Chart(document.getElementById('totalSparkline').getContext('2d'), {
        type: 'line',
        data: {
            labels: Array(totalHistory.length).fill(''),
            datasets: [{
                data: totalHistory,
                borderColor: chartColors.primary,
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
                    display: false,
                    min: Math.min(...totalHistory) * 0.8,
                    max: Math.max(...totalHistory) * 1.1
                }
            }
        }
    });
    
    // Approval rate sparkline
    new Chart(document.getElementById('approvalRateSparkline').getContext('2d'), {
        type: 'line',
        data: {
            labels: Array(approvalHistory.length).fill(''),
            datasets: [{
                data: approvalHistory,
                borderColor: chartColors.success,
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
                    display: false,
                    min: Math.min(...approvalHistory) * 0.8,
                    max: Math.max(...approvalHistory) * 1.1
                }
            }
        }
    });
    
    // Processing days sparkline
    new Chart(document.getElementById('processingDaysSparkline').getContext('2d'), {
        type: 'line',
        data: {
            labels: Array(processingHistory.length).fill(''),
            datasets: [{
                data: processingHistory,
                borderColor: chartColors.info,
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
                    display: false,
                    min: Math.min(...processingHistory) * 0.8,
                    max: Math.max(...processingHistory) * 1.1
                }
            }
        }
    });
    
    // Pending inspections sparkline
    new Chart(document.getElementById('pendingSparkline').getContext('2d'), {
        type: 'line',
        data: {
            labels: Array(pendingHistory.length).fill(''),
            datasets: [{
                data: pendingHistory,
                borderColor: chartColors.warning,
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
                    display: false,
                    min: Math.min(...pendingHistory) * 0.8,
                    max: Math.max(...pendingHistory) * 1.1
                }
            }
        }
    });
}

// Update sparklines with new data
function updateSparklines() {
    // In a real implementation, this would update the sparklines with new time-series data
    // For this demo, we're using static sparklines
}

// Calculate status distribution
function calculateStatusDistribution() {
    if (!app.filteredData) {
        return { approved: 0, denied: 0, pending: 0 };
    }
    
    const approved = app.filteredData.filter(record => record['Date RTA Approved']).length;
    const denied = app.filteredData.filter(record => !record['Date RTA Approved'] && record['RTA Denial Reason']).length;
    const pending = app.filteredData.length - approved - denied;
    
    return { approved, denied, pending };
}

// Calculate inspection results distribution
function calculateInspectionResults() {
    if (!app.filteredData) {
        return { pass: 0, fail: 0, canceled: 0, notInspected: 0 };
    }
    
    let pass = 0;
    let fail = 0;
    let canceled = 0;
    let notInspected = 0;
    
    app.filteredData.forEach(record => {
        if (!record['Date Inspected']) {
            notInspected++;
        } else {
            const result = record['Initial Inspection Result'];
            if (result) {
                const resultLower = result.toLowerCase();
                if (resultLower.includes('pass')) {
                    pass++;
                } else if (resultLower.includes('fail')) {
                    fail++;
                } else if (resultLower.includes('cancel')) {
                    canceled++;
                } else {
                    notInspected++;
                }
            } else {
                notInspected++;
            }
        }
    });
    
    return { pass, fail, canceled, notInspected };
}

// Calculate program distribution
function calculateProgramDistribution() {
    if (!app.filteredData) {
        return { labels: [], approved: [], denied: [], pending: [] };
    }
    
    // Count programs
    const programCounts = {};
    const programApproved = {};
    const programDenied = {};
    const programPending = {};
    
    app.filteredData.forEach(record => {
        const program = record['Program code'] || 'Unknown';
        
        // Initialize counters if needed
        if (!programCounts[program]) {
            programCounts[program] = 0;
            programApproved[program] = 0;
            programDenied[program] = 0;
            programPending[program] = 0;
        }
        
        // Increment total count
        programCounts[program]++;
        
        // Increment status counters
        if (record['Date RTA Approved']) {
            programApproved[program]++;
        } else if (record['RTA Denial Reason']) {
            programDenied[program]++;
        } else {
            programPending[program]++;
        }
    });
    
    // Sort programs by total count and take top 8
    const sortedPrograms = Object.keys(programCounts).sort((a, b) => 
        programCounts[b] - programCounts[a]
    ).slice(0, 8);
    
    // Create arrays for chart
    const labels = sortedPrograms;
    const approved = sortedPrograms.map(program => programApproved[program]);
    const denied = sortedPrograms.map(program => programDenied[program]);
    const pending = sortedPrograms.map(program => programPending[program]);
    
    return { labels, approved, denied, pending };
}

// Calculate city distribution
function calculateCityDistribution() {
    if (!app.filteredData) {
        return { labels: [], counts: [] };
    }
    
    // Count cities
    const cityCounts = {};
    
    app.filteredData.forEach(record => {
        const city = record['City Code'] || 'Unknown';
        
        if (!cityCounts[city]) {
            cityCounts[city] = 0;
        }
        
        cityCounts[city]++;
    });
    
    // Sort cities by count and take top 10
    const sortedCities = Object.keys(cityCounts).sort((a, b) => 
        cityCounts[b] - cityCounts[a]
    ).slice(0, 10);
    
    // Create arrays for chart
    const labels = sortedCities;
    const counts = sortedCities.map(city => cityCounts[city]);
    
    return { labels, counts };
}

// Calculate process timeline metrics
function calculateProcessTimeline() {
    if (!app.filteredData) {
        return { 
            labels: [], 
            averages: [], 
            benchmarks: []
        };
    }
    
    // Define timeline stages
    const stages = [
        { 
            label: 'Receipt to Assignment', 
            field: 'Number of Days From Receipt to Caseworker Assignment',
            benchmark: 3
        },
        { 
            label: 'Assignment to Inspection', 
            field: 'Number of Days from Caseworker Assignment to Inspection',
            benchmark: 5
        },
        { 
            label: 'Inspection to Rent Determination', 
            field: 'Number of Days from Caseworker Assignment to Rent Reasonableness',
            benchmark: 7
        },
        { 
            label: 'Determination to Approval/Denial', 
            field: 'Number of Days from Caseworker Assignment to RTA Approval/Denial',
            benchmark: 10
        }
    ];
    
    // Calculate averages
    const averages = stages.map(stage => {
        let sum = 0;
        let count = 0;
        
        app.filteredData.forEach(record => {
            const value = record[stage.field];
            if (value !== undefined && value !== null && value !== '' && !isNaN(value)) {
                // Filter out negative values or extremely high values (likely errors)
                const days = parseFloat(value);
                if (days >= 0 && days < 100) {
                    sum += days;
                    count++;
                }
            }
        });
        
        return count > 0 ? sum / count : 0;
    });
    
    return {
        labels: stages.map(stage => stage.label),
        averages: averages,
        benchmarks: stages.map(stage => stage.benchmark)
    };
}

// Generate random history data for sparklines
function generateRandomHistory(length, min, max) {
    const result = [];
    let value = Math.floor(Math.random() * (max - min)) + min;
    
    for (let i = 0; i < length; i++) {
        // Add some randomness but keep relatively smooth
        const change = Math.random() * (max - min) * 0.1;
        value = Math.max(min, Math.min(max, value + (Math.random() > 0.5 ? change : -change)));
        result.push(value);
    }
    
    return result;
}