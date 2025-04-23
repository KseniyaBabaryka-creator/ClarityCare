
function getRandomColor(){
	return `hsl(${Math.floor(Math.random() * 360)}, 80%, 70%)`; 
}


function isProfileComplete(currentUser){
	
	if(!currentUser) return false;
	return currentUser.experience && currentUser.specialization && currentUser.bio;
}

function saveProfile(formData, currentUser) {
	return new Promise((resolve, reject) => {
		const profile = {
			experience: formData.get('experience'),
			specialization: formData.get('specialization'),
			bio: formData.get('motto'),
			profilePicture: ''
		};

		const photoFile = formData.get('profilePhoto');
		if (!photoFile || photoFile.size === 0) {
			reject('No photo file provided');
			return;
		}

		const uploadData = new FormData();
		uploadData.append('email', currentUser.idUser);
		uploadData.append('file', photoFile);

		fetch('http://localhost:8080/api/attachments/upload', {
			method: 'POST',
			body: uploadData
		})
		.then(response => {
			if (!response.ok) {
				return response.text().then(text => { throw new Error(`Upload error: ${text}`); });
			}
			return response.json();
		})
		.then(savedAttachment => {
			const fileUrl = savedAttachment.url;
			console.log('File uploaded, URL:', fileUrl);

			return fetch(`http://localhost:8080/api/psychologists/by-email?email=${currentUser.idUser}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name: currentUser.name,
					experience: profile.experience,
					specialization: profile.specialization,
					bio: profile.bio,
					profilePicture: fileUrl
				})
			});
		})
		.then(response => {
			if (!response.ok) {
				return response.text().then(text => { throw new Error(`Update error: ${text}`); });
			}
			return response.json();
		})
		.then(updatedPsychologist => {
			console.log('Profile updated:', updatedPsychologist);
			loadProfile(updatedPsychologist);
			resolve();
		})
		.catch(error => {
			console.error("Error saving profile:", error);
			reject(error);
		});
	}); 
}

async function loadProfile(currentUser){

	if(currentUser){
		document.querySelector('.exp').textContent = `${currentUser.experience} years in`;
		document.querySelector('.spec').textContent = `${currentUser.specialization}`;
		document.querySelector('.motto').textContent = `"${currentUser.bio}"`;
		const rating = await updatePsychologistRating(currentUser.idUser);
		document.querySelector('.rating').textContent = `${rating}`;

		document.querySelector('.info__photo').src = currentUser.profilePicture 
    ? `http://localhost:8080${currentUser.profilePicture}`
    : 'images/ava.jpg';

	}
}

async function updatePsychologistRating(email) {
	const newRating = await setRating(email); 

	const response = await fetch(`http://localhost:8080/api/psychologists/update-rating?email=${email}&newRating=${newRating}`, {
		method: 'PUT'
	});

	if (response.ok) {
		const updatedPsychologist = await response.json();
		console.log('Rating has been updated:', updatedPsychologist);
		return newRating;
	} else {
		console.error('Error while updating rating');
	}
}


async function setRating(email){
	const response = await fetch('http://localhost:8080/api/reviews');
	const sessions = await response.json();

	console.log('sessions', sessions);

	const sess = sessions.filter(ses => {
		return ses.id_psycholog === email;
	});

	console.log('sess', sess);

	let rating = 0;

	sess.forEach(s => {
		rating += s.rate;
	});

	return rating/sess.length;

}

function updateTerms(freeTerms){
	document.querySelector('.cons__list').innerHTML = '';
	freeTerms.forEach(term => {
		const termItem = document.createElement('li');
		termItem.classList.add('cons__list-item');
		termItem.innerHTML = `<span class="cons__date">${term.date}</span> <p class="cons__time">${term.start_time} - ${term.end_time}</p>`;
		document.querySelector('.cons__list').appendChild(termItem);
	});
	document.querySelectorAll('.cons__list-item').forEach(element => {
		element.style.backgroundColor = getRandomColor();
	});
}

function loadTerms(){
	document.getElementById("termsContainer").innerHTML = "";

	fetch('http://localhost:8080/api/hours/getAll')
		.then(response => response.json())
		.then(data => {
			data.forEach(term => {
				addTermField(term.id, term.date, term.start_time, term.end_time); 
			});
		})
		.catch((error) => {
			console.error('Error:', error);
		});


}

function addTermField(id = "", date = "", start = "", end = ""){
	const termRow = document.createElement('div');
	termRow.classList.add("d-flex", "gap-2", "mb-2", "term-row");

	if (id) {
		termRow.setAttribute('data-id', id);
  }

	termRow.innerHTML = `
		<input type="date" class="form-control" value="${date}">
		<input type="time" class="form-control start" value="${start}">
		<input type="time" class="form-control end" value="${end}">
		<button class="btn btn-danger remove-term-btn">X</button>
	`;

	termRow.querySelector('.remove-term-btn').addEventListener('click', () => {
		deleteTermFromDB(id);
		termRow.remove();
	});

	document.getElementById("termsContainer").appendChild(termRow);
}

function deleteTermFromDB(id) {
	fetch(`http://localhost:8080/api/hours/${id}`, {
		method: 'DELETE',
	})
	.then(response => {
		if (!response.ok) {
			throw new Error("Failed to delete");
		}
		// Не вызываем response.json(), если тело пустое
		console.log("Deleted successfully");
	})
	.catch(error => {
		console.error("Error deleting term:", error);
	});
	
}

async function saveTerms() {
	const terms = document.querySelectorAll('.term-row');
	let newTerms = [];
	let updatedTerms = [];
	let deletedTerms = [];

	terms.forEach(term => {
		const startTime = term.querySelector('.start').value;
		const endTime = term.querySelector('.end').value;
		const termId = term.getAttribute('data-id');

		const startTimeWithSeconds = startTime.length === 5 ? startTime + ":00" : startTime;
		const endTimeWithSeconds = endTime.length === 5 ? endTime + ":00" : endTime;

		const termin = {
			id_psycholog: getCookie('email'),
			date: term.querySelector('input[type="date"]').value,
			start_time: startTimeWithSeconds,
			end_time: endTimeWithSeconds,
			id: termId
		};

		if (termId) {
			updatedTerms.push(termin);
		} else {
			newTerms.push(termin);
		}
	});

	// Получаем текущие термины с сервера
	const response = await fetch('http://localhost:8080/api/hours/getAll');
	const existingTerms = await response.json();

	// Определяем удалённые
	existingTerms.forEach(existingTerm => {
		const termArray = Array.from(terms);
		if (!termArray.some(term => term.getAttribute('data-id') == existingTerm.id)) {
			deletedTerms.push(existingTerm);
		}
	});

	// Сохраняем новые
	if (newTerms.length > 0) {
		await fetch('http://localhost:8080/api/hours', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(newTerms),
		});
	}

	// Обновляем существующие
	if (updatedTerms.length > 0) {
		await fetch('http://localhost:8080/api/hours/update', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(updatedTerms),
		});
	}

	// Удаляем лишние
	if (deletedTerms.length > 0) {
		await fetch('http://localhost:8080/api/hours/delete', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(deletedTerms),
		});
	}

	// И только теперь — обновляем отображение
	const updatedResponse = await fetch('http://localhost:8080/api/hours/getAll');
	const allTerms = await updatedResponse.json();
	updateTerms(allTerms);
}



async function renderCompleted(email){
	const response = await fetch('http://localhost:8080/api/appointments');
	const sessions = await response.json();

	const completed = document.querySelector('.completed__list');
	const completedSessions = sessions.filter(ses => {
		return ses.psychologist_id === email && ses.status.description === 'Completed';
	});

	console.log('Completed', completedSessions);

	completedSessions.forEach(s => {
		const session = document.createElement('li');
		session.classList.add('completed__list-item');

		fetch('http://localhost:8080/api/clients')
			.then(response => response.json())
			.then(data => {
				const client = data.find(client => client.id_user === s.client_id);
				session.innerHTML = `
					<p class="completed__client">${client.fullname}</p>
					<span class="completed__date">${s.date}</span>
					<p class="review">Review: ${s.rate || 'no rate'} <i class="bi bi-star-fill"></i></p>
					<p class="completed__time">${s.start_time} - ${s.end_time}</p>
				`;
				completed.appendChild(session);
			})
			.catch(error => {
				console.error('Error on rendering client:', error);
		});

	});
}

async function renderUpcoming(email) {
	const upcoming = document.querySelector('.upcoming__list');
	upcoming.innerHTML = ''; // очищаем перед новым рендером

	try {
		const [appointmentsRes, clientsRes] = await Promise.all([
			fetch('http://localhost:8080/api/appointments'),
			fetch('http://localhost:8080/api/clients'),
		]);

		const [appointments, clients] = await Promise.all([
			appointmentsRes.json(),
			clientsRes.json(),
		]);

		const upcomingSessions = appointments.filter(ses =>
			ses.psychologist_id === email &&
			(ses.status.description === 'Confirmed' || ses.status.description === 'Pending')
		);

		console.log('Upcoming', upcomingSessions);

		upcomingSessions.forEach(s => {
			const client = clients.find(c => c.id_user === s.client_id);
			if (!client) return;

			const session = document.createElement('li');
			session.classList.add('upcoming__list-item');

			session.innerHTML = `
				<p class="upcoming__client">${client.fullname}</p>
				<div class="upcoming__info">
					<span class="upcoming__date">${s.date}</span>
					<p class="upcoming__time">${s.start_time} - ${s.end_time}</p>
				</div>
			`;

			// Добавляем кнопку, в зависимости от статуса
			if (s.status.description === 'Pending') {
				const confirmButton = createButton('Confirm', 'btn-primary', async () => {
					try {
						const res = await fetch(`http://localhost:8080/api/appointments/${s.id}/confirm`, {
							method: 'PUT',
							headers: { 'Content-Type': 'application/json' },
						});

						if (!res.ok) throw new Error('Failed to confirm');

						console.log('Appointment confirmed');
						renderUpcoming(email); // перерисовываем список
					} catch (err) {
						console.error(err);
					}
				});
				session.appendChild(confirmButton);
			}

			if (s.status.description === 'Confirmed') {
				const cancelButton = createButton('Cancel', 'btn-danger', async () => {
					try {
						const res = await fetch(`http://localhost:8080/api/appointments/${s.id}`, {
							method: 'DELETE',
							headers: { 'Content-Type': 'application/json' },
						});

						if (!res.ok) throw new Error('Failed to cancel');

						console.log('Appointment canceled');

						// Анимация удаления
						session.classList.add('fade-out');
						setTimeout(() => session.remove(), 300);
					} catch (err) {
						console.error(err);
					}
				});
				session.appendChild(cancelButton);
			}

			upcoming.appendChild(session);
		});
	} catch (error) {
		console.error('Error rendering sessions:', error);
	}
}

// 💡 Универсальный помощник для кнопок
function createButton(text, styleClass, onClick) {
	const btn = document.createElement('button');
	btn.classList.add('btn', styleClass);
	btn.textContent = text;
	btn.addEventListener('click', onClick);
	return btn;
}


function hideSessions(sessions){
		for(let i = 0; i < sessions.length; i++){
			if(i > 2){
				sessions[i].style.display = "none";
			}
		}
}

function showSessions(sessions, display){
	sessions.forEach(ses => ses.style.display = display);
}

