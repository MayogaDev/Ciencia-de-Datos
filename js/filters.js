// Inicializar los filtros
function initializeFilters() {
    // Obtener valores únicos para cada categoría de filtro
    const employmentTypes = [...new Set(globalData.map(d => d.employment_type))];
    const industries = [...new Set(globalData.map(d => d.industry))];
    const locations = [...new Set(globalData.map(d => d.location))];
    
    // Crear filtros para tipo de empleo
    createFilterOptions("employment-type-filter", employmentTypes, "employment_type");
    
    // Crear filtros para industria
    createFilterOptions("industry-filter", industries, "industry");
    
    // Crear filtros para ubicación
    createFilterOptions("location-filter", locations, "location");
}

// Crear opciones de filtro en la interfaz
function createFilterOptions(containerId, options, filterKey) {
    const container = d3.select(`#${containerId}`);
    container.selectAll("*").remove();
    
    // Ordenar opciones alfabéticamente
    options.sort();
    
    // Para cada opción, crear un elemento de filtro
    options.forEach(option => {
        if (!option) return;
        
        const count = globalData.filter(d => d[filterKey] === option).length;
        
        const filterOption = container.append("div")
            .attr("class", "filter-option");
            
        filterOption.append("input")
            .attr("type", "checkbox")
            .attr("id", `${filterKey}-${option.replace(/\s+/g, '-')}`)
            .attr("value", option)
            .on("change", function() {
                updateFilters(filterKey, option, this.checked);
            });
            
        filterOption.append("label")
            .attr("for", `${filterKey}-${option.replace(/\s+/g, '-')}`)
            .text(option);
            
        filterOption.append("span")
            .attr("class", "filter-count")
            .text(`(${count})`);
    });
}

// Actualizar los filtros aplicados
function updateFilters(filterKey, value, isChecked) {
    if (isChecked) {
        if (!filters[filterKey].includes(value)) {
            filters[filterKey].push(value);
        }
    } else {
        filters[filterKey] = filters[filterKey].filter(item => item !== value);
    }
    
    // Aplicar filtros a los datos
    applyFilters();
}

// Aplicar todos los filtros a los datos
function applyFilters() {
    filteredData = globalData.filter(d => {
        // Verificar filtros de tipo de empleo
        if (filters.employment_type.length > 0 && !filters.employment_type.includes(d.employment_type)) {
            return false;
        }
        
        // Verificar filtros de industria
        if (filters.industry.length > 0 && !filters.industry.includes(d.industry)) {
            return false;
        }
        
        // Verificar filtros de ubicación
        if (filters.location.length > 0 && !filters.location.includes(d.location)) {
            return false;
        }
        
        return true;
    });
    
    // Actualizar el dashboard con los datos filtrados
    updateDashboard();
}

// Actualizar los contadores en los filtros
function updateFilterCounts() {
    // Actualizar contadores para tipo de empleo
    updateFilterCount("employment-type-filter", "employment_type");
    
    // Actualizar contadores para industria
    updateFilterCount("industry-filter", "industry");
    
    // Actualizar contadores para ubicación
    updateFilterCount("location-filter", "location");
}

function updateFilterCount(containerId, filterKey) {
    d3.selectAll(`#${containerId} .filter-option`).each(function() {
        const option = d3.select(this).select("input").attr("value");
        const countElement = d3.select(this).select(".filter-count");
        
        const count = filteredData.filter(d => d[filterKey] === option).length;
        countElement.text(`(${count})`);
    });
}