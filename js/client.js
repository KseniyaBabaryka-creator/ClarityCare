const login = document.querySelector('.profile__login');
const usernameInput = document.getElementById('name'); 
const passwordInput = document.getElementById('password');
const checkPass = document.getElementById('passwordCheck');
const address = document.getElementById('address');
const phone = document.getElementById('tel');
const userEmail = getCookie('email');


async function hashPassword(pass, usname) {
  const encoder = new TextEncoder();
  const salt = encoder.encode(usname); 

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(pass),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  return Array.from(new Uint8Array(hashBuffer))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}


async function setInfo() {
	await fetch('http://localhost:8080/api/users')
	.then(response => response.json())
	.then(users => {
	  console.log(users); 
	  users.forEach(user => {
		if (user.email === userEmail) {
		  usernameInput.value = user.name;
		}
	 });
	})
	.catch(error => console.error('Error on loading users', error));

	await fetch('http://localhost:8080/api/clients')
	.then(response => response.json())
	.then(clients => {
	  const client = clients.find(c => c.id_user === userEmail);
	  if(client.address){address.value = client.address};
	  if(client.phone){phone.value = client.phone};
	})
	.catch(error => console.error('Error on loading users', error));

	
	login.textContent = `Your login: ${userEmail}`;
	passwordInput.value = `${getCookie('password')}`;
	checkPass.value = `${getCookie('password')}`;

	fetch(`http://localhost:8080/api/attachments/by-user?email=${userEmail}`)
	.then(response => {
		if (!response.ok) throw new Error('Not found');
		return response.text();
	})
	.then(photoUrl => {
			document.querySelector('.profile__image').src = `http://localhost:8080${photoUrl}`;
	})
	.catch(error => {
			console.error("Error fetching profile photo:", error);
			document.querySelector('.profile__image').src = "images/default.png";
	});

}


async function changeInfo() {
  if (passwordInput.value !== checkPass.value) {
    alert('Passwords do not match!');
    return;
  }

  try {
    const newHashedPass = await hashPassword(passwordInput.value, usernameInput.value);


	 const updatedUser = {
		email: userEmail,
      name: usernameInput.value,
      password: newHashedPass
    };

	 const updatedClient = {
		id_user: userEmail,
      fullname: usernameInput.value,
		phone: phone.value,
		address: address.value
    };

	 const response = await fetch(`http://localhost:8080/api/users/${userEmail}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedUser)
    });

	 if (!response.ok) {
      throw new Error('Error on updating user');
    }

	 const clientResponse = await fetch(`http://localhost:8080/api/clients/${userEmail}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedClient)
    });

	 if (!clientResponse.ok) {
      throw new Error('Error on updating client');
    }

    
    deleteCookie('password');
    setCookie('password', passwordInput.value);


    alert('Information was successfully changed!');

  } catch (err) {
    console.error(err);
    alert('Something went wrong! Try again, please...');
  }
}

function renderCompletedSessions(){
	
	const sessionsContainer = document.querySelector('.completed-container');
	if (!sessionsContainer) {
		console.error('Container for sessions not found');
		return;
   }
	sessionsContainer.innerHTML = "";

	fetch(`http://localhost:8080/api/appointments`)
	.then(response => {

		if(!response.ok)throw new Error('Error while getting appointments')
		return response.json()
	})
	.then(data => {

		const sessions = Array.from(data);
		
		if(sessions.length){
			const completedSessions = sessions.filter(ses => {
				return ses.client_id === getCookie('email') && ses.status.description === 'Completed';
			});
			
	
			if(completedSessions.length){
				
				completedSessions.forEach(ses => {
					const sesCard = document.createElement('div');
					sesCard.classList.add('session__card', 'completed');
					sesCard.setAttribute('data-id', ses.id);
					fetch(`http://localhost:8080/api/psychologists`)
					.then(response => {
						if(!response.ok) throw new Error('Error on fetching psychologists')
						return response.json();
					})
					.then(data => {
						const psychologists = Array.from(data);
						const psycholog = psychologists.find(p => p.idUser === ses.psychologist_id);
						sesCard.innerHTML = `
						<div class="session__photo">
							<img src="images/ava.jpg" alt="Psycholog photo" class="session__img img-fluid">
						</div>
							<p class="session__name">${psycholog.name}</p>
							<p class="session__info">${ses.date}</p> 
							<p class="session__info">${ses.start_time} - ${ses.end_time}</p>
					`;


					const ratingElement = renderRating(ses.rate, ses.id, ses.psychologist_id, ses.client_id);
					sesCard.appendChild(ratingElement);
	
					sessionsContainer.appendChild(sesCard);
					})
					
	
					
				})
			} else sessionsContainer.innerHTML = `<h2 class='card__title'>You have no completed sessions</h2>`;
		} else sessionsContainer.innerHTML = `<h2 class='card__title'>You have no completed sessions</h2>`;
	})
	.catch(err => {
		console.error("Error on rendering completed sessions:", err);
	})

}

