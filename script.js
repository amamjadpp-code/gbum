document.addEventListener('DOMContentLoaded', () => {
    const exercisesContainer = document.getElementById('exercises');
    const addExerciseBtn = document.getElementById('add-exercise');
    const saveWorkoutBtn = document.getElementById('save-workout');

    let exerciseCount = 0;

    addExerciseBtn.addEventListener('click', () => {
        exerciseCount++;
        const exerciseDiv = document.createElement('div');
        exerciseDiv.classList.add('exercise');
        exerciseDiv.innerHTML = `
            <h3>Exercise ${exerciseCount}</h3>
            <input type="text" placeholder="Exercise Name">
            <input type="number" placeholder="Sets">
            <input type="number" placeholder="Reps">
            <input type="number" placeholder="Weight (kg)">
        `;
        exercisesContainer.appendChild(exerciseDiv);
    });

    saveWorkoutBtn.addEventListener('click', () => {
        const exercises = [];
        document.querySelectorAll('.exercise').forEach(exerciseDiv => {
            const exerciseName = exerciseDiv.querySelector('input[type="text"]').value;
            const sets = exerciseDiv.querySelector('input[type="number"]:nth-of-type(1)').value;
            const reps = exerciseDiv.querySelector('input[type="number"]:nth-of-type(2)').value;
            const weight = exerciseDiv.querySelector('input[type="number"]:nth-of-type(3)').value;

            if (exerciseName) {
                exercises.push({ exerciseName, sets, reps, weight });
            }
        });

        if (exercises.length > 0) {
            console.log('Workout Saved:', exercises);
            alert('Workout saved! Check the console for details.');
        } else {
            alert('Please add at least one exercise.');
        }
    });
});