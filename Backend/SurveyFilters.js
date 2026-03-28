class MultiSelectDropdown {
    constructor(inputId, dropdownId, tagsId, fetchFunction, options = {}) {
        this.input = document.getElementById(inputId);
        this.dropdown = document.getElementById(dropdownId);
        this.tagsContainer = document.getElementById(tagsId);
        this.fetchFunction = fetchFunction;
        
        this.freeText = options.freeText || false;
        this.allowDuplicates = options.allowDuplicates || false;
        this.readOnly = options.readOnly || false;
        this.selectedItems = this.allowDuplicates ? [] : new Set(); //if is grades dropdown, allowing duplicate items
        
        if (!this.input || !this.dropdown || !this.tagsContainer) {
            console.error('Missing element!');
            return;
        }
        
        this.init();
    }
    
    init() {
        if (this.readOnly) {
            this.input.setAttribute('readonly', 'true');
            this.input.style.cursor = 'pointer';
        }

        this.input.addEventListener('focus', async () => {
            const searchTerm = this.input.value.trim();
            await this.fetchAndShowOptions(searchTerm);
        });
        
        if (!this.readOnly) {
            this.input.addEventListener('input', async (e) => {
                const searchTerm = e.target.value.trim();
                await this.fetchAndShowOptions(searchTerm);
            });
        }
        
        document.addEventListener('click', (e) => {
            if (!this.input.contains(e.target) && !this.dropdown.contains(e.target) && !this.tagsContainer.contains(e.target)) {
                this.hideDropdown();
            }
        });

        if (this.freeText) {
            this.input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const value = this.input.value.trim();
                    if (value) {
                        this.addTag(value);
                        this.hideDropdown();
                    }
                }
            });
        }
    }
    
    async fetchAndShowOptions(searchTerm) {
        try {
            const options = await this.fetchFunction(searchTerm);
            this.displayOptions(options);
        } catch (error) {
            console.error('Error fetching options:', error);
        }
    }
    
    displayOptions(options) {
        if (options.length === 0) {
            this.dropdown.innerHTML = '<div class="no-results">No matches found</div>';
            this.showDropdown();
            return;
        }

        let headerHTML = '';
        if (this.freeText) {
            headerHTML = '<div class="dropdown-header">The following courses apply to your search:</div>';
        }
        
        
        const optionsHTML = options.map(option => {
            const isSelected = this.allowDuplicates ? false : this.selectedItems.has(option);
            return `
                <div class="dropdown-option ${isSelected ? 'selected' : ''}" data-value="${option}">
                    ${option}
                </div>
            `;
        }).join('');

        
        this.dropdown.innerHTML = headerHTML + optionsHTML;
        
        if (!this.freeText) {
            this.dropdown.querySelectorAll('.dropdown-option').forEach(optionEl => {
                optionEl.addEventListener('click', () => {
                    const value = optionEl.dataset.value;
                    this.toggleSelection(value);
                });
            });
        } else {
            this.dropdown.querySelectorAll('.dropdown-option').forEach(optionEl => {
                optionEl.addEventListener('click', () => {
                    const value = optionEl.dataset.value;
                    this.input.value = value;
                    this.input.focus();
                });
            });
        }
        
        this.showDropdown();
    }
    
    toggleSelection(value) {
        if (this.allowDuplicates) {
            this.addTag(value);
        } else{
            if (this.selectedItems.has(value)) {
                this.removeTag(value);
            } else {
                this.addTag(value);
            }
        
        
            const optionEl = this.dropdown.querySelector(`[data-value="${value}"]`);
            if (optionEl) {
                optionEl.classList.toggle('selected');
            }
        }
    }
    
    addTag(value) {
        const tagId = this.allowDuplicates ? Date.now() + Math.random() : value;

        if (this.allowDuplicates) {
            this.selectedItems.push(value);
        } else {
            this.selectedItems.add(value);
        }
        
        const tag = document.createElement('div');
        tag.className = 'tag';
        tag.dataset.value = value;
        tag.dataset.tagId = tagId;
        tag.innerHTML = `
            <span>${value}</span>
            <button class="tag-remove" aria-label="Remove ${value}">×</button>
        `;
        
        tag.querySelector('.tag-remove').addEventListener('click', () => {
            this.removeTag(value, tagId);
        });
        
        this.tagsContainer.appendChild(tag);
        this.input.value = '';
    }
    
    removeTag(value, tagId=null) {
        if (this.allowDuplicates){
            const tag = this.tagsContainer.querySelector(`[data-tag-id="${tagId}"]`);
            if (tag) {
                tag.remove();
                const index = this.selectedItems.indexOf(value);
                if (index > -1) {
                    this.selectedItems.splice(index, 1);
                }
            }
        } else{
            this.selectedItems.delete(value);
        
            const tag = this.tagsContainer.querySelector(`[data-value="${value}"]`);
            if (tag) {
                tag.remove();
            }
        
            const optionEl = this.dropdown.querySelector(`[data-value="${value}"]`);
            if (optionEl) {
                optionEl.classList.remove('selected');
            }
        }
    }
    
    getSelectedValues() {
        if (this.allowDuplicates) {
            return [...this.selectedItems];
        } else {
            return Array.from(this.selectedItems); 
        }
    }
    
    clearAll() {
        if (this.allowDuplicates) {
            this.selectedItems = [];  //Reset array
        } else {
            this.selectedItems.clear();  //Clear set
        }
        this.tagsContainer.innerHTML = '';
    }
    
    showDropdown() {
        this.dropdown.classList.add('show');
    }
    
    hideDropdown() {
        this.dropdown.classList.remove('show');
    }
}


