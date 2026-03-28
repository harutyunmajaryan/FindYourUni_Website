window.addEventListener('DOMContentLoaded', () => {
    const preferencesData = localStorage.getItem('userPreferences');
    
    if (preferencesData) {
        const preferences = JSON.parse(preferencesData);
        
        setSliderValue('satisfaction_input', 'satisfaction', preferences.satisfaction);
        setSliderValue('earnings_input', 'earnings', preferences.outcomes);
        setSliderValue('research_input', 'research', preferences.research);
        setSliderValue('living_cost_input', 'living_cost', preferences.cost);
    }

    const form = document.querySelector('.main_form');
    form.addEventListener('submit', handleSubmit);
});

function setSliderValue(sliderId, labelId, value) {
    const slider = document.getElementById(sliderId);
    const label = document.getElementById(labelId);
    
    if (slider && label) {
        slider.value = value;
        label.textContent = value + '/10';
        
        const pct = (value / 10) * 100;
        slider.style.setProperty("--val", pct + "%");
    }
}

async function handleSubmit(e) {
    e.preventDefault();

    const newPreferences = {
        satisfaction: parseInt(document.getElementById('satisfaction_input').value),
        outcomes: parseInt(document.getElementById('earnings_input').value),
        research: parseInt(document.getElementById('research_input').value),
        cost: parseInt(document.getElementById('living_cost_input').value)
    };

    const filters = {
        categories: window.categorySelector.getSelectedValues(),
        locations: window.locationSelector.getSelectedValues(),
        universities: window.universitySelector.getSelectedValues(),
        degreeTypes: window.degreeSelector.getSelectedValues(),
        courseNames: window.courseSelector.getSelectedValues(),
        grades: window.gradesSelector.getSelectedValues(),
        gradesType: document.querySelector('input[name="grade-type"]:checked')?.value || null
    };

    const displayCountInput = document.getElementById('display-count');


    const rightPanel = document.querySelector('.right-panel');

    const existingCards = rightPanel.querySelectorAll('.course-card');
    existingCards.forEach(card => card.remove());
    
    const oldMessages = rightPanel.querySelectorAll('p');
    oldMessages.forEach(msg => msg.remove());
    
    const loadingMsg = document.createElement('p');
    loadingMsg.style.padding = '20px';
    loadingMsg.style.textAlign = 'center';
    loadingMsg.textContent = 'Updating results...';
    loadingMsg.id = 'loading-message';
    rightPanel.appendChild(loadingMsg);
    
    try {
        
        const response = await fetch('http://localhost:5000/api/get-results', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                preferences: newPreferences,
                filters: filters,
                num_results: parseInt(displayCountInput.value)
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            
            localStorage.setItem('courseResults', JSON.stringify(data.courses));
            localStorage.setItem('userPreferences', JSON.stringify(newPreferences));
            localStorage.setItem('userFilters', JSON.stringify(filters));
            
            const loading = document.getElementById('loading-message');
            if (loading) loading.remove();
    
            window.displayCourses(data.courses);
        }
    } catch (error) {
        console.error('Error fetching results:', error);
        const loading = document.getElementById('loading-message');
        if (loading) {
            loading.textContent = 'Failed to update results. Please try again.';
        }
    }
}
