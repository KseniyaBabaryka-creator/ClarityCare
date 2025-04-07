
function getRandomColor(){
	return `hsl(${Math.floor(Math.random() * 360)}, 80%, 70%)`; 
}

const psychologists = JSON.parse(localStorage.getItem('psychologists'));
const currentUser = psychologists.find(p => {return p.id === getCookie('email')});

function isProfileComplete(){
	
	if(!currentUser) return false;
	

	return currentUser.experience && currentUser.specialization && currentUser.motto && currentUser.profilePicture;
}

function saveProfile(formData, name){
	return new Promise((resolve, reject) => {
		const profile = {
			experience: formData.get('experience'),
			specialization: formData.get('specialization'),
			motto: formData.get('motto'),
			photo: ''
		};

		const photoFile = formData.get('profilePhoto');
		if (photoFile && photoFile.size > 0){
			const reader = new FileReader();
			reader.onload = function() {
				profile.photo = reader.result;
				localStorage.setItem('profile', JSON.stringify(profile));

				let psychologist = JSON.parse(localStorage.getItem('psychologists'));

				const psych = {
					id: getCookie('email'),
					name: name,
					profilePicture: profile.photo,
					specialization: profile.specialization,
					experience: profile.experience,
					rating: 0,
					motto: profile.motto
				};

				psychologist.push(psych);

				localStorage.setItem('psychologists', JSON.stringify(psychologist));
				resolve();
			};
			reader.onerror = function(error) {
				reject(error);
			};
			reader.readAsDataURL(photoFile);
		} else {
			reject('No photo file provided');
		}
	});
}

function loadProfile(name){

	if(currentUser){
		document.querySelector('.exp').textContent = `${currentUser.experience} years in`;
		document.querySelector('.spec').textContent = `${currentUser.specialization}`;
		document.querySelector('.motto').textContent = `"${currentUser.motto}"`;
		document.querySelector('.rating').textContent = `${setRating(name)}`;

		if (currentUser.profilePicture) {
			document.querySelector('.info__photo').src = currentUser.profilePicture;
		}
	}
}

function setRating(name){
	const sessions = JSON.parse(localStorage.getItem('sessions'));

	const sess = sessions.filter(ses => {
		return ses.psycholog === name && ses.status === 'completed';
	});

	let rating = 0;

	sess.forEach(s => {
		rating += s.rate;
	});

	return rating/sess.length;

}

function updateTerms(freeTerms){
	freeTerms.forEach(term => {
		const termItem = document.createElement('li');
		termItem.classList.add('cons__list-item');
		termItem.innerHTML = `<span class="cons__date">${term.date}</span> <p class="cons__time">${term.start} - ${term.end}</p>`;
		document.querySelector('.cons__list').appendChild(termItem);
	});
	document.querySelectorAll('.cons__list-item').forEach(element => {
		element.style.backgroundColor = getRandomColor();
	});
}

function loadTerms(){
	document.getElementById("termsContainer").innerHTML = "";

	const savedTerms = JSON.parse(localStorage.getItem('terms')) || [];

	savedTerms.forEach(term => {
		addTermField(term.date, term.start, term.end);
	});

}

function addTermField(date = "", start = "", end = ""){
	const termRow = document.createElement('div');
	termRow.classList.add("d-flex", "gap-2", "mb-2", "term-row");

	termRow.innerHTML = `
		<input type="date" class="form-control" value="${date}">
		<input type="time" class="form-control start" value="${start}">
		<input type="time" class="form-control end" value="${end}">
		<button class="btn btn-danger remove-term-btn">X</button>
	`;

	termRow.querySelector('.remove-term-btn').addEventListener('click', () => {
		termRow.remove();
	});

	document.getElementById("termsContainer").appendChild(termRow);
}

function saveTerms(){
	const terms = document.querySelectorAll('.term-row');

	let savedTerms = [];

	terms.forEach(term => {
		const termin = {
			psycholog: getCookie('email'),
			date: term.querySelector('input[type="date"]').value,
			start: term.querySelector('.start').value,
			end: term.querySelector('.end').value
		}

		savedTerms.push(termin);
	})

	localStorage.setItem('terms', JSON.stringify(savedTerms));

	updateTerms(savedTerms);

}

function renderCompleted(name){
	const completed = document.querySelector('.completed__list');
	const sessions = JSON.parse(localStorage.getItem('sessions'));
	const completedSessions = sessions.filter(ses => {
		return ses.psycholog === name && ses.status === 'completed';
	});

	completedSessions.forEach(s => {
		const session = document.createElement('li');
		session.classList.add('completed__list-item');

		const client = JSON.parse(localStorage.getItem('users')).find(u => {
			return u.email === s.client
		}).name;

		session.innerHTML = `
			<p class="completed__client">${client}</p>
			<span class="completed__date">${s.date}</span>
			<p class="review">Review: ${s.rate || 'no rate'} <i class="bi bi-star-fill"></i></p>
			<p class="completed__time">${s.startTime} - ${s.endTime}</p>
		`;
		completed.appendChild(session);
	});
}

function renderUpcoming(name){
	const upcoming = document.querySelector('.upcoming__list');
	const sessions = JSON.parse(localStorage.getItem('sessions'));
	const upcomingSessions = sessions.filter(ses => {
		return ses.psycholog === name && ses.status === 'upcoming';
	});

	upcomingSessions.forEach(s => {
		const session = document.createElement('li');
		session.classList.add('upcoming__list-item');

		const client = JSON.parse(localStorage.getItem('users')).find(u => {
			return u.email === s.client
		}).name;

		session.innerHTML = `
			<p class="upcoming__client">${client}</p>
			<div class="upcoming__info">
				<span class="upcoming__date">${s.date}</span>
				<p class="upcoming__time">${s.startTime} - ${s.endTime}</p>
			</div>
		`;
		upcoming.appendChild(session);
	});
}

function hideSessions(sessions){
		for(i = 0; i < sessions.length; i++){
			if(i > 2){
				sessions[i].style.display = "none";
			}
		}
}

function showSessions(sessions, display){
	sessions.forEach(ses => ses.style.display = display);
}

