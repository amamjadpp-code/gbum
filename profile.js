document.addEventListener('DOMContentLoaded', () => {
    const statsContent = document.getElementById('stats-content');
    const exercisesContent = document.getElementById('exercises-content');
    const measuresContent = document.getElementById('measures-content');
    const calendarContent = document.getElementById('calendar-content');
    const addMeasureBtn = document.getElementById('add-measure');
    const measureNameInput = document.getElementById('measure-name');
    const measureValueInput = document.getElementById('measure-value');

    const workoutHistory = JSON.parse(localStorage.getItem('workoutHistory')) || [];
    const measures = JSON.parse(localStorage.getItem('measures')) || [];

    function loadStatistics() {
        const totalWorkouts = workoutHistory.length;
        let totalSets = 0;
        let totalReps = 0;

        workoutHistory.forEach(entry => {
            entry.workout.forEach(item => {
                if (item.type === 'exercise') {
                    totalSets += Number(item.sets) || 0;
                    totalReps += Number(item.reps) * Number(item.sets) || 0;
                } else if (item.type === 'superset') {
                    item.exercises.forEach(exercise => {
                        totalSets += Number(exercise.sets) || 0;
                        totalReps += Number(exercise.reps) * Number(exercise.sets) || 0;
                    });
                }
            });
        });

        statsContent.innerHTML = `
            <p>Total Workouts: <strong>${totalWorkouts}</strong></p>
            <p>Total Sets: <strong>${totalSets}</strong></p>
            <p>Total Reps: <strong>${totalReps}</strong></p>
        `;
    }

    function loadExercisesSummary() {
        const exerciseMap = new Map();

        workoutHistory.forEach(entry => {
            entry.workout.forEach(item => {
                const processExercise = (exercise) => {
                    const { exerciseName, weight } = exercise;
                    const currentBest = exerciseMap.get(exerciseName) || 0;
                    if (Number(weight) > currentBest) {
                        exerciseMap.set(exerciseName, Number(weight));
                    }
                };

                if (item.type === 'exercise') {
                    processExercise(item);
                } else if (item.type === 'superset') {
                    item.exercises.forEach(processExercise);
                }
            });
        });

        let exerciseHTML = '<ul>';
        for (const [exercise, pr] of exerciseMap.entries()) {
            exerciseHTML += `<li>${exercise}: <strong>${pr} kg PR</strong></li>`;
        }
        exerciseHTML += '</ul>';
        exercisesContent.innerHTML = exerciseHTML;
    }

    function loadMeasures() {
        measuresContent.innerHTML = '';
        let measuresHTML = '<ul>';
        measures.forEach((measure, index) => {
            measuresHTML += `<li>${measure.name}: <strong>${measure.value}</strong> <button class="delete-measure" data-index="${index}">X</button></li>`;
        });
        measuresHTML += '</ul>';
        measuresContent.innerHTML = measuresHTML;

        document.querySelectorAll('.delete-measure').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                deleteMeasure(index);
            });
        });
    }

    function addMeasure() {
        const name = measureNameInput.value;
        const value = measureValueInput.value;
        if (name && value) {
            measures.push({ name, value });
            localStorage.setItem('measures', JSON.stringify(measures));
            loadMeasures();
            measureNameInput.value = '';
            measureValueInput.value = '';
        } else {
            alert('Please enter both a name and a value for the measurement.');
        }
    }

    function deleteMeasure(index) {
        measures.splice(index, 1);
        localStorage.setItem('measures', JSON.stringify(measures));
        loadMeasures();
    }

    function loadCalendar() {
        const today = new Date();
        const month = today.getMonth();
        const year = today.getFullYear();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();

        calendarContent.innerHTML = '';

        // Add day names
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayNames.forEach(day => {
            const dayNameDiv = document.createElement('div');
            dayNameDiv.textContent = day;
            calendarContent.appendChild(dayNameDiv);
        });


        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarContent.appendChild(document.createElement('div'));
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('calendar-day');
            dayDiv.textContent = i;

            const date = new Date(year, month, i);
            if (workoutHistory.some(entry => new Date(entry.date).toDateString() === date.toDateString())) {
                dayDiv.classList.add('workout-day');
            }
            calendarContent.appendChild(dayDiv);
        }
    }

    addMeasureBtn.addEventListener('click', addMeasure);

    loadStatistics();
    loadExercisesSummary();
    loadMeasures();
    loadCalendar();
});