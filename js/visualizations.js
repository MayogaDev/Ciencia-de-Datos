// En visualizations.js
let selectedLocation = null;
let selectedCategory = null;
let selectedTitle = null;
let selectedSalary = null;
// Update visualizations
function updateVisualizations() {
    createPipelineVisualization();
    createEmploymentTypeChart();
    createDescriptionLengthChart();
    createGeoDistributionMap();
    createRequirementsChart();
    createFraudByIndustryChart();
    createTemporalTrendsChart();
    createRequirementsRadarChart();
    // Update new visualizations if visible
    if (d3.select("#employment-type-viz-1").style("display") !== "none") {
        createEmploymentTypeBarChart();
        createEmploymentTypePieChart();
    }
    if (d3.select("#industry-viz-1").style("display") !== "none") {
        createIndustryBarChart();
        createIndustryDonutChart();
    }
    if (d3.select("#location-viz-1").style("display") !== "none") {
        createLocationBarChart();
        createLocationPieChart();
    }
    if (d3.select("#title-viz-1").style("display") !== "none") {
        createTitleBarChart();
        createTitleWordCloud();
    }
    if (d3.select("#salary-viz-1").style("display") !== "none") {
        createSalaryBoxPlot();
        createSalaryHistogram();
    }
}

// Toggle employment type visualizations
function toggleEmploymentTypeVisualizations(show) {
    d3.select("#employment-type-viz-1").style("display", show ? "block" : "none");
    d3.select("#employment-type-viz-2").style("display", show ? "block" : "none");
    if (show) {
        createEmploymentTypeBarChart();
        createEmploymentTypePieChart();
    }
}

function toggleIndustryVisualizations(show) {
    d3.select("#industry-viz-1").style("display", show ? "block" : "none");
    d3.select("#industry-viz-2").style("display", show ? "block" : "none");
    if (show) {
        createIndustryBarChart();
        createIndustryDonutChart();
    }
}

function toggleLocationVisualizations(show) {
    d3.select("#location-viz-1").style("display", show ? "block" : "none");
    d3.select("#location-viz-2").style("display", show ? "block" : "none");
    if (show) {
        createLocationBarChart();
        createLocationPieChart();
    }
}

function toggleTitleVisualizations(show) {
    d3.select("#title-viz-1").style("display", show ? "block" : "none");
    d3.select("#title-viz-2").style("display", show ? "block" : "none");
    if (show) {
        createTitleBarChart();
        createTitleWordCloud();
    }
}

function toggleSalaryVisualizations(show) {
    d3.select("#salary-viz-1").style("display", show ? "block" : "none");
    d3.select("#salary-viz-2").style("display", show ? "block" : "none");
    if (show) {
        createSalaryBoxPlot();
        createSalaryHistogram();
    }
}

// Bar chart for employment type distribution
function createEmploymentTypeBarChart() {
    const container = d3.select("#employmentTypeBarChart");
    container.selectAll("*").remove();

    const width = container.node().getBoundingClientRect().width || 400;
    const height = 300;
    const margin = {top: 40, right: 30, bottom: 60, left: 60};

    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const typeData = d3.rollup(filteredData.filter(d => 
        (!selectedLocation || d.location === selectedLocation) && 
        (!selectedTitle || d.title === selectedTitle) && 
        (!selectedSalary || (d.salary && d.salary <= selectedSalary))), 
        v => v.length,
        d => d.employment_type
    );

    const typeArray = Array.from(typeData, ([key, value]) => ({
        type: key || "No especificado",
        count: value
    })).sort((a, b) => b.count - a.count);

    const x = d3.scaleBand()
        .domain(typeArray.map(d => d.type))
        .range([0, width - margin.left - margin.right])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(typeArray, d => d.count)])
        .range([height - margin.top - margin.bottom, 0]);

    svg.selectAll(".bar")
        .data(typeArray)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.type))
        .attr("y", d => y(d.count))
        .attr("width", x.bandwidth())
        .attr("height", d => height - margin.top - margin.bottom - y(d.count))
        .attr("fill", d => selectedCategory === d.type ? "#ff6b6b" : "#3498db")
        .on("click", function(event, d) {
            selectedCategory = selectedCategory === d.type ? null : d.type;
            updateVisualizations();
        })
        .on("mouseover", function(event, d) {
            showTooltip(event, `
                <strong>${d.type}</strong><br>
                Total: ${d.count} ofertas
            `);
        })
        .on("mouseout", hideTooltip);

    svg.append("g")
        .attr("class", "axis axis-x")
        .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g")
        .attr("class", "axis axis-y")
        .call(d3.axisLeft(y));

    svg.append("text")
        .attr("class", "chart-title")
        .attr("x", (width - margin.left - margin.right) / 2)
        .attr("y", -15)
        .attr("text-anchor", "middle")
        .text("Distribución de Ofertas por Tipo de Empleo");
}