function renderRating(rate, appointmentId, psychologistId, clientId){
	const review = document.createElement('div');
	review.classList.add('session__review');
	if(rate != null){
		review.innerHTML = `<div class="session__review">${rate} <i class="bi bi-star-fill"></i></div>`
	} else {
		const inputRate = document.createElement('input');
		inputRate.setAttribute('id', 'input-rate');
		inputRate.type = 'number';
		inputRate.min = 1;
		inputRate.max = 5;
		inputRate.classList.add('form-control','mb-2');

		const rateBtn = document.createElement('button');
		rateBtn.classList.add('btn', 'btn-primary');
		rateBtn.type = 'submit';
		rateBtn.innerText = 'Rate';

		const label = document.createElement('label');
		label.htmlFor = 'input-rate';
		label.classList.add('form-label', 'rating__label');
		label.innerText = 'Add a rating to the session';

		review.appendChild(label);
		review.appendChild(inputRate);
		review.appendChild(rateBtn);

		rateBtn.addEventListener('click', async (e)=>{
			e.preventDefault();
			const rateValue = inputRate.value;

			if (rateValue < 1 || rateValue > 5) {
				alert('Please enter a rating between 1 and 5');
				return;
			}

			console.log("Submitting rating with the following data:", {
				id_psycholog: psychologistId,
				id_client: clientId,
				id_appointment: appointmentId,
				rate: rateValue
		  });

			try {
				const response = await fetch('http://localhost:8080/api/reviews', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						id_psycholog: psychologistId,
						id_client: clientId,
						id_appointment: appointmentId,
						rate: rateValue
					})
				});
				if (!response.ok) throw new Error('Failed to submit rating');

				review.innerHTML = `<div class="session__review">${rateValue} <i class="bi bi-star-fill"></i></div>`;
			} catch (err) {
				console.error("Error submitting rating:", err);
				alert("Failed to submit rating");
			}
		})
	}

	return review;
}

async function renderUpcomingSessions(){
	const sessionsContainer = document.querySelector('.upcoming-container');
	if (!sessionsContainer) {
		console.error('Container for sessions not found');
		return;
	}

	sessionsContainer.innerHTML = "";

	try {
		const response = await fetch(`http://localhost:8080/api/appointments`);
		if (!response.ok) throw new Error('Error while getting appointments');

		const data = await response.json();
		const sessions = Array.from(data);

		if (!sessions.length) {
			sessionsContainer.innerHTML = `<h2 class='card__title'>You have no upcoming sessions</h2>`;
			return;
		}

		const upcomingSessions = sessions.filter(ses => {
			return ses.client_id === getCookie('email') && 
				(ses.status.description === 'Confirmed' || ses.status.description === 'Pending');
		});

		if (!upcomingSessions.length) {
			sessionsContainer.innerHTML = `<h2 class='card__title'>You have no upcoming sessions</h2>`;
			return;
		}

		
		const psychResponse = await fetch(`http://localhost:8080/api/psychologists`);
		if (!psychResponse.ok) throw new Error('Error on fetching psychologists');
		const psychologists = await psychResponse.json();

		upcomingSessions.forEach(ses => {
			const psycholog = psychologists.find(p => p.idUser === ses.psychologist_id);
			const sesCard = document.createElement('div');
			sesCard.classList.add('session__card', 'upcoming');
			sesCard.setAttribute('data-id', ses.id);

			sesCard.innerHTML = `
				<div class="session__photo">
					<img src="images/ava.jpg" alt="Psycholog photo" class="session__img img-fluid">
				</div>
				<p class="session__name">${psycholog.name}</p>
				<p class="session__info">${ses.date}</p>
				<p class="session__info">${ses.start_time} - ${ses.end_time}</p>
				<button class="session__btn">Cancel</button>
			`;

			sessionsContainer.appendChild(sesCard);
		});

		
		document.querySelectorAll('.session__btn').forEach(btn => {
			btn.addEventListener('click', async (e) => {
				console.log('CANCEL CLICKED');
				await cancelSession(e);
			});
		});

	} catch (err) {
		console.error('Error in renderUpcomingSessions:', err);
	}
}


async function cancelSession(e){
	const session = e.target.closest('.session__card');
	const id = session.getAttribute('data-id');
	try {
		const res = await fetch(`http://localhost:8080/api/appointments/${id}`, {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
		});

		if (!res.ok) throw new Error('Failed to cancel');

		console.log('Appointment canceled');

		
		session.classList.add('fade-out');
		setTimeout(() => session.remove(), 300);
		await renderUpcomingSessions();
	} catch (err) {
		console.error(err);
	}

	
}








