function initializeFilters() {
    const employmentTypes = [...new Set(globalData.map(d => d.employment_type))].filter(Boolean).sort();
    const industries = [...new Set(globalData.map(d => d.industry))].filter(Boolean).sort();
    const locations = [...new Set(globalData.map(d => d.location))].filter(Boolean).sort();
    const titles = [...new Set(globalData.map(d => d.title))].filter(Boolean).sort();

    createButtonFilter("employment-type-panel", employmentTypes, "employment_type");
    createButtonFilter("industry-panel", industries, "industry");
    createButtonFilter("location-panel", locations, "location");
    createButtonFilter("title-panel", titles, "title");
    createButtonFilter("salary-filter", ["Menos de $50,000", "$50,000 - $100,000", "$100,000 - $150,000", "$150,000 - $200,000", "Más de $200,000"], "salary");
    
    if (globalData.some(d => d.salary)) {   
        createSalaryRangeFilter();
    }

    d3.select("#employment-type-btn").on("click", function() {
        toggleFilterPanel("employment-type-panel", toggleEmploymentTypeVisualizations);
    });
    d3.select("#industry-btn").on("click", function() {
        toggleFilterPanel("industry-panel", toggleIndustryVisualizations);
    });
    d3.select("#location-btn").on("click", function() {
        toggleFilterPanel("location-panel", toggleLocationVisualizations);
    });
    d3.select("#title-btn").on("click", function() {
        toggleFilterPanel("title-panel", toggleTitleVisualizations);
    });
    d3.select("#salary-btn").on("click", function() { // Nuevo evento para salario
        toggleFilterPanel("salary-filter", toggleSalaryVisualizations); // Asegúrate de que toggleSalaryVisualizations esté definido
    });
}

function createButtonFilter(containerId, options, filterKey) {
    const container = d3.select(`#${containerId}`);
    container.selectAll("*").remove();

    container.selectAll(".filter-panel-btn")
        .data(options)
        .enter()
        .append("button")
        .attr("class", d => `filter-panel-btn ${filterKey === "employment_type" && selectedCategory === d ? "selected" : ""} ${filterKey === "location" && selectedLocation === d ? "selected" : ""} ${filterKey === "title" && selectedTitle === d ? "selected" : ""}`)
        .text(d => d)
        .on("click", function(event, d) {
            const button = d3.select(this);
            if (filterKey === "employment_type") {
                selectedCategory = selectedCategory === d ? null : d;
                button.classed("selected", selectedCategory === d);
                filters[filterKey] = selectedCategory ? [selectedCategory] : [];
            } else if (filterKey === "location") {
                selectedLocation = selectedLocation === d ? null : d;
                button.classed("selected", selectedLocation === d);
                filters[filterKey] = selectedLocation ? [selectedLocation] : [];
            } else if (filterKey === "title") {
                selectedTitle = selectedTitle === d ? null : d;
                button.classed("selected", selectedTitle === d);
                filters[filterKey] = selectedTitle ? [selectedTitle] : [];
            }
            else if (filterKey === "salary") {
                const salaryRanges = {
                    "Menos de $50,000": 50000,
                    "$50,000 - $100,000": 100000,
                    "$100,000 - $150,000": 150000,
                    "$150,000 - $200,000": 200000,
                    "Más de $200,000": 200001
                };
                const maxSalary = salaryRanges[d];
                filters.salaryMax = maxSalary;
                d3.select("#max-salary-value").text(formatSalary(maxSalary));
                d3.select("#salary-range").property("value", maxSalary);
            } else {
                const isSelected = button.classed("selected");
                button.classed("selected", !isSelected);
                if (!isSelected) {
                    if (!filters[filterKey].includes(d)) {
                        filters[filterKey].push(d);
                    }
                } else {
                    filters[filterKey] = filters[filterKey].filter(item => item !== d);
                }
            }
            applyFilters();
            updateVisualizations();
            updateFilterCounts();
        });
}