function createEmploymentTypePieChart() {
    const container = d3.select("#employmentTypePieChart");
    container.selectAll("*").remove();

    const width = container.node().getBoundingClientRect().width || 400;
    const height = 300;
    const margin = {top: 40, right: 30, bottom: 30, left: 30};
    const radius = Math.min(width, height) / 2 - Math.max(margin.top, margin.right);

    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    const typeData = d3.rollup(filteredData.filter(d => 
        (!selectedLocation || d.location === selectedLocation) && 
        (!selectedTitle || d.title === selectedTitle) && 
        (!selectedSalary || (d.salary && d.salary <= selectedSalary))), 
        v => v.length,
        d => d.employment_type
    );

    const typeArray = Array.from(typeData, ([key, value]) => ({
        type: key || "No especificado",
        count: value
    }));

    const pie = d3.pie()
        .value(d => d.count)
        .sort(null);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    const color = d3.scaleOrdinal()
        .domain(typeArray.map(d => d.type))
        .range(d3.schemeCategory10);

    svg.selectAll(".arc")
        .data(pie(typeArray))
        .enter()
        .append("path")
        .attr("class", "arc")
        .attr("d", arc)
        .attr("fill", d => selectedCategory === d.data.type ? "#ff6b6b" : color(d.data.type))
        .on("click", function(event, d) {
            selectedCategory = selectedCategory === d.data.type ? null : d.data.type;
            updateVisualizations();
        })
        .on("mouseover", function(event, d) {
            showTooltip(event, `
                <strong>${d.data.type}</strong><br>
                Total: ${d.data.count} ofertas<br>
                Porcentaje: ${(d.data.count / d3.sum(typeArray, d => d.count) * 100).toFixed(1)}%
            `);
        })
        .on("mouseout", hideTooltip);

    const legend = svg.append("g")
        .attr("transform", `translate(${radius + 20},-${height / 2 + margin.top})`);

    legend.selectAll(".legend-item")
        .data(typeArray)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0,${i * 20})`)
        .each(function(d) {
            d3.select(this)
                .append("rect")
                .attr("width", 12)
                .attr("height", 12)
                .attr("fill", selectedCategory === d.type ? "#ff6b6b" : color(d.type));
            d3.select(this)
                .append("text")
                .attr("x", 20)
                .attr("y", 10)
                .text(d.type)
                .style("font-size", "12px");
        });

    svg.append("text")
        .attr("x", 0)
        .attr("y", -height / 2 + 20)
        .attr("text-anchor", "middle")
        .text("Proporción de Ofertas por Tipo de Empleo");
}

function createIndustryBarChart() {
    const container = d3.select("#industryBarChart");
    container.selectAll("*").remove();

    const width = container.node().getBoundingClientRect().width || 400;
    const height = 300;
    const margin = {top: 40, right: 30, bottom: 60, left: 120};

    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const industryData = d3.rollup(filteredData.filter(d => 
        (!selectedCategory || d.employment_type === selectedCategory) && 
        (!selectedLocation || d.location === selectedLocation) && 
        (!selectedTitle || d.title === selectedTitle) && 
        (!selectedSalary || (d.salary && d.salary <= selectedSalary))), 
        v => v.length,
        d => d.industry
    );

    const industryArray = Array.from(industryData, ([key, value]) => ({
        industry: key || "No especificado",
        count: value
    })).sort((a, b) => b.count - a.count).slice(0, 15);

    const y = d3.scaleBand()
        .domain(industryArray.map(d => d.industry))
        .range([0, height - margin.top - margin.bottom])
        .padding(0.2);

    const x = d3.scaleLinear()
        .domain([0, d3.max(industryArray, d => d.count)])
        .range([0, width - margin.left - margin.right]);

    svg.selectAll(".bar")
        .data(industryArray)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("y", d => y(d.industry))
        .attr("width", d => x(d.count))
        .attr("height", y.bandwidth())
        .attr("fill", "#3498db")
        .on("mouseover", function(event, d) {
            showTooltip(event, `
                <strong>${d.industry}</strong><br>
                Total: ${d.count} ofertas
            `);
        })
        .on("mouseout", hideTooltip);

    svg.append("g")
        .attr("class", "axis axis-x")
        .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("class", "axis axis-y")
        .call(d3.axisLeft(y));

    svg.append("text")
        .attr("class", "chart-title")
        .attr("x", (width - margin.left - margin.right) / 2)
        .attr("y", -15)
        .attr("text-anchor", "middle")
        .text("Distribución de Ofertas por Industria (Top 15)");
}

function createIndustryDonutChart() {
    const container = d3.select("#industryDonutChart");
    container.selectAll("*").remove();

    const width = container.node().getBoundingClientRect().width || 400;
    const height = 300;
    const margin = {top: 40, right: 30, bottom: 30, left: 30};
    const radius = Math.min(width, height) / 2 - Math.max(margin.top, margin.right);

    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    const industryData = d3.rollup(filteredData.filter(d => 
        (!selectedCategory || d.employment_type === selectedCategory) && 
        (!selectedLocation || d.location === selectedLocation) && 
        (!selectedTitle || d.title === selectedTitle) && 
        (!selectedSalary || (d.salary && d.salary <= selectedSalary))), 
        v => v.length,
        d => d.industry
    );

    const industryArray = Array.from(industryData, ([key, value]) => ({
        industry: key || "No especificado",
        count: value
    })).sort((a, b) => b.count - a.count);

    const topIndustries = industryArray.slice(0, 10);
    const othersCount = d3.sum(industryArray.slice(10), d => d.count);
    if (othersCount > 0) {
        topIndustries.push({industry: "Otros", count: othersCount});
    }

    const pie = d3.pie()
        .value(d => d.count)
        .sort(null);

    const arc = d3.arc()
        .innerRadius(radius * 0.4)
        .outerRadius(radius);

    const color = d3.scaleOrdinal()
        .domain(topIndustries.map(d => d.industry))
        .range(d3.schemeCategory10);

    svg.selectAll(".arc")
        .data(pie(topIndustries))
        .enter()
        .append("path")
        .attr("class", "arc")
        .attr("d", arc)
        .attr("fill", "#3498db")
        .on("mouseover", function(event, d) {
            showTooltip(event, `
                <strong>${d.data.industry}</strong><br>
                Total: ${d.data.count} ofertas<br>
                Porcentaje: ${(d.data.count / d3.sum(topIndustries, d => d.count) * 100).toFixed(1)}%
            `);
        })
        .on("mouseout", hideTooltip);

    const legend = svg.append("g")
        .attr("transform", `translate(${radius + 20},-${height / 2 + margin.top})`);

    legend.selectAll(".legend-item")
        .data(topIndustries)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0,${i * 20})`)
        .each(function(d) {
            d3.select(this)
                .append("rect")
                .attr("width", 12)
                .attr("height", 12)
                .attr("fill", "#3498db");
            d3.select(this)
                .append("text")
                .attr("x", 20)
                .attr("y", 10)
                .text(d.industry)
                .style("font-size", "12px");
        });

    svg.append("text")
        .attr("x", 0)
        .attr("y", -height / 2 + 20)
        .attr("text-anchor", "middle")
        .text("Proporción de Ofertas por Industria (Top 10)");
}

