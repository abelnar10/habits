// main.js

let habits = JSON.parse(localStorage.getItem('habits')) || [];

function displayHabits() {
    const habitsList = document.getElementById('habitsList');
    const storedHabits = JSON.parse(localStorage.getItem('habits')) || [];

    if (habitsList) {
        habitsList.innerHTML = '';

        storedHabits.forEach((habit, index) => {
            habitsList.innerHTML += `
            <ul class="list-group">
                <li class="list-group-item d-flex flex-wrap justify-content-between align-items-center">
                    <div class="d-flex flex-column">
                        <span>${habit.name}</span>
                        <span class="badge badge-secondary mt-1">Hora de alarma | ${habit.time}</span>
                    </div>
                    <div class="d-flex flex-column">
                        <span class="badge badge-success">Completado | ${habit.completado}</span>
                        <span class="badge badge-success">Racha | ${habit.racha}</span>
                    </div>
                    <div class="d-flex flex-column">
                        <span class="badge badge-success">Total días marcados | ${habit.total}</span>
                        <span class="badge badge-success">Días marcados desde creación | ${calcularPorcentajeDiasMarcados(habit)}%</span>
                    </div>
                    <div class="form-check mt-2">
                        <input class="form-check-input" type="checkbox" data-index="${index}" ${habit.completado ? 'checked' : ''}>
                        <label class="form-check-label" for="defaultCheck1">Completado</label>
                    </div>
                </li>
            </ul>
        
            `;
        });

        const checkboxes = document.querySelectorAll('.form-check-input');
        checkboxes.forEach((checkbox) => {
            checkbox.addEventListener('change', function (event) {
                const index = event.target.getAttribute('data-index');
                updateHabit(index);
            });
        });

        // Inicializar la verificación periódica de la hora
        initializeNotificationCheck();
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
        displayHabits();
    }
}

function calcularPorcentajeDiasMarcados(habit) {
    const fechaCreacion = new Date(habit.fechaCreacion);
    const hoy = new Date();

    const diferenciaTiempo = hoy.getTime() - fechaCreacion.getTime();
    const diasTranscurridos = Math.floor(diferenciaTiempo / (1000 * 3600 * 24));

    if (diasTranscurridos === 0) {
        return habit.completado ? '100.00' : '0.00';
    }

    const porcentajeDiasMarcados = (habit.total / diasTranscurridos) * 100;

    return porcentajeDiasMarcados.toFixed(2);
}

function checkNotificationTime(habit) {
    const currentDate = new Date();
    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();

    const [habitHour, habitMinute] = habit.time.split(':').map(Number);

    if (currentHour === habitHour && currentMinute === habitMinute && !habit.completado) {
        showNotification(habit.name);
    }
}

function showNotification(habitName) {
    if ("Notification" in window && Notification.permission === "granted") {
        const title = "Recordatorio de hábito";
        const body = `Es hora de completar tu hábito: ${habitName}`;
        const icon = "/img/icon-192x192.png";

        const options = {
            body: body,
            icon: icon
        };

        new Notification(title, options);
    }
}

function initializeNotificationCheck() {
    setInterval(() => {
        const storedHabits = JSON.parse(localStorage.getItem('habits')) || [];
        storedHabits.forEach((habit) => {
            checkNotificationTime(habit);
        });
    }, 60000);
}

function requestNotificationPermission() {
    if ("Notification" in window) {
        Notification.requestPermission().then((result) => {
            if (result === "granted") {
                console.log("Permiso de notificación concedido");
            } else if (result === "denied") {
                console.log("Permiso de notificación denegado");
            } else if (result === "default") {
                console.log("El usuario cerró el diálogo sin tomar una decisión");
            }
        });
    }
}

window.onload = function() {
    requestNotificationPermission();
    displayHabits();
};


// Cargar hábitos al iniciar la aplicación
displayHabits();