function toggleFilterPanel(panelId, vizToggleFunction) {
    const panel = d3.select(`#${panelId}`);
    const isHidden = panel.classed("hidden");
    
    panel.classed("hidden", !isHidden);
    
    if (vizToggleFunction) {
        vizToggleFunction(isHidden);
    }
}

function createSalaryRangeFilter() {
    const container = d3.select("#salary-filter");
    if (container.empty()) return;
    
    container.selectAll("*").remove();
    
    const salaryData = globalData
        .filter(d => d.salary && !isNaN(d.salary))
        .map(d => +d.salary);
    
    if (salaryData.length === 0) return;
    
    const minSalary = d3.min(salaryData);
    const maxSalary = d3.max(salaryData);
    
    container.append("h3").text("Rango de Salario");
    
    const rangeContainer = container.append("div")
        .attr("class", "salary-range-container");
    
    rangeContainer.append("div")
        .attr("class", "salary-values")
        .html(`
            <span id="min-salary-value">${formatSalary(minSalary)}</span>
            <span id="max-salary-value">${formatSalary(maxSalary)}</span>
        `);
    
    rangeContainer.append("div")
        .attr("class", "slider-container")
        .append("input")
        .attr("type", "range")
        .attr("id", "salary-range")
        .attr("min", 0)
        .attr("max", 200000)
        .attr("value", 200000)
        .attr("step", 100)
        .on("input", function() {
            const maxValue = this.value;
            d3.select("#max-salary-value").text(formatSalary(maxValue));
            filters.salaryMax = +maxValue;
            applyFilters();
        });
    
    filters.salaryMax = maxSalary;
}

function formatSalary(value) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

function updateFilterCounts() {
    updateButtonCount("employment-type-panel", "employment_type");
    updateButtonCount("industry-panel", "industry");
    updateButtonCount("location-panel", "location");
    updateButtonCount("title-panel", "title");
    updateButtonCount("salary-filter", "salary");

}

function updateButtonCount(containerId, filterKey) {
    const container = d3.select(`#${containerId}`);
    container.selectAll(".filter-panel-btn")
        .text(d => {
            const count = filteredData.filter(data => data[filterKey] === d).length;
            return `${d} (${count})`;
        });
}

function applyFilters() {
    filteredData = globalData.filter(d => {
        const employmentMatch = !filters.employment_type.length || filters.employment_type.includes(d.employment_type);
        const industryMatch = !filters.industry.length || filters.industry.includes(d.industry);
        const locationMatch = !filters.location.length || filters.location.includes(d.location);
        const titleMatch = !filters.title.length || filters.title.includes(d.title);
        const salaryMatch = !filters.salaryMax || !d.salary || d.salary <= filters.salaryMax;
        return employmentMatch && industryMatch && locationMatch && titleMatch && salaryMatch;
    });
    updateDashboard();
}

function resetFilters() {
    filters = {
        employment_type: [],
        industry: [],
        location: [],
        title: [],
        salaryMax: null
    };
    
    d3.selectAll(".filter-panel-btn").classed("selected", false);
    d3.selectAll(".filter-panel").classed("hidden", true);
    
    if (document.getElementById('salary-range')) {
        const maxSalary = d3.max(globalData.filter(d => d.salary).map(d => +d.salary));
        document.getElementById('salary-range').value = maxSalary;
        d3.select("#max-salary-value").text(formatSalary(maxSalary));
        filters.salaryMax = maxSalary;
    }
    
    selectedCategory = null;
    selectedLocation = null;
    selectedTitle = null;
    filteredData = [...globalData];
    toggleEmploymentTypeVisualizations(false);
    toggleIndustryVisualizations(false);
    toggleLocationVisualizations(false);
    toggleTitleVisualizations(false);
    toggleSalaryVisualizations(false);
    updateDashboard();
}