function createLocationBarChart() {
    const container = d3.select("#locationBarChart");
    container.selectAll("*").remove();

    const width = container.node().getBoundingClientRect().width || 400;
    const height = 300;
    const margin = {top: 40, right: 30, bottom: 60, left: 60};

    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const locationData = d3.rollup(filteredData.filter(d => 
        (!selectedCategory || d.employment_type === selectedCategory) && 
        (!selectedTitle || d.title === selectedTitle) && 
        (!selectedSalary || (d.salary && d.salary <= selectedSalary))), 
        v => v.length,
        d => d.location || "No especificado"
    );

    const locationArray = Array.from(locationData, ([key, value]) => ({
        location: key,
        count: value
    })).sort((a, b) => b.count - a.count).slice(0, 10);

    const x = d3.scaleBand()
        .domain(locationArray.map(d => d.location))
        .range([0, width - margin.left - margin.right])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(locationArray, d => d.count)])
        .range([height - margin.top - margin.bottom, 0]);

    svg.selectAll(".bar")
        .data(locationArray)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.location))
        .attr("y", d => y(d.count))
        .attr("width", x.bandwidth())
        .attr("height", d => height - margin.top - margin.bottom - y(d.count))
        .attr("fill", d => selectedLocation === d.location ? "#ff6b6b" : "#3498db")
        .on("click", function(event, d) {
            selectedLocation = selectedLocation === d.location ? null : d.location;
            updateVisualizations();
        })
        .on("mouseover", function(event, d) {
            showTooltip(event, `
                <strong>${d.location}</strong><br>
                Total: ${d.count} ofertas
            `);
        })
        .on("mouseout", hideTooltip);

    svg.append("g")
        .attr("class", "axis axis-x")
        .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g")
        .attr("class", "axis axis-y")
        .call(d3.axisLeft(y));

    svg.append("text")
        .attr("class", "chart-title")
        .attr("x", (width - margin.left - margin.right) / 2)
        .attr("y", -15)
        .attr("text-anchor", "middle")
        .text("Distribución de Ofertas por Ubicación (Top 10)");
}

