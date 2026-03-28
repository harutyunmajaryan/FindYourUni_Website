
window.displayCourses = displayCourses;
window.createCourseCard = createCourseCard;

window.addEventListener('DOMContentLoaded', () => {

    const displayCountInput = document.getElementById('display-count');

    const resultsData = localStorage.getItem('courseResults');

    if (!resultsData) {
        alert('No results found. Please complete the survey first.');
        window.location.href = 'SurveyPage.html';
        return;
    }

    const courses = JSON.parse(resultsData);
    displayCourses(courses);
});



function displayCourses(courses) {
    const rightPanel = document.querySelector('.right-panel');

    if (courses.length === 0) {
        
        const cards = rightPanel.querySelectorAll('.course-card');
        cards.forEach(card => card.remove());
        
        
        const message = document.createElement('p');
        message.textContent = 'No courses found matching your preferences.';
        rightPanel.appendChild(message);
        return;
    }

    
    const existingCards = rightPanel.querySelectorAll('.course-card');
    existingCards.forEach(card => card.remove());

    
    courses.forEach((course) => {
        const card = createCourseCard(course);
        rightPanel.appendChild(card);
    });
}

function createCourseCard(course) {
    const template = document.getElementById('course-card-template');
    const card = template.content.cloneNode(true);

    const rankFormatted = String(course.rank || 1).padStart(2, '0');
    const matchPercent = Math.round(course.Match_Percentage || 0);

    card.querySelector('.course-rank h2').textContent = rankFormatted;
    card.querySelector('.course-name').textContent = course.COURSE_NAME || 'Unknown Course';
    card.querySelector('.course-uni').textContent = course.UNIVERSITY_NAME || 'Unknown University';
    card.querySelector('.match-bar-fill').style.width = (course.Match_Percentage || 0) + '%';
    card.querySelector('.course-city').textContent = course.CITY || 'Unknown';
    card.querySelector('.course-region').textContent = course.Region || 'Unknown';
    card.querySelector('.big-score-num').textContent = matchPercent;



/////////////////////////////////////////////////////////////////////////
    // extension part

   const extend_button = card.querySelector('.extend-btn');
const cardDiv = card.querySelector('.course-card');
const img = extend_button.querySelector('.extend-img');
let isOpen = false;

extend_button.addEventListener('click', () => {
    if (isOpen) {
        const existing = cardDiv.nextElementSibling;
        if (existing && existing.classList.contains('extra-details')) {
            existing.remove();
        }
        img.src = 'websiteimages/ExtendCard.png';
        isOpen = false;
    } else {
        const extra = document.createElement('div');
        extra.className = 'extra-details';
        extra.innerHTML = `
    <div style="display: flex; gap: 20px; margin: 20px; margin-bottom: 15px;">
        <div style="flex: 1; background-color: #f5ecd7; border-radius: 10px; padding: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="color: #8b1e3f; font-weight: bold; font-size: 12px; margin-bottom: 8px; text-align: center;">Student Satisfaction</div>
            <div style="color: #d28d1e; font-weight: bold; font-size: 18px; text-align: center;">≈${course.NSS_OVERALL}%</div>
        </div>
        
        <div style="flex: 1; background-color: #f5ecd7; border-radius: 10px; padding: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="color: #8b1e3f; font-weight: bold; font-size: 12px; margin-bottom: 8px; text-align: center;">Employment Rate</div>
            <div style="color: #d28d1e; font-weight: bold; font-size: 18px; text-align: center;">≈${course.OVERALL_SUCCESS_RATE}%</div>
        </div>
        
        <div style="flex: 1; background-color: #f5ecd7; border-radius: 10px; padding: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="color: #8b1e3f; font-weight: bold; font-size: 12px; margin-bottom: 8px; text-align: center;">Research Quality</div>
            <div style="color: #d28d1e; font-weight: bold; font-size: 18px; text-align: center;">Top ${course.Research_Quality}%</div>
        </div>
        
        <div style="flex: 1; background-color: #f5ecd7; border-radius: 10px; padding: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="color: #8b1e3f; font-weight: bold; font-size: 12px; margin-bottom: 8px; text-align: center;">Cost of Living</div>
            <div style="color: #d28d1e; font-weight: bold; font-size: 18px; text-align: center;">Bottom ${course.Affordability_Score}%</div>
        </div>
    </div>

    <div style="background-color: #f5ecd7; border-radius: 10px; margin: 0 20px 10px 20px; padding: 12px 15px; display: flex; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
        <div style="color: #8b1e3f; font-weight: bold; margin-right: 15px; white-space: nowrap;">Course URL:</div>
        <a href="${course.COURSE_URL}" target="_blank" rel="noopener noreferrer" style="color: #5656f4; font-size: 13px; text-decoration: none;">${course.COURSE_URL}</a>
    </div>

    <div style="background-color: #f5ecd7; border-radius: 10px; margin: 0 20px 20px 20px; padding: 12px 15px; display: flex; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
        <div style="color: #8b1e3f; font-weight: bold; margin-right: 15px;">Degree Type:</div>
        <div style="color: #f4b860; font-size: 15px;">${course.DEGREE_TYPE}</div>
    </div>
`;

        cardDiv.after(extra);
        img.src = 'websiteimages/MinimiseCard.png';
        isOpen = true;
    }
});

/////////////////////////////////////////////////////////////////////////////////

function showToast(message, duration = 2000) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    container.appendChild(toast);

    // trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // remove after duration
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => container.removeChild(toast), 300); // wait for fade out
    }, duration);
}

    const shortlistBtn = card.querySelector('.shortlist-btn');

          shortlistBtn.addEventListener('click', async () => {
	try {
	        const response = await fetch("/shortlist/add", {
                	       method: "POST",
                                     headers: {
                    	       "Content-Type": "application/json"
                	       },
                	       credentials: "include",
                	       body: JSON.stringify({
                    	       course_name: course.COURSE_NAME || "Unknown Course",
                    	       university_name: course.UNIVERSITY_NAME || "Unknown University",
                    	       score: matchPercent,
                    	       city: course.CITY || "Unknown",
                    	       region: course.Region || "Unknown"
                	       })
            	        });

           	   if (response.status === 401) {
                	      showToast("Please log in to save courses.");
                	      return;
            	        }

            	        const result = await response.json();

            	       if (response.ok && result.status === "success") {
                	               showToast("Course saved to shortlist!");
            	       } else {
                	               showToast(result.message || "Could not save course.");
            	       }
                   } catch (error) {
            	       showToast("Error saving course.");
                   }
    });

    return card;
}
