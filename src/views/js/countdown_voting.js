const timerElement = document.getElementById('time-counter');
let timeLeft;

async function fetchVotingStartTime() {
	try {
		const votingStartTimeResponse = await fetch('/voting-start-time');
		const votingStartTimeData = await votingStartTimeResponse.json();
		const startTime = new Date(votingStartTimeData.startTime).getTime();
		const endTime = startTime + (0.5 * 60 * 1000);
		const currentTime = Date.now();
		timeLeft = Math.max(Math.floor((endTime - currentTime) / 1000), 0);
		const votingStatusResponse = await fetch('/check-voting-status');
		const votingStatusData = await votingStatusResponse.json();
		if (votingStatusData.voted) {
			window.location.href = '/lobby';
		} else {
			startCountdown();
		}
	} catch (error) {
		console.error('Error fetching voting start time:', error);
	}
}

async function markAllUsersAsVoted() {
	try {
		const response = await fetch('/mark-all-users-as-voted', { method: 'POST' });
		if (!response.ok) {
			throw new Error('Error marking all users as voted');
		}
		await countVotes();
	} catch (error) {
		console.error('Error:', error);
	}
}

async function countVotes() {
    try {
        const response = await fetch('/count-votes', { method: 'POST' });
        if (!response.ok) {
            throw new Error('Error counting votes');
        }
    } catch (error) {
        console.error('Error counting votes:', error);
    }
}

function startCountdown() {
	const timerInterval = setInterval(async () => {
		const minutes = Math.floor(timeLeft / 60);
		const seconds = timeLeft % 60;
		const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
		const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
		timerElement.textContent = `${formattedMinutes}:${formattedSeconds}`;
		timeLeft -= 1;

		if (timeLeft <= 0) {
			clearInterval(timerInterval);
			await markAllUsersAsVoted();
			window.location.href = '/lobby';
		}
	}, 1000);
}

fetchVotingStartTime();