function createLocationPieChart() {
    const container = d3.select("#locationPieChart");
    container.selectAll("*").remove();

    const width = container.node().getBoundingClientRect().width || 400;
    const height = 300;
    const margin = {top: 40, right: 30, bottom: 30, left: 30};
    const radius = Math.min(width, height) / 2 - Math.max(margin.top, margin.right);

    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    const locationData = d3.rollup(filteredData.filter(d => 
        (!selectedCategory || d.employment_type === selectedCategory) && 
        (!selectedTitle || d.title === selectedTitle) && 
        (!selectedSalary || (d.salary && d.salary <= selectedSalary))), 
        v => v.length,
        d => d.location || "No especificado"
    );

    const locationArray = Array.from(locationData, ([key, value]) => ({
        location: key,
        count: value
    })).sort((a, b) => b.count - a.count).slice(0, 10);

    const pie = d3.pie()
        .value(d => d.count)
        .sort(null);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    const color = d3.scaleOrdinal()
        .domain(locationArray.map(d => d.location))
        .range(d3.schemeCategory10);

    svg.selectAll(".arc")
        .data(pie(locationArray))
        .enter()
        .append("path")
        .attr("class", "arc")
        .attr("d", arc)
        .attr("fill", d => selectedLocation === d.data.location ? "#ff6b6b" : color(d.data.location))
        .on("click", function(event, d) {
            selectedLocation = selectedLocation === d.data.location ? null : d.data.location;
            updateVisualizations();
        })
        .on("mouseover", function(event, d) {
            showTooltip(event, `
                <strong>${d.data.location}</strong><br>
                Total: ${d.data.count} ofertas<br>
                Porcentaje: ${(d.data.count / d3.sum(locationArray, d => d.count) * 100).toFixed(1)}%
            `);
        })
        .on("mouseout", hideTooltip);

    const legend = svg.append("g")
        .attr("transform", `translate(${radius + 20},-${height / 2 + margin.top})`);

    legend.selectAll(".legend-item")
        .data(locationArray)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0,${i * 20})`)
        .each(function(d) {
            d3.select(this)
                .append("rect")
                .attr("width", 12)
                .attr("height", 12)
                .attr("fill", selectedLocation === d.location ? "#ff6b6b" : color(d.location));
            d3.select(this)
                .append("text")
                .attr("x", 20)
                .attr("y", 10)
                .text(d.location)
                .style("font-size", "12px");
        });

    svg.append("text")
        .attr("x", 0)
        .attr("y", -height / 2 + 20)
        .attr("text-anchor", "middle")
        .text("Proporción de Ofertas por Ubicación (Top 10)");
}

function createTitleBarChart() {
    const container = d3.select("#titleBarChart");
    container.selectAll("*").remove();

    const width = container.node().getBoundingClientRect().width || 400;
    const height = 300;
    const margin = {top: 40, right: 30, bottom: 60, left: 60};

    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const titleData = d3.rollup(filteredData.filter(d => 
        (!selectedCategory || d.employment_type === selectedCategory) && 
        (!selectedLocation || d.location === selectedLocation) && 
        (!selectedSalary || (d.salary && d.salary <= selectedSalary))), 
        v => v.length,
        d => d.title || "No especificado"
    );

    const titleArray = Array.from(titleData, ([key, value]) => ({
        title: key,
        count: value
    })).sort((a, b) => b.count - a.count).slice(0, 10);

    const x = d3.scaleBand()
        .domain(titleArray.map(d => d.title))
        .range([0, width - margin.left - margin.right])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(titleArray, d => d.count)])
        .range([height - margin.top - margin.bottom, 0]);

    svg.selectAll(".bar")
        .data(titleArray)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.title))
        .attr("y", d => y(d.count))
        .attr("width", x.bandwidth())
        .attr("height", d => height - margin.top - margin.bottom - y(d.count))
        .attr("fill", d => selectedTitle === d.title ? "#ff6b6b" : "#3498db")
        .on("click", function(event, d) {
            selectedTitle = selectedTitle === d.title ? null : d.title;
            updateVisualizations();
        })
        .on("mouseover", function(event, d) {
            showTooltip(event, `
                <strong>${d.title}</strong><br>
                Total: ${d.count} ofertas
            `);
        })
        .on("mouseout", hideTooltip);

    svg.append("g")
        .attr("class", "axis axis-x")
        .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g")
        .attr("class", "axis axis-y")
        .call(d3.axisLeft(y));

    svg.append("text")
        .attr("class", "chart-title")
        .attr("x", (width - margin.left - margin.right) / 2)
        .attr("y", -15)
        .attr("text-anchor", "middle")
        .text("Distribución de Ofertas por Título (Top 10)");
}

function createTitleWordCloud() {
    const container = d3.select("#titleWordCloud");
    container.selectAll("*").remove();

    const width = container.node().getBoundingClientRect().width || 400;
    const height = 300;

    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    const words = filteredData
        .filter(d => (!selectedCategory || d.employment_type === selectedCategory) && 
                     (!selectedLocation || d.location === selectedLocation) && 
                     (!selectedSalary || (d.salary && d.salary <= selectedSalary)))
        .map(d => d.title || "")
        .join(" ")
        .toLowerCase()
        .replace(/[^a-zA-Z\s]/g, "")
        .split(/\s+/);


    const wordFreq = {};
    words.forEach(word => {
        if (word.length > 2) { // Ignorar palabras muy cortas
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
    });

    const wordArray = Object.entries(wordFreq)
        .map(([word, count]) => ({text: word, size: count}))
        .sort((a, b) => b.size - a.size)
        .slice(0, 50); // Top 50 palabras

    const maxSize = d3.max(wordArray, d => d.size);
    const fontSize = d3.scaleLinear()
        .domain([0, maxSize])
        .range([10, 50]);

    d3.layout.cloud()
        .size([width, height])
        .words(wordArray)
        .padding(5)
        .rotate(() => ~~(Math.random() * 2) * 90)
        .fontSize(d => fontSize(d.size))
        .on("end", draw)
        .start();

    function draw(words) {
        svg.selectAll("text")
            .data(words)
            .enter()
            .append("text")
            .style("font-size", d => `${d.size}px`)
            .style("fill", d => selectedTitle && d.text.includes(selectedTitle.split(" ")[0]) ? "#ff6b6b" : "#3498db")
            .attr("text-anchor", "middle")
            .attr("transform", d => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
            .text(d => d.text)
            .on("click", function(event, d) {
                const fullTitleMatch = filteredData.find(f => f.title && f.title.toLowerCase().includes(d.text));
                selectedTitle = selectedTitle === (fullTitleMatch ? fullTitleMatch.title : null) ? null : (fullTitleMatch ? fullTitleMatch.title : null);
                updateVisualizations();
            })
            .on("mouseover", function(event, d) {
                showTooltip(event, `
                    <strong>${d.text}</strong><br>
                    Frecuencia: ${d.size}
                `);
            })
            .on("mouseout", hideTooltip);
    }

    svg.append("text")
        .attr("x", 0)
        .attr("y", -height / 2 + 20)
        .attr("text-anchor", "middle")
        .text("Nube de Palabras de Títulos");
}

// 1. Visualización de Pipeline
function createPipelineVisualization() {
    const container = d3.select("#pipeline-viz");
    container.selectAll("*").remove();
    
    const width = container.node().getBoundingClientRect().width;
    const height = 150;
    const margin = {top: 20, right: 20, bottom: 30, left: 20};
    
    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height);
    
    // Datos para el pipeline (ejemplo)
    const pipelineData = [
        {stage: "Total", value: filteredData.length, color: "#3498db"},
        {stage: "Fraudulentas", value: d3.sum(filteredData, d => d.fraudulent), color: "#e74c3c"},
        {stage: "Reales", value: filteredData.length - d3.sum(filteredData, d => d.fraudulent), color: "#2ecc71"},
        {stage: "Analizadas", value: filteredData.length, color: "#f39c12"}
    ];
    
    const x = d3.scaleLinear()
        .domain([0, d3.max(pipelineData, d => d.value)])
        .range([margin.left, width - margin.right]);
    
    // Crear barras del pipeline
    svg.selectAll(".pipeline-bar")
        .data(pipelineData)
        .enter()
        .append("rect")
        .attr("class", "pipeline-bar")
        .attr("x", margin.left)
        .attr("y", (d, i) => margin.top + i * 25)
        .attr("width", d => x(d.value) - margin.left)
        .attr("height", 20)
        .attr("fill", d => d.color)
        .attr("rx", 3)
        .attr("ry", 3);
    
    // Etiquetas de las barras
    svg.selectAll(".pipeline-label")
        .data(pipelineData)
        .enter()
        .append("text")
        .attr("class", "pipeline-label")
        .attr("x", margin.left + 5)
        .attr("y", (d, i) => margin.top + i * 25 + 15)
        .text(d => `${d.stage}: ${d.value}`)
        .attr("fill", "white")
        .style("font-size", "12px")
        .style("font-weight", "bold");
}

// 2. Gráfico de Tipo de Empleo vs. Fraude
function createEmploymentTypeChart() {
    const container = d3.select("#employmentTypeChart");
    container.selectAll("*").remove();
    
    const width = container.node().getBoundingClientRect().width;
    const height = 300;
    const margin = {top: 40, right: 30, bottom: 60, left: 60};
    
    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const typeData = d3.rollup(filteredData.filter(d => 
        (!selectedLocation || d.location === selectedLocation) && 
        (!selectedTitle || d.title === selectedTitle) && 
        (!selectedSalary || (d.salary && d.salary <= selectedSalary))), 
        v => ({
            total: v.length,
            fraudulent: d3.sum(v, d => d.fraudulent),
            ratio: d3.sum(v, d => d.fraudulent) / v.length
        }),
        d => d.employment_type
    );
    
    const typeArray = Array.from(typeData, ([key, value]) => ({type: key, ...value}))
        .sort((a, b) => b.ratio - a.ratio);
    
    const x = d3.scaleBand()
        .domain(typeArray.map(d => d.type))
        .range([0, width - margin.left - margin.right])
        .padding(0.2);
        
    const y = d3.scaleLinear()
        .domain([0, d3.max(typeArray, d => d.ratio)])
        .range([height - margin.top - margin.bottom, 0]);
    
    svg.selectAll(".bar")
        .data(typeArray)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.type))
        .attr("y", d => y(d.ratio))
        .attr("width", x.bandwidth())
        .attr("height", d => height - margin.top - margin.bottom - y(d.ratio))
        .attr("fill", d => selectedCategory === d.type ? "#ff6b6b" : (d.ratio > 0.1 ? "#e74c3c" : "#2ecc71"))
        .on("click", function(event, d) {
            selectedCategory = selectedCategory === d.type ? null : d.type;
            updateVisualizations();
        })
        .on("mouseover", function(event, d) {
            showTooltip(event, `
                <strong>${d.type || "No especificado"}</strong><br>
                Total: ${d.total} ofertas<br>
                Fraudulentas: ${d.fraudulent}<br>
                Tasa: ${(d.ratio * 100).toFixed(1)}%
            `);
        })
        .on("mouseout", hideTooltip);
    
    svg.append("g")
        .attr("class", "axis axis-x")
        .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
        .call(d3.axisBottom(x));
        
    svg.append("g")
        .attr("class", "axis-y")
        .call(d3.axisLeft(y).ticks(5, "%"));
    
    svg.append("text")
        .attr("class", "chart-title")
        .attr("x", (width - margin.left - margin.right) / 2)
        .attr("y", -15)
        .attr("text-anchor", "middle")
        .text("Tasa de Fraude por Tipo de Empleo");
}

function createDescriptionLengthChart() {
    const container = d3.select("#descriptionLengthChart");
    container.selectAll("*").remove();
    
    const width = container.node().getBoundingClientRect().width || 400;
    const height = 300;
    const margin = {top: 50, right: 50, bottom: 60, left: 60};
    
    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const data = filteredData.filter(d => 
        (!selectedCategory || d.employment_type === selectedCategory) && 
        (!selectedLocation || d.location === selectedLocation) && 
        (!selectedTitle || d.title === selectedTitle) && 
        (!selectedSalary || (d.salary && d.salary <= selectedSalary)));
    
    data.forEach(d => {
        d.descriptionLength = d.description ? d.description.length : 0;
    });
    
    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.descriptionLength)])
        .range([0, width - margin.left - margin.right]);
    
    const y = d3.scaleLinear()
        .domain([0, 1])
        .range([height - margin.top - margin.bottom, 0]);
    
    const binSize = 100;
    const bins = d3.range(0, d3.max(data, d => d.descriptionLength) + binSize, binSize);
    
    const binnedData = bins.map(bin => {
        const lower = bin;
        const upper = bin + binSize;
        const inBin = data.filter(d => d.descriptionLength >= lower && d.descriptionLength < upper);
        const total = inBin.length;
        const fraudulent = d3.sum(inBin, d => d.fraudulent);
        
        return {
            bin: bin,
            total: total,
            fraudulent: fraudulent,
            ratio: total > 0 ? fraudulent / total : 0
        };
    }).filter(d => d.total > 0);
    
    const line = d3.line()
        .x(d => x(d.bin + binSize / 2))
        .y(d => y(d.ratio));
    
    svg.append("path")
        .datum(binnedData)
        .attr("class", "trend-line")
        .attr("d", line)
        .attr("stroke", "#ff6b6b")
        .attr("stroke-width", 3)
        .attr("fill", "none");
    
    const histogram = d3.histogram()
        .value(d => d.descriptionLength)
        .domain(x.domain())
        .thresholds(bins);
        
    const bins2 = histogram(data);
    
    svg.selectAll(".bar")
        .data(bins2)
        .enter()
        .append("rect")
        .attr("x", d => x(d.x0))
        .attr("y", d => y(d.length / d3.max(bins2, d => d.length)))
        .attr("width", d => x(d.x1) - x(d.x0) - 1)
        .attr("height", d => height - margin.top - margin.bottom - y(d.length / d3.max(bins2, d => d.length)))
        .attr("fill", "#4ecdc4")
        .attr("opacity", 0.6)
        .on("mouseover", function(event, d) {
            showTooltip(event, `
                <strong>Longitud: ${d.x0}-${d.x1} caracteres</strong><br>
                Total: ${d.length} ofertas<br>
                Fraudulentas: ${d3.sum(d, d => d.fraudulent)}<br>
                Tasa: ${(d3.sum(d, d => d.fraudulent) / d.length * 100).toFixed(1)}%
            `);
        })
        .on("mouseout", hideTooltip);

    
    svg.append("g")
        .attr("class", "axis-x")
        .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
        .call(d3.axisBottom(x));
    
    svg.append("g")
        .attr("class", "axis-y")
        .call(d3.axisLeft(y).ticks(5, "%"));
    
    svg.append("text")
        .attr("x", (width - margin.left - margin.right) / 2)
        .attr("y", -15)
        .attr("text-anchor", "middle")
        .text("Longitud de la Descripción vs. Tasa de Fraude");
    
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -(height - margin.top - margin.bottom) / 2)
        .attr("text-anchor", "middle")
        .text("Tasa de Fraude");
    
    const legend = svg.append("g")
        .attr("transform", `translate(${width - margin.right - 100}, 10)`);
    
    legend.append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", "#ff6b6b");
    
    legend.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .text("Tasa de Fraude")
        .style("font-size", "12px");
    
    legend.append("rect")
        .attr("y", 20)
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", "#4ecdc4")
        .attr("opacity", 0.6);
    
    legend.append("text")
        .attr("x", 20)
        .attr("y", 32)
        .text("Distribución de Longitudes")
        .style("font-size", "12px");
}

// Tooltip functions (unchanged)
function showTooltip(event, html) {
    const tooltip = d3.select("#tooltip");
    tooltip.html(html)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px")
        .classed("hidden", false);
}

function hideTooltip() {
    d3.select("#tooltip").classed("hidden", true);
}

// Función para obtener las coordenadas de una ubicación usando OpenCage API
function getCoordinates(location) {
    const apiKey = 'c3c997706b4247bab60f472b86aaca61';  // Sustituye con tu API Key de OpenCage
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${apiKey}`;

    return fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.results && data.results.length > 0) {
                const firstResult = data.results[0];
                return {
                    lat: firstResult.geometry.lat,
                    lng: firstResult.geometry.lng
                };
            } else {
                return null;  // Si no se encuentra la ubicación
            }
        })
        .catch(error => {
            console.error('Error al obtener coordenadas:', error);
            return null;
        });
}

