// main.js

let habits = JSON.parse(localStorage.getItem('habits')) || [];

function displayHabits() {
    const habitsList = document.getElementById('habitsList');

    console.log("entra mostrar habitos:");

    const storedHabits = JSON.parse(localStorage.getItem('habits')) || [];

    if (habitsList) {
        habitsList.innerHTML = '';

        storedHabits.forEach((habit, index) => {
            habitsList.innerHTML += `
                <ul class="list-group">
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                    ${habit.name} 
                    <span class="badge badge-secondary">hora de alarma | ${habit.time}</span>
                    <span class="badge badge-success">completado | ${habit.completado}</span>
                    <span class="badge badge-success">racha | ${habit.racha}</span>
                    <span class="badge badge-success">total dias marcados | ${habit.total}</span>
                    <span class="badge badge-success">dias marcados desde creacion | ${calcularPorcentajeDiasMarcados(habit)}%</span>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" data-index="${index}" ${habit.completado ? 'checked' : ''}>
                        <label class="form-check-label" for="defaultCheck1">
                            completado
                        </label>
                    </div>
                    </li>
                </ul>
            `;
        });
        
        // Agregar el evento para actualizar el hábito cuando se marque como completado
        const checkboxes = document.querySelectorAll('.form-check-input');
        checkboxes.forEach((checkbox) => {
            checkbox.addEventListener('change', function(event) {
                const index = event.target.getAttribute('data-index');
                updateHabit(index);
            });
        });
    } else {
        console.error('El elemento habitsList no se encontró en el DOM.');
    }
}

function updateHabit(index) {
    const storedHabits = JSON.parse(localStorage.getItem('habits')) || [];
    const habit = storedHabits[index];
    
    if (habit) {
        const currentDate = new Date();
        const currentHour = currentDate.getHours();
        const currentMinute = currentDate.getMinutes();

        if (habit.completado) {
            habit.completado = false;
            habit.total -= 1;
            habit.racha -= 1;
        } else {
            habit.completado = true;
            habit.total += 1;
            habit.racha += 1;
        }

        if (currentHour === 23 && currentMinute === 59 && !habit.completado) {
            habit.recordRacha = habit.racha;
            habit.racha = 0;
        }
        
        storedHabits[index] = habit;
        localStorage.setItem('habits', JSON.stringify(storedHabits));
        displayHabits(); // Actualizar la lista después de la actualización
    }
}

function calcularPorcentajeDiasMarcados(habit) {
    const fechaCreacion = new Date(habit.fechaCreacion);
    const hoy = new Date();

    // Calcular días transcurridos desde la creación
    const diferenciaTiempo = hoy.getTime() - fechaCreacion.getTime();
    const diasTranscurridos = Math.floor(diferenciaTiempo / (1000 * 3600 * 24));

    // Verificar si diasTranscurridos es cero
    if (diasTranscurridos === 0) {
        return habit.completado ? '100.00' : '0.00'; // Retorna 100% si completado es true, de lo contrario, retorna 0%
    }

    // Calcular porcentaje de días marcados
    const porcentajeDiasMarcados = (habit.total / diasTranscurridos) * 100;

    return porcentajeDiasMarcados.toFixed(2); // Redondear a 2 decimales
}



// Cargar hábitos al iniciar la aplicación
displayHabits();
