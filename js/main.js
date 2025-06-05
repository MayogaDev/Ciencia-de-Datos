// Datos globales y estado
let globalData = [];
let filteredData = [];
let filters = {
    employment_type: [],
    industry: [],
    location: []
};

// Cargar datos y inicializar dashboard
document.addEventListener("DOMContentLoaded", function() {
    d3.csv("data/fake_job_postings_cleaned.csv").then(function(data) {
        // Procesamiento inicial de datos
        processRawData(data);
        
        // Inicializar filtros
        initializeFilters();
        
        // Actualizar visualizaciones con todos los datos
        updateDashboard();
        
        // Configurar evento para botón de reinicio
        d3.select("#reset-filters").on("click", function() {
            resetFilters();
        });
    });
});

// Procesar datos crudos
function processRawData(data) {
    data.forEach(d => {
        // Convertir campos importantes
        d.fraudulent = +d.fraudulent;
        d.descriptionLength = d.description ? d.description.length : 0;
        
        // Limpiar y estandarizar algunos campos
        d.employment_type = d.employment_type || "No especificado";
        d.industry = d.industry || "No especificado";
        d.location = d.location || "No especificado";
        
        // Extraer año de la fecha si existe
        if (d.posted_date) {
            const dateParts = d.posted_date.split('/');
            if (dateParts.length === 3) {
                d.year = dateParts[2];
            }
        }
    });
    
    globalData = data;
    filteredData = [...globalData];
}

// Actualizar todo el dashboard
function updateDashboard() {
    // Actualizar métricas principales
    updateKeyMetrics();
    
    // Actualizar visualizaciones
    updateVisualizations();
    
    // Actualizar opciones de filtros (contadores)
    updateFilterCounts();
}

// Actualizar métricas clave
function updateKeyMetrics() {
    const totalJobs = filteredData.length;
    const fraudJobs = d3.sum(filteredData, d => d.fraudulent);
    const fraudRate = totalJobs > 0 ? (fraudJobs / totalJobs * 100) : 0;
    const avgDescription = d3.mean(filteredData, d => d.descriptionLength) || 0;
    
    // Animación de conteo para métricas
    animateValue("total-jobs", 0, totalJobs, 1000);
    animateValue("fraud-jobs", 0, fraudJobs, 1000);
    animateValue("fraud-rate", 0, fraudRate, 1000, true);
    animateValue("avg-description", 0, avgDescription, 1000);
}

// Función para animar valores numéricos
function animateValue(id, start, end, duration, isPercent = false) {
    const obj = document.getElementById(id);
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        
        if (isPercent) {
            obj.innerHTML = value.toFixed(1) + "%";
        } else {
            obj.innerHTML = value.toLocaleString();
        }
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Reiniciar todos los filtros
function resetFilters() {
    filters = {
        employment_type: [],
        industry: [],
        location: []
    };
    
    // Desmarcar todas las casillas de verificación
    document.querySelectorAll('.filter-option input').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Restaurar datos filtrados
    filteredData = [...globalData];
    
    // Actualizar dashboard
    updateDashboard();
}