function createGeoDistributionMap() {
    const container = d3.select("#geoDistributionMap");
    container.selectAll("*").remove();

    const width = container.node().getBoundingClientRect().width || 800;
    const height = 300;

    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height);

    // Usar filteredData igual que createDescriptionLengthChart
    const data = filteredData.filter(d => 
        (!selectedCategory || d.employment_type === selectedCategory) && 
        (!selectedLocation || d.location === selectedLocation) && 
        (!selectedTitle || d.title === selectedTitle) && 
        (!selectedSalary || (d.salary && d.salary <= selectedSalary)));

    // Procesar datos: agrupar por ubicación
    const locationData = d3.rollup(data, 
        v => ({
            total: v.length,
            fraudulent: d3.sum(v, d => d.fraudulent),
            ratio: d3.sum(v, d => d.fraudulent) / v.length
        }),
        d => d.location
    );

    // Convertir a array y limpiar datos
    const locationArray = Array.from(locationData, ([key, value]) => ({
        location: key,
        ...value
    })).filter(d => d.location && d.location.trim() !== "");

    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(function(geojson) {
        const projection = d3.geoMercator()
            .fitSize([width, height], geojson);

        const path = d3.geoPath().projection(projection);

        const g = svg.append("g");

        // Zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
            });

        svg.call(zoom);

        // Dibujar países
        g.selectAll(".country")
            .data(geojson.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", "#ddd")
            .attr("stroke", "#fff");

        // Agregar puntos para ubicaciones (simplificado)
        // En una implementación real, necesitarías geocodificar las ubicaciones
        // Esto es un ejemplo simplificado
        locationArray.forEach(d => {
            // En una implementación real, usarías un servicio de geocodificación
            // Aquí asignamos posiciones aleatorias como ejemplo
            const randomX = Math.random() * width;
            const randomY = Math.random() * height;
            
            svg.append("circle")
                .attr("cx", randomX)
                .attr("cy", randomY)
                .attr("r", Math.sqrt(d.total) / 2)
                .attr("fill", d.ratio > 0.1 ? "rgba(255, 0, 0, 0.5)" : "rgba(0, 0, 255, 0.5)")
                .attr("stroke", "#ffffff")
                .attr("stroke-width", 0.5)
                .on("mouseover", function(event) {
                    showTooltip(event, `
                        <strong>${d.location || "Unknown"}</strong><br>
                        Total: ${d.total} ofertas<br>
                        Fraudulentas: ${d.fraudulent}<br>
                        Tasa: ${(d.ratio * 100).toFixed(1)}%
                    `);
                })
                .on("mouseout", hideTooltip);
        });

        // Título
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", 30)
            .attr("text-anchor", "middle")
            .text("Distribución Geográfica de Ofertas Fraudulentas");

        // Leyenda
        const legend = svg.append("g")
            .attr("transform", `translate(${width - 150},50)`);

        legend.append("circle")
            .attr("cx", 10)
            .attr("cy", 10)
            .attr("r", 5)
            .attr("fill", "rgba(255, 0, 0, 0.5)");

        legend.append("text")
            .attr("x", 25)
            .attr("y", 15)
            .text("Alta tasa de fraude (>10%)")
            .style("font-size", "12px");

        legend.append("circle")
            .attr("cx", 10)
            .attr("cy", 30)
            .attr("r", 5)
            .attr("fill", "rgba(0, 0, 255, 0.5)");

        legend.append("text")
            .attr("x", 25)
            .attr("y", 35)
            .text("Baja tasa de fraude")
            .style("font-size", "12px");
    });
}

