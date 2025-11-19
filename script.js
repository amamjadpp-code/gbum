document.addEventListener('DOMContentLoaded', () => {
    const exerciseSelect = document.getElementById('exercise-select');
    const addExerciseBtn = document.getElementById('add-exercise');
    const exercisesContainer = document.getElementById('exercises');
    const saveWorkoutBtn = document.getElementById('save-workout');
    const timerDisplay = document.getElementById('timer-display');
    const historyList = document.getElementById('history-list');

    const exercises = [
        "Push-ups", "Pull-ups", "Squats", "Deadlifts", "Bench Press", "Overhead Press", "Rows"
    ];

    let timer;
    let timerSeconds = 0;

    // Populate exercise dropdown
    exercises.forEach(exercise => {
        const option = document.createElement('option');
        option.value = exercise;
        option.textContent = exercise;
        exerciseSelect.appendChild(option);
    });

    addExerciseBtn.addEventListener('click', () => {
        const selectedExercise = exerciseSelect.value;
        addExercise(selectedExercise);
    });

    function addExercise(exerciseName) {
        const exerciseDiv = document.createElement('div');
        exerciseDiv.classList.add('exercise');
        exerciseDiv.innerHTML = `
            <h3>${exerciseName}</h3>
            <input type="number" placeholder="Sets">
            <input type="number" placeholder="Reps">
            <input type="number" placeholder="Weight (kg)">
            <button class="start-timer">Start Rest Timer</button>
        `;
        exercisesContainer.appendChild(exerciseDiv);

        exerciseDiv.querySelector('.start-timer').addEventListener('click', () => {
            startTimer(60); // Default 60-second timer
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
            const exerciseName = exerciseDiv.querySelector('h3').textContent;
            const sets = exerciseDiv.querySelector('input[type="number"]:nth-of-type(1)').value;
            const reps = exerciseDiv.querySelector('input[type="number"]:nth-of-type(2)').value;
            const weight = exerciseDiv.querySelector('input[type="number"]:nth-of-type(3)').value;

            if (sets && reps) {
                workout.push({ exerciseName, sets, reps, weight });
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

    function saveWorkoutToHistory(workout) {
        const history = JSON.parse(localStorage.getItem('workoutHistory')) || [];
        history.push({ date: new Date().toLocaleDateString(), workout });
        localStorage.setItem('workoutHistory', JSON.stringify(history));
        loadWorkoutHistory();
    }

    function loadWorkoutHistory() {
        const history = JSON.parse(localStorage.getItem('workoutHistory')) || [];
        historyList.innerHTML = '';
        history.forEach(entry => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${entry.date}:</strong> ${entry.workout.map(e => `${e.exerciseName} (${e.sets}x${e.reps})`).join(', ')}`;
            historyList.appendChild(li);
        });
    }

    loadWorkoutHistory();
});