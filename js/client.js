const login = document.querySelector('.profile__login');
const usernameInput = document.getElementById('name'); 
let users = JSON.parse(localStorage.getItem('users')) || [];
const passwordInput = document.getElementById('password');
const checkPass = document.getElementById('passwordCheck');

const sessions = [
	{
	  id: 1,
	  client: 'eliska1234@gmail.com',
	  psycholog: 'Emily Carter',
	  date: new Date(2025, 4, 10).toLocaleDateString(), // 10 мая 2025
	  startTime: '15:00',
	  endTime: '16:00',
	  status: 'upcoming',
	  rate: null
	},
	{
	  id: 2,
	  client: 'john.doe@mail.com', // изменено
	  psycholog: 'Michael Tompson',
	  date: new Date(2024, 11, 9).toLocaleDateString(), // 9 декабря 2024
	  startTime: '13:00',
	  endTime: '14:00',
	  status: 'cancelled',
	  rate: null
	},
	{
	  id: 3,
	  client: 'eliska1234@gmail.com',
	  psycholog: 'Isabella Green',
	  date: new Date(2025, 11, 3).toLocaleDateString(), // 3 декабря 2025
	  startTime: '11:00',
	  endTime: '12:00',
	  status: 'completed',
	  rate: null
	},
	{
	  id: 4,
	  client: 'mary.smith@mail.com', // изменено
	  psycholog: 'Sophia Lee',
	  date: new Date(2025, 5, 15).toLocaleDateString(), // 15 июня 2025
	  startTime: '10:00',
	  endTime: '11:00',
	  status: 'upcoming',
	  rate: null
	},
	{
		id: 5,
	  client: 'eliska1234@gmail.com',
	  psycholog: 'James Robinson',
	  date: new Date(2024, 9, 20).toLocaleDateString(), // 20 октября 2024
	  startTime: '09:00',
	  endTime: '10:00',
	  status: 'completed',
	  rate: 5
	},
	{
		id: 6,
	  client: 'robert.johnson@mail.com', // изменено
	  psycholog: 'Daniel Brown',
	  date: new Date(2025, 6, 25).toLocaleDateString(), // 25 июля 2025
	  startTime: '14:00',
	  endTime: '15:00',
	  status: 'upcoming',
	  rate: null
	},
	{
		id: 7,
	  client: 'eliska1234@gmail.com',
	  psycholog: 'Ava Wilson',
	  date: new Date(2025, 7, 5).toLocaleDateString(), // 5 августа 2025
	  startTime: '16:00',
	  endTime: '17:00',
	  status: 'cancelled',
	  rate: null
	},
	{
		id: 8,
	  client: 'eliska1234@gmail.com',
	  psycholog: 'Olivia Martinez',
	  date: new Date(2025, 2, 28).toLocaleDateString(), // 28 марта 2025
	  startTime: '11:30',
	  endTime: '12:30',
	  status: 'completed',
	  rate: 4
	},
	{
		id: 9,
	  client: 'john.doe@mail.com', // изменено
	  psycholog: 'Liam Smith',
	  date: new Date(2024, 10, 15).toLocaleDateString(), // 15 ноября 2024
	  startTime: '12:00',
	  endTime: '13:00',
	  status: 'completed',
	  rate: 3
	},
	{
		id: 10,
	  client: 'eliska1234@gmail.com',
	  psycholog: 'Noah Johnson',
	  date: new Date(2025, 3, 22).toLocaleDateString(), // 22 апреля 2025
	  startTime: '15:30',
	  endTime: '16:30',
	  status: 'upcoming',
	  rate: null
	},
	{
		id: 11,
	  client: 'mary.smith@mail.com', // изменено
	  psycholog: 'Mia Williams',
	  date: new Date(2025, 1, 18).toLocaleDateString(), // 18 февраля 2025
	  startTime: '10:30',
	  endTime: '11:30',
	  status: 'completed',
	  rate: 5
	},
	{
		id: 12,
	  client: 'eliska1234@gmail.com',
	  psycholog: 'Emma Jones',
	  date: new Date(2024, 8, 10).toLocaleDateString(), // 10 сентября 2024
	  startTime: '08:00',
	  endTime: '09:00',
	  status: 'completed',
	  rate: 4
	},
	{
		id: 13,
	  client: 'robert.johnson@mail.com', // изменено
	  psycholog: 'Olivia Davis',
	  date: new Date(2025, 0, 5).toLocaleDateString(), // 5 января 2025
	  startTime: '14:30',
	  endTime: '15:30',
	  status: 'upcoming',
	  rate: null
	}
 ];

localStorage.setItem('sessions',JSON.stringify(sessions));

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


function setInfo() {
  const photo = JSON.parse(localStorage.getItem('userPhoto')) || "images/default.png";
  document.querySelector('.profile__image').src = photo;
  login.textContent = `Your login: ${getCookie('email')}`;
  passwordInput.value = `${getCookie('password')}`;
  checkPass.value = `${getCookie('password')}`;

  users.forEach(user => {
    if (user.email === getCookie('email')) {
      usernameInput.value = user.name;
    }
  });
}