function createRequirementsChart() {
    const container = d3.select("#requirementsChart");
    container.selectAll("*").remove();

    const width = container.node().getBoundingClientRect().width || 800;
    const margin = {top: 50, right: 50, bottom: 50, left: 50};
    const height = 300 - margin.top - margin.bottom;

    const data = filteredData.filter(d => 
        (!selectedCategory || d.employment_type === selectedCategory) && 
        (!selectedLocation || d.location === selectedLocation) && 
        (!selectedTitle || d.title === selectedTitle) && 
        (!selectedSalary || (d.salary && d.salary <= selectedSalary)));

    const requirementsList = ["experience", "education", "skills", "requirements"];
    const reqData = requirementsList.map(req => {
        const withReq = data.filter(d => d[req] && d[req].trim() !== "");
        const withoutReq = data.filter(d => !d[req] || d[req].trim() === "");

        return {
            requirement: req,
            withReq: {
                total: withReq.length,
                fraudulent: d3.sum(withReq, d => d.fraudulent),
                ratio: withReq.length > 0 ? d3.sum(withReq, d => d.fraudulent) / withReq.length : 0
            },
            withoutReq: {
                total: withoutReq.length,
                fraudulent: d3.sum(withoutReq, d => d.fraudulent),
                ratio: withoutReq.length > 0 ? d3.sum(withoutReq, d => d.fraudulent) / withoutReq.length : 0
            }
        };
    });

    const svg = container
        .append("svg")
        .attr("width", width)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x0 = d3.scaleBand()
        .domain(reqData.map(d => d.requirement))
        .range([0, width - margin.left - margin.right])
        .padding(0.2);

    const x1 = d3.scaleBand()
        .domain(["with", "without"])
        .range([0, x0.bandwidth()])
        .padding(0.1);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(reqData, d => Math.max(d.withReq.ratio, d.withoutReq.ratio))])
        .range([height, 0]);

    svg.selectAll(".bars")
        .data(reqData)
        .enter()
        .append("g")
        .attr("transform", d => `translate(${x0(d.requirement)},0)`)
        .selectAll(".bar")
        .data(d => [
            {type: "With", value: d.withReq.ratio, count: d.withReq.total, requirement: d.requirement},
            {type: "Without", value: d.withoutReq.ratio, count: d.withoutReq.total, requirement: d.requirement}
        ])
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x1(d.type))
        .attr("y", d => y(d.value))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", d => d.type === "with" ? "#4ecdc4" : "#ff6b6b")
        .on("mouseover", function(event, d) {
            showTooltip(event, `
                <strong>${d.type === "With" ? "Con" : "Sin"} ${d.requirement}</strong><br>
                Total: ${d.count} ofertas<br>
                Fraudulentas: ${Math.round(d.value * d.count)}<br>
                Tasa: ${(d.value * 100).toFixed(2)}%
            `);
        })
        .on("mouseout", hideTooltip);

    svg.append("g")
        .attr("class", "axis-x")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0));

    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y).ticks(5, "%"));

    svg.append("text")
        .attr("x", (width - margin.left - margin.right) / 2)
        .attr("y", -15)
        .attr("text-anchor", "middle")
        .text("Presencia de Requisitos vs. Tasa de Fraude");

    svg.append("text")
        .attr("x", (width - margin.left - margin.right) / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .text("Tipo de Requisito");
    
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -height / 2)
        .attr("text-anchor", "middle")
        .text("Tasa de Fraude");
    
    const legendContainer = svg.append("g")
        .attr("transform", `translate(${width - margin.right - 100}, 10)`);
    
    legendContainer.append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", "#4ecdc4");

    legendContainer.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .text("Con requisito")
        .style("font-size", "12px");

    legendContainer.append("rect")
        .attr("y", 20)
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", "#ff6b6b");

    legendContainer.append("text")
        .attr("x", 20)
        .attr("y", 32)
        .text("Sin requisito")
        .style("font-size", "12px");
}

