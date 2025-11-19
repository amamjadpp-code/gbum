document.addEventListener('DOMContentLoaded', () => {
    const exerciseSearch = document.getElementById('exercise-search');
    const exerciseSelect = document.getElementById('exercise-select');
    const addExerciseBtn = document.getElementById('add-exercise');
    const addSupersetBtn = document.getElementById('add-superset');
    const exercisesContainer = document.getElementById('exercises');
    const saveWorkoutBtn = document.getElementById('save-workout');
    const timerDisplay = document.getElementById('timer-display');
    const historyList = document.getElementById('history-list');

    const exercises = [
        "Push-ups", "Pull-ups", "Squats", "Deadlifts", "Bench Press", "Overhead Press", "Rows",
        "Bicep Curls", "Tricep Dips", "Lunges", "Leg Press", "Calf Raises", "Lat Pulldowns"
    ];

    let timer;
    let timerSeconds = 0;

    // Populate exercise dropdown
    function populateExerciseDropdown(filter = '') {
        exerciseSelect.innerHTML = '';
        exercises
            .filter(e => e.toLowerCase().includes(filter.toLowerCase()))
            .forEach(exercise => {
                const option = document.createElement('option');
                option.value = exercise;
                option.textContent = exercise;
                exerciseSelect.appendChild(option);
            });
    }

    exerciseSearch.addEventListener('input', () => {
        populateExerciseDropdown(exerciseSearch.value);
    });

    addExerciseBtn.addEventListener('click', () => {
        const selectedExercise = exerciseSelect.value;
        addExercise(selectedExercise);
    });

    addSupersetBtn.addEventListener('click', () => {
        addSuperset();
    });

    function addExercise(exerciseName, container = exercisesContainer) {
        const exerciseDiv = document.createElement('div');
        exerciseDiv.classList.add('exercise');
        exerciseDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3>${exerciseName}</h3>
                <button class="delete-exercise">X</button>
            </div>
            <input type="number" placeholder="Sets">
            <input type="number" placeholder="Reps">
            <input type="number" placeholder="Weight (kg)">
            <button class="start-timer">Start Rest Timer</button>
        `;
        container.appendChild(exerciseDiv);

        exerciseDiv.querySelector('.start-timer').addEventListener('click', () => {
            startTimer(60); // Default 60-second timer
        });

        exerciseDiv.querySelector('.delete-exercise').addEventListener('click', () => {
            exerciseDiv.remove();
        });
    }

    function addSuperset() {
        const supersetDiv = document.createElement('div');
        supersetDiv.classList.add('superset');
        supersetDiv.innerHTML = `
            <h4>Superset</h4>
            <div class="superset-exercises"></div>
            <button class="add-to-superset">Add Exercise to Superset</button>
        `;
        exercisesContainer.appendChild(supersetDiv);

        supersetDiv.querySelector('.add-to-superset').addEventListener('click', () => {
            const selectedExercise = exerciseSelect.value;
            addExercise(selectedExercise, supersetDiv.querySelector('.superset-exercises'));
        });
    }

    function startTimer(seconds) {
        clearInterval(timer);
        timerSeconds = seconds;
        updateTimerDisplay();
        timer = setInterval(() => {
            timerSeconds--;
            updateTimerDisplay();
            if (timerSeconds <= 0) {
                clearInterval(timer);
                alert('Rest time is over!');
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(timerSeconds / 60);
        const seconds = timerSeconds % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    saveWorkoutBtn.addEventListener('click', () => {
        const workout = [];
        document.querySelectorAll('.exercise').forEach(exerciseDiv => {
            if(exerciseDiv.closest('.superset')) return; // Handled separately
            const exerciseName = exerciseDiv.querySelector('h3').textContent;
            const sets = exerciseDiv.querySelector('input[type="number"]:nth-of-type(1)').value;
            const reps = exerciseDiv.querySelector('input[type="number"]:nth-of-type(2)').value;
            const weight = exerciseDiv.querySelector('input[type="number"]:nth-of-type(3)').value;

            if (sets && reps) {
                workout.push({ type: 'exercise', exerciseName, sets, reps, weight });
            }
        });

        document.querySelectorAll('.superset').forEach(supersetDiv => {
            const supersetExercises = [];
            supersetDiv.querySelectorAll('.exercise').forEach(exerciseDiv => {
                const exerciseName = exerciseDiv.querySelector('h3').textContent;
                const sets = exerciseDiv.querySelector('input[type="number"]:nth-of-type(1)').value;
                const reps = exerciseDiv.querySelector('input[type="number"]:nth-of-type(2)').value;
                const weight = exerciseDiv.querySelector('input[type="number"]:nth-of-type(3)').value;
                if (sets && reps) {
                    supersetExercises.push({ exerciseName, sets, reps, weight });
                }
            });
            if(supersetExercises.length > 0) {
                workout.push({ type: 'superset', exercises: supersetExercises });
            }
        });

        if (workout.length > 0) {
            saveWorkoutToHistory(workout);
            alert('Workout saved!');
            exercisesContainer.innerHTML = ''; // Clear current workout
        } else {
            alert('Please add at least one exercise with sets and reps.');
        }
    });

    function saveWorkoutToHistory(workout, index = null) {
        let history = JSON.parse(localStorage.getItem('workoutHistory')) || [];
        const newEntry = { date: new Date().toLocaleString(), workout };

        if (index !== null) {
            history[index] = newEntry;
        } else {
            history.push(newEntry);
        }
        localStorage.setItem('workoutHistory', JSON.stringify(history));
        loadWorkoutHistory();
    }

    function loadWorkoutHistory() {
        let history = JSON.parse(localStorage.getItem('workoutHistory')) || [];
        historyList.innerHTML = '';
        history.forEach((entry, index) => {
            const li = document.createElement('li');
            const workoutDetails = entry.workout.map(item => {
                if (item.type === 'superset') {
                    return `Superset: ${item.exercises.map(e => `${e.exerciseName} (${e.sets}x${e.reps})`).join(' + ')}`;
                }
                return `${item.exerciseName} (${item.sets}x${item.reps})`;
            }).join(', ');

            li.innerHTML = `
                <span><strong>${entry.date}:</strong> ${workoutDetails}</span>
                <div class="history-buttons">
                    <button class="edit-workout" data-index="${index}">Edit</button>
                    <button class="delete-workout" data-index="${index}">Delete</button>
                </div>
            `;
            historyList.appendChild(li);
        });

        document.querySelectorAll('.edit-workout').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                editWorkout(index);
            });
        });

        document.querySelectorAll('.delete-workout').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                deleteWorkout(index);
            });
        });
    }

    function editWorkout(index) {
        let history = JSON.parse(localStorage.getItem('workoutHistory')) || [];
        const workoutToEdit = history[index].workout;
        exercisesContainer.innerHTML = ''; // Clear current workout

        workoutToEdit.forEach(item => {
            if (item.type === 'exercise') {
                addExercise(item.exerciseName);
                const lastExercise = exercisesContainer.lastChild;
                lastExercise.querySelector('input[type="number"]:nth-of-type(1)').value = item.sets;
                lastExercise.querySelector('input[type="number"]:nth-of-type(2)').value = item.reps;
                lastExercise.querySelector('input[type="number"]:nth-of-type(3)').value = item.weight;
            } else if (item.type === 'superset') {
                addSuperset();
                const supersetContainer = exercisesContainer.lastChild.querySelector('.superset-exercises');
                item.exercises.forEach(supersetExercise => {
                    addExercise(supersetExercise.exerciseName, supersetContainer);
                    const lastExercise = supersetContainer.lastChild;
                    lastExercise.querySelector('input[type="number"]:nth-of-type(1)').value = supersetExercise.sets;
                    lastExercise.querySelector('input[type="number"]:nth-of-type(2)').value = supersetExercise.reps;
                    lastExercise.querySelector('input[type="number"]:nth-of-type(3)').value = supersetExercise.weight;
                });
            }
        });
        // After loading, we should remove it from history and re-save on completion
        deleteWorkout(index, false);
    }

    function deleteWorkout(index, confirmDelete = true) {
        if (confirmDelete && !confirm('Are you sure you want to delete this workout?')) {
            return;
        }
        let history = JSON.parse(localStorage.getItem('workoutHistory')) || [];
        history.splice(index, 1);
        localStorage.setItem('workoutHistory', JSON.stringify(history));
        loadWorkoutHistory();
    }

    // Initial Load
    populateExerciseDropdown();
    loadWorkoutHistory();
});