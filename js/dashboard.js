// Dashboard-specific code for RTA Application Dashboard

// These functions will be called from the main app.js file
// This file contains dashboard-specific logic like KPI calculations

// Initialize the dashboard
function initDashboard() {
    if (!app.data) return;
    
    // Set up dashboard-specific event listeners
    setupDashboardEventListeners();
}

// Set up dashboard-specific event listeners
function setupDashboardEventListeners() {
    // Navigation pill events for showing/hiding dashboard sections
    document.querySelectorAll('.nav-link').forEach(navLink => {
        navLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Set active nav link
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            this.classList.add('active');
            
            // Show corresponding section
            const targetId = this.getAttribute('href').substring(1);
            document.querySelectorAll('section').forEach(section => {
                section.classList.add('d-none');
            });
            document.getElementById(targetId).classList.remove('d-none');
        });
    });
}

// Calculate key performance indicators
function calculateKPIs(data) {
    if (!data || data.length === 0) {
        return {
            totalApplications: 0,
            approvalRate: 0,
            avgProcessingDays: 0,
            pendingInspections: 0
        };
    }
    
    // Total applications
    const totalApplications = data.length;
    
    // Calculate approval rate
    const approvedCount = data.filter(record => record['Date RTA Approved']).length;
    const approvalRate = totalApplications > 0 ? Math.round((approvedCount / totalApplications) * 100) : 0;
    
    // Calculate average processing days
    let totalDays = 0;
    let countWithDays = 0;
    
    data.forEach(record => {
        const receiveDate = new Date(record['Date RTA Received by HACSCM']);
        let endDate;
        
        if (record['Date RTA Approved']) {
            endDate = new Date(record['Date RTA Approved']);
        } else if (record['RTA Denial Reason']) {
            // Use the Date to Fiscal as end date for denied applications, if available
            endDate = record['Date to Fiscal'] ? new Date(record['Date to Fiscal']) : null;
        }
        
        if (receiveDate && endDate) {
            const days = Math.round((endDate - receiveDate) / (1000 * 60 * 60 * 24));
            if (days >= 0 && days < 1000) { // Sanity check to exclude outliers
                totalDays += days;
                countWithDays++;
            }
        }
    });
    
    const avgProcessingDays = countWithDays > 0 ? Math.round(totalDays / countWithDays) : 0;
    
    // Calculate pending inspections
    const pendingInspectionCount = data.filter(record => 
        record['Inspector'] && 
        !record['Date Inspected'] && 
        !record['Date RTA Approved'] && 
        !record['RTA Denial Reason']
    ).length;
    
    return {
        totalApplications,
        approvalRate,
        avgProcessingDays,
        pendingInspectionCount
    };
}

console.log('Dashboard.js loaded - fallback charts disabled for real data integration');