function createFraudByIndustryChart() {
    const container = d3.select("#fraudByIndustry");
    container.selectAll("*").remove();

    const width = container.node().getBoundingClientRect().width || 400;
    const margin = {top: 50, right: 50, bottom: 60, left: 120};
    const height = 400 - margin.top - margin.bottom;
    
    const svg = container
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    const industryData = d3.rollup(filteredData.filter(d => 
        (!selectedCategory || d.employment_type === selectedCategory) && 
        (!selectedLocation || d.location === selectedLocation) && 
        (!selectedTitle || d.title === selectedTitle) && 
        (!selectedSalary || (d.salary && d.salary <= selectedSalary))), 
        v => ({
            total: v.length,
            fraudulent: d3.sum(v, d => d.fraudulent),
            ratio: d3.sum(v, d => d.fraudulent) / v.length
        }),
        d => d.industry
    );

    const industryArray = Array.from(industryData, ([key, value]) => ({
        industry: key || "No especificado",
        ...value
    })).filter(d => d.total > 10)
        .sort((a, b) => b.ratio - a.ratio)
        .slice(0, 20);

    const x = d3.scaleLinear()
        .domain([0, d3.max(industryArray, d => d.ratio)])
        .range([0, width - margin.left - margin.right]);
    
    const y = d3.scaleBand()
        .domain(industryArray.map(d => d.industry))
        .range([0, height])
        .padding(0.2);

    svg.selectAll(".bar")
        .data(industryArray)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("y", d => y(d.industry))
        .attr("height", y.bandwidth())
        .attr("x", 0)
        .attr("width", d => x(d.ratio))
        .attr("fill", d => d.ratio > 0.1 ? "#ff6b6b" : "#4ecdc4")
        .on("mouseover", function(event, d) {
            showTooltip(event, `
                <strong>${d.industry}</strong><br>
                Total: ${d.total} ofertas<br>
                Fraudulentas: ${d.fraudulent}<br>
                Tasa: ${(d.ratio * 100).toFixed(1)}%
            `);
        })
        .on("mouseout", hideTooltip);

    svg.append("g")
        .attr("class", "axis-x")
        .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(5, "%"));
        
    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y));

    svg.append("text")
        .attr("x", (width - margin.left - margin.right) / 2)
        .attr("y", -15)
        .attr("text-anchor", "middle")
        .text("Top 20 Tasa de Fraude por Industria (solo industrias con >10 ofertas)");
}

// 7. Gráfico de Tendencias Temporales (Barras Apiladas: Total vs Fraudulentas)
function createTemporalTrendsChart() {
    const container = d3.select("#temporalTrendsChart");
    container.selectAll("*").remove();

    const width = container.node().getBoundingClientRect().width || 400;
    const height = 300;
    const margin = {top: 40, right: 30, bottom: 60, left: 60};

    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const yearData = d3.rollup(filteredData.filter(d => 
        (!selectedCategory || d.employment_type === selectedCategory) && 
        (!selectedLocation || d.location === selectedLocation) && 
        (!selectedTitle || d.title === selectedTitle) && 
        (!selectedSalary || (d.salary && d.salary <= selectedSalary))), 
        v => ({
            total: v.length,
            fraudulent: d3.sum(v, d => d.fraudulent)
        }),
        d => d.year
    );

    const yearArray = Array.from(yearData, ([key, value]) => ({
        year: key,
        total: value.total,
        fraudulent: value.fraudulent,
        real: value.total - value.fraudulent
    })).sort((a, b) => a.year - b.year);

    const x = d3.scaleBand()
        .domain(yearArray.map(d => d.year))
        .range([0, width - margin.left - margin.right])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(yearArray, d => d.total)])
        .range([height - margin.top - margin.bottom, 0]);

    svg.selectAll(".bar-total")
        .data(yearArray)
        .enter()
        .append("rect")
        .attr("class", "bar-real")
        .attr("x", d => x(d.year))
        .attr("y", d => y(d.real))
        .attr("width", x.bandwidth())
        .attr("height", d => y(0) - y(d.real))
        .attr("fill", "#2ecc71")
        .on("mouseover", function(event, d) {
            showTooltip(event, `
                <strong>Año ${d.year}</strong><br>
                Ofertas reales: ${d.real}
            `);
        })
        .on("mouseout", hideTooltip);

    svg.selectAll(".bar-fraud")
        .data(yearArray)
        .enter()
        .append("rect")
        .attr("class", "bar-fraud")
        .attr("x", d => x(d.year))
        .attr("y", d => y(d.real + d.fraudulent))
        .attr("width", x.bandwidth())
        .attr("height", d => y(0) - y(d.fraudulent))
        .attr("fill", "#e74c3c")
        .on("mouseover", function(event, d) {
            showTooltip(event, `
                <strong>Año ${d.year}</strong><br>
                Ofertas fraudulentas: ${d.fraudulent}
            `);
        })
        .on("mouseout", hideTooltip);

    svg.append("g")
        .attr("class", "axis axis-x")
        .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("class", "axis axis-y")
        .call(d3.axisLeft(y));

    svg.append("text")
        .attr("class", "chart-title")
        .attr("x", (width - margin.left - margin.right) / 2)
        .attr("y", -15)
        .attr("text-anchor", "middle")
        .text("Ofertas Totales y Fraudulentas por Año");

    const legend = svg.append("g")
        .attr("transform", `translate(${(width - margin.left - margin.right) - 150},10)`);

    legend.append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", "#e74c3c");

    legend.append("text")
        .attr("x", 20)
        .attr("y", 10)
        .text("Fraudulentas")
        .style("font-size", "12px");

    legend.append("rect")
        .attr("y", 20)
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", "#2ecc71");

    legend.append("text")
        .attr("x", 20)
        .attr("y", 30)
        .text("Reales")
        .style("font-size", "12px");
}