async function changeInfo() {
  if (passwordInput.value !== checkPass.value) {
    alert('Passwords do not match!');
    return;
  }


  const currentEmail = getCookie('email');
  const index = users.findIndex(u => u.email === currentEmail);
  if (index === -1) {
    alert('User not found!');
    return;
  }

  
  users[index].name = usernameInput.value;

  try {
    const newHashedPass = await hashPassword(passwordInput.value, usernameInput.value);
    users[index].password = newHashedPass;

    
    deleteCookie('password');
    setCookie('password', passwordInput.value);

    localStorage.setItem('users', JSON.stringify(users));

    alert('Information was successfully changed!');
  } catch (err) {
    console.error(err);
    alert('Something went wrong! Try again, please...');
  }
}

function renderCompletedSessions(){
	const sessions = JSON.parse(localStorage.getItem('sessions')) || [];
	const sessionsContainer = document.querySelector('.completed-container');
	if (!sessionsContainer) {
		console.error('Container for sessions not found');
		return;
  }

	sessionsContainer.innerHTML = "";

	if(sessions){
		const completedSessions = sessions.filter(ses => {
			return ses.client === getCookie('email') && ses.status === 'completed';
		});

		if(completedSessions){
			

			completedSessions.forEach(ses => {
				const sesCard = document.createElement('div');
				sesCard.classList.add('session__card', 'completed');
				sesCard.setAttribute('data-id', ses.id);
				sesCard.innerHTML = `
					<div class="session__photo">
						<img src="images/ava.jpg" alt="Psycholog photo" class="session__img img-fluid">
					</div>
						<p class="session__name">${ses.psycholog}</p>
						<p class="session__info">${ses.date}</p> 
						<p class="session__info">${ses.startTime} - ${ses.endTime}</p>
				`;

				const ratingElement = renderRating(ses.rate, ses.id, sessions);
				sesCard.appendChild(ratingElement);

				sessionsContainer.appendChild(sesCard);
			})
		} else sessionsContainer.innerHTML = `<h2 class='card__title'>You have no completed sessions</h2>`;
	} else sessionsContainer.innerHTML = `<h2 class='card__title'>You have no completed sessions</h2>`;

}

function renderRating(rate, id, sessions){
	const review = document.createElement('div');
	review.classList.add('session__review');
	if(rate){
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

		rateBtn.addEventListener('click', (e)=>{
			e.preventDefault();
			const rateValue = inputRate.value;

			if (rateValue < 1 || rateValue > 5) {
				alert('Please enter a rating between 1 and 5');
				return;
			}

			const session = sessions.find(ses => ses.id === id);
			if (!session) {
				console.error("Session not found:", id);
				return;
			}
			session.rate = rateValue;
			localStorage.setItem('sessions', JSON.stringify(sessions));

			review.innerHTML = `<div class="session__review">${rateValue} <i class="bi bi-star-fill"></i></div>`
		})
	}

	return review;
}

function renderUpcomingSessions(){
	const sessions = JSON.parse(localStorage.getItem('sessions')) || [];
	const sessionsContainer = document.querySelector('.upcoming-container');
	if (!sessionsContainer) {
		console.error('Container for sessions not found');
		return;
  }

	sessionsContainer.innerHTML = "";

	if(sessions){
		const upcomingSessions = sessions.filter(ses => {
			return ses.client === getCookie('email') && ses.status === 'upcoming';
		});

		if(upcomingSessions){
			

			upcomingSessions.forEach(ses => {
				const sesCard = document.createElement('div');
				sesCard.classList.add('session__card', 'upcoming');
				sesCard.setAttribute('data-id', ses.id);
				sesCard.innerHTML = `
					<div class="session__photo">
						<img src="images/ava.jpg" alt="Psycholog photo" class="session__img img-fluid">
					</div>
						<p class="session__name">${ses.psycholog}</p>
						<p class="session__info">${ses.date}</p>
						<p class="session__info">${ses.startTime} - ${ses.endTime}</p>
						<button class="session__btn">Cancel</button>
				`;
				sessionsContainer.appendChild(sesCard);
			})
		} else sessionsContainer.innerHTML = `<h2 class='card__title'>You have no upcoming sessions</h2>`;
	} else sessionsContainer.innerHTML = `<h2 class='card__title'>You have no upcoming sessions</h2>`;

}

function cancelSession(e){
	const sessions = JSON.parse(localStorage.getItem('sessions')) || [];

	const sesCard = e.target.closest('.upcoming');
	const sesId = parseInt(sesCard.getAttribute('data-id'), 10);

	const newSessions = sessions.filter(ses => {return ses.id !== sesId});
	localStorage.setItem('sessions', JSON.stringify(newSessions));
	sesCard.remove();
	renderUpcomingSessions();
}








