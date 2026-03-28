const preferences = {
    outcomes: 5,
    satisfaction: 5,
    research: 5,
    cost: 5,
};

const sliders = document.querySelectorAll(".slider");
const editedSliders = new Set();

function updateSlider(slider) {
    const percent = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.background = `linear-gradient(to right, #e74c3c ${percent}%, #f5ecd7 ${percent}%)`;
    
    // Update display number
    const card = slider.closest(".ratings");
    card.querySelector(".big").textContent = slider.value;
    
    const sliderId = slider.id.replace('Slider', '').toLowerCase();
    preferences[sliderId] = parseInt(slider.value);
}

function updateProgress() {
    const count = editedSliders.size;
    const percent = (count / 4) * 100;
    const fill = document.querySelector("#progress-bar-fill");
    
    fill.style.width = `${percent}%`;
    document.querySelector("#progress-num").textContent = count;
    fill.style.borderRadius = count === 4 ? "5px" : "5px 0 0 5px";

    if (count === 4) {
        button.style.opacity = "1";
        button.style.pointerEvents = "auto";
        button.style.cursor = "pointer";
    } else {
        button.style.opacity = "0.5";
        button.style.pointerEvents = "none";
        button.style.cursor = "not-allowed";
    }
}

const button = document.getElementById("btn-wrapper");
button.style.opacity = "0.5";
button.style.pointerEvents = "none";
button.style.cursor = "not-allowed";

sliders.forEach((slider) => {
    updateSlider(slider);
    slider.addEventListener("input", () => {
        updateSlider(slider);
        editedSliders.add(slider.id);
        updateProgress();
    });
});

document.getElementById("btn-wrapper").addEventListener("click", async () => {
    const button = document.getElementById("btn-wrapper");
    const originalText = button.textContent;
    button.style.opacity = "0.8";
    button.style.pointerEvents = "none";
    button.textContent = "Generating Results...";

    const filters = {
        categories: window.categorySelector.getSelectedValues(),
        locations: window.locationSelector.getSelectedValues(),
        universities: window.universitySelector.getSelectedValues(),
        degreeTypes: window.degreeSelector.getSelectedValues(),
        courseNames: window.courseSelector.getSelectedValues(),
        grades: window.gradesSelector.getSelectedValues(),
        gradesType: document.querySelector('input[name="grade-type"]:checked')?.value || null
    };

    try{
        const response = await fetch('http://localhost:5000/api/get-results', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                preferences: preferences,
                filters: filters,
            })
            });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('courseResults', JSON.stringify(data.courses));
            localStorage.setItem('userPreferences', JSON.stringify(preferences));
            localStorage.setItem('userFilters', JSON.stringify(filters));
    
            window.location.href = 'Results.html';
        }   else {
                alert('Error getting recommendations: ' + data.error);
                button.textContent = originalText;
                button.style.opacity = "1";
                button.style.pointerEvents = "auto";
            }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to connect to server. Make sure Flask is running on localhost:5000');
        button.textContent = originalText;
        button.style.opacity = "1";
        button.style.pointerEvents = "auto";
        button.style.cursor = "pointer";
    }


});