//8. Gráfico de Radar de Requisitos
function createRequirementsRadarChart() {
    const container = d3.select("#requirementsRadarChart");
    container.selectAll("*").remove();

    const width = container.node().getBoundingClientRect().width || 800;
    const height = 400;
    const margin = {top: 100, right: 60, bottom: 60, left: 60};
    const radius = Math.min(width, height) / 2 - Math.max(margin.top, margin.right, margin.bottom, margin.left);

    const realJobs = filteredData.filter(d => !d.fraudulent && 
        (!selectedCategory || d.employment_type === selectedCategory) && 
        (!selectedLocation || d.location === selectedLocation) && 
        (!selectedTitle || d.title === selectedTitle) && 
        (!selectedSalary || (d.salary && d.salary <= selectedSalary)));
    const fraudJobs = filteredData.filter(d => d.fraudulent && 
        (!selectedCategory || d.employment_type === selectedCategory) && 
        (!selectedLocation || d.location === selectedLocation) && 
        (!selectedTitle || d.title === selectedTitle) && 
        (!selectedSalary || (d.salary && d.salary <= selectedSalary)));

    const metrics = [
        {name: "Perfil de Compañia", real: calculateSpecificity(realJobs, "company_profile"), fraud: calculateSpecificity(fraudJobs, "company_profile")},
        {name: "Experiencia", real: calculateSpecificity(realJobs, "required_experience"), fraud: calculateSpecificity(fraudJobs, "required_experience")},
        {name: "Beneficios", real: calculateSpecificity(realJobs, "benefits"), fraud: calculateSpecificity(fraudJobs, "benefits")},
        {name: "Requisitos", real: calculateSpecificity(realJobs, "requirements"), fraud: calculateSpecificity(fraudJobs, "requirements")},
        {name: "Descripción", real: d3.mean(realJobs, d => d.description ? d.description.length / 1000 : 0) || 0, fraud: d3.mean(fraudJobs, d => d.description ? d.description.length / 1000 : 0) || 0}
    ];

    const rScale = d3.scaleLinear()
        .domain([0, 1])
        .range([0, radius]);

    const angleSlice = Math.PI * 2 / metrics.length;

    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width/2},${height/2})`);

    const axis = svg.append("g")
        .attr("class", "axis");

    axis.selectAll(".axis-line")
        .data(metrics)
        .enter()
        .append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", (d, i) => Math.cos(angleSlice * i - Math.PI / 2) * radius)
        .attr("y2", (d, i) => Math.sin(angleSlice * i - Math.PI / 2) * radius)
        .attr("stroke", "#ddd")
        .attr("stroke-width", 1);

    axis.selectAll(".axis-label")
        .data(metrics)
        .enter()
        .append("text")
        .attr("class", "axis-label")
        .attr("x", (d, i) => Math.cos(angleSlice * i - Math.PI / 2) * (radius + 20))
        .attr("y", (d, i) => Math.sin(angleSlice * i - Math.PI / 2) * (radius + 20))
        .text(d => d.name)
        .style("font-size", "12px")
        .style("text-anchor", "middle");

    const circles = [0.2, 0.4, 0.6, 0.8, 1];

    svg.append("g")
        .selectAll(".grid-circle")
        .data(circles)
        .enter()
        .append("circle")
        .attr("class", "grid-circle")
        .attr("r", d => radius * d)
        .attr("fill", "none")
        .attr("stroke", "#ddd")
        .attr("stroke-width", 0.5);

    const realArea = metrics.map((d, i) => ({
        x: Math.cos(angleSlice * i - Math.PI / 2) * rScale(d.real),
        y: Math.sin(angleSlice * i - Math.PI / 2) * rScale(d.real)
    }));

    const fraudArea = metrics.map((d, i) => ({
        x: Math.cos(angleSlice * i - Math.PI / 2) * rScale(d.fraud),
        y: Math.sin(angleSlice * i - Math.PI / 2) * rScale(d.fraud)
    }));

    const realLine = d3.line()
        .x(d => d.x)
        .y(d => d.y)
        .curve(d3.curveLinearClosed);

    svg.append("path")
        .datum(realArea)
        .attr("class", "radar-area")
        .attr("d", realLine)
        .attr("fill", "rgba(46, 204, 113, 0.4)")
        .attr("stroke", "#2ecc71")
        .attr("stroke-width", 2)
        .on("mouseover", function(event) {
            d3.select(this).attr("fill", "rgba(46, 204, 113, 0.7)");
            showTooltip(event, "<strong>Ofertas Reales</strong><br>Requisitos más específicos");
        })
        .on("mouseout", function() {
            d3.select(this).attr("fill", "rgba(46, 204, 113, 0.4)");
            hideTooltip();
        });

    const fraudLine = d3.line()
        .x(d => d.x)
        .y(d => d.y)
        .curve(d3.curveLinearClosed);

    svg.append("path")
        .datum(fraudArea)
        .attr("class", "radar-area")
        .attr("d", fraudLine)
        .attr("fill", "rgba(231, 76, 60, 0.4)")
        .attr("stroke", "#e74c3c")
        .attr("stroke-width", 2)
        .on("mouseover", function(event) {
            d3.select(this).attr("fill", "rgba(231, 76, 60, 0.7)");
            showTooltip(event, "<strong>Ofertas Fraudulentas</strong><br>Requisitos menos específicos");
        })
        .on("mouseout", function() {
            d3.select(this).attr("fill", "rgba(231, 76, 60, 0.4)");
            hideTooltip();
        });

    svg.selectAll(".real-dot")
        .data(realArea)
        .enter()
        .append("circle")
        .attr("class", "real-dot")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", 3)
        .attr("fill", "#2ecc71")
        .on("mouseover", function(event, d, i) {
            showTooltip(event, `
                <strong>${metrics[i].name}</strong><br>
                Ofertas Reales: ${(metrics[i].real * 1000).toFixed(0)} caracteres
            `);
        })
        .on("mouseout", hideTooltip);

    svg.selectAll(".fraud-dot")
        .data(fraudArea)
        .enter()
        .append("circle")
        .attr("class", "fraud-dot")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", 3)
        .attr("fill", "#e74c3c")
        .on("mouseover", function(event, d, i) {
            showTooltip(event, `
                <strong>${metrics[i].name}</strong><br>
                Ofertas Fraudulentas: ${(metrics[i].fraud * 1000).toFixed(0)} caracteres
            `);
        })
        .on("mouseout", hideTooltip);

    svg.append("text")
        .attr("x", 0)
        .attr("y", -radius - 50)
        .attr("text-anchor", "middle")
        .text("Especificidad de Requisitos: Reales vs. Fraudulentas");

    const legend = svg.append("g")
        .attr("transform", `translate(${radius - 100}, ${radius + 20})`);

    legend.append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", "#2ecc71");

    legend.append("text")
        .attr("x", 20)
        .attr("y", 10)
        .text("Reales")
        .style("font-size", "12px");

    legend.append("rect")
        .attr("y", 20)
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", "#e74c3c");

    legend.append("text")
        .attr("x", 20)
        .attr("y", 30)
        .text("Fraudulentas")
        .style("font-size", "12px");
}

// Función auxiliar para calcular especificidad (adaptar según tus datos)
function calculateSpecificity(jobs, field) {
    return d3.mean(jobs, d => (d[field] && d[field].trim().length > 0) ? d[field].trim().length / 1000 : 0) || 0;
}