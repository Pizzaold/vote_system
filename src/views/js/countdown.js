const countdown = document.getElementById('countdown');
const endTime = new Date(countdown.getAttribute('data-time')).getTime() + new Date().getTimezoneOffset() * 60000;

const timer = setInterval(() => {
    const now = new Date().getTime();
    const distance = endTime - now;
    let 

    if (distance <= 0) {
        clearInterval(timer);
        window.location.href = '/voting';
    } else {
        const hours = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
        const formattedHours = hours < 10 ? `0${hours}` : hours;

        countdown.innerHTML = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    }
}, 1000);