async function fetchCategoryNames(searchTerm) {
    const response = await fetch('http://localhost:5000/api/fuzzy-search-categories', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({search_term:searchTerm})
    });
    
    const data = await response.json();
    return data.success ? data.matches : [];
}

async function fetchLocationNames(searchTerm) {
    const response = await fetch('http://localhost:5000/api/fuzzy-search-locations', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({search_term:searchTerm})
    })

    const data = await response.json();
    return data.success ? data.matches : [];
}

async function fetchUniversityNames(searchTerm) {
    const response = await fetch('http://localhost:5000/api/fuzzy-search-universities', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({search_term:searchTerm})
    })

    const data = await response.json();
    return data.success ? data.matches : [];
}

async function fetchDegreeNames(searchTerm) {
    const response = await fetch('http://localhost:5000/api/fuzzy-search-degree-type', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({search_term:searchTerm})
    })

    const data = await response.json();
    return data.success ? data.matches : [];
}

async function fetchALevelGradeOptions(searchTerm) {
    const allALevelGrades = ['A*', 'A', 'B', 'C', 'D', 'E'];

    if (!searchTerm) {
        return allALevelGrades;
    }
    
    return allALevelGrades.filter(grade => 
        grade.toLowerCase().includes(searchTerm.toLowerCase())
    );
}

async function fetchIBGradeOptions(searchTerm) {
    const allIBGrades = ['7', '6', '5', '4', '3', '2', '1'];

    if (!searchTerm) {
        return allIBGrades;
    }
    
    return allIBGrades.filter(grade => 
        grade.toLowerCase().includes(searchTerm.toLowerCase())
    );
}

async function fetchCourseNames(searchTerm) {
    const response = await fetch('http://localhost:5000/api/fuzzy-search-names', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({search_term: searchTerm})
    });
    
    const data = await response.json();
    return data.success ? data.matches : [];
}


// Initialize when page loads
window.addEventListener('DOMContentLoaded', () => {
    
    window.categorySelector = new MultiSelectDropdown(
        'course_category',
        'category-dropdown',
        'category-tags',
        fetchCategoryNames
    );

    window.courseSelector = new MultiSelectDropdown(
        'course',
        'course-dropdown',
        'course-tags',
        fetchCourseNames,
        {freeText:true}
    );

    window.locationSelector = new MultiSelectDropdown(
        'course_location',
        'location-dropdown',
        'location-tags',
        fetchLocationNames
    );

    window.universitySelector = new MultiSelectDropdown(
        'university',
        'university-dropdown',
        'university-tags',
        fetchUniversityNames
    );

    window.degreeSelector = new MultiSelectDropdown(
        'degree_type',
        'degree-dropdown',
        'degree-tags',
        fetchDegreeNames,
    );
    
    window.gradesSelector = new MultiSelectDropdown(
        'grade',
        'grade-dropdown',
        'grade-tags',
        fetchALevelGradeOptions,
        {
            readOnly:true,
            allowDuplicates:true,
        }
    );

    const gradeTypeRadios = document.querySelectorAll('input[name="grade-type"]');
    gradeTypeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        const selectedRadio = document.querySelector('input[name="grade-type"]:checked');
        if (selectedRadio){
            window.gradesSelector.clearAll();
            if (selectedRadio.id === 'checkbox1'){
                window.gradesSelector.fetchFunction = fetchALevelGradeOptions;
            } else {
                window.gradesSelector.fetchFunction = fetchIBGradeOptions;
                }
            }

        });
    });

});
