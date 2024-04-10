const timerElement = document.getElementById('time-counter');
    let timeLeft = 1 * 60;  

    const timerInterval = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;

        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

        timerElement.textContent = `${formattedMinutes}:${formattedSeconds}`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            window.location.href = '/lobby';
        }

        timeLeft -= 1;
    }, 1000);