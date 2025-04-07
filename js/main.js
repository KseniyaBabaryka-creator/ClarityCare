const psychologist = [
	{
		id: 'emily.carter@gmail.com',
		name: 'Emily Carter',
		profilePicture: 'images/emily.jpg',
		specialization: 'anxiety',
		experience: 12,
		rating: 5,
		motto: 'Help you with your anxiety'
	},
	{
		id: 'michael.thompson@gmail.com',
		name: 'Michael Thompson',
		profilePicture: 'images/michael.jpg',
		specialization: 'stress',
		experience: 2,
		rating: 4.7,
		motto: 'Help you with your stress'
	},
	{
		id: 'isabella.green@gmail.com',
		name: 'Isabella Green',
		profilePicture: 'images/isabella.jpg',
		specialization: 'hormones',
		experience: 3,
		rating: 3.9,
		motto: 'Help you with your hormones'
	}
]

localStorage.setItem('psychologists', JSON.stringify(psychologist));

function renderPsychologist(){

	const therapists = JSON.parse(localStorage.getItem('psychologists'));
	const container = document.querySelector('.therapist-container');

	therapists.forEach(ther => {
		const therapistCard = document.createElement('div');
		therapistCard.classList.add('col-md-4', 'mb-4');
		therapistCard.innerHTML = `
			<div class="therapists__item h-100">
				<img src='${ther.profilePicture}' alt="Threapist photo" class="therapists__img img-fluid mb-3" width="150">
				<h3 class="therapists__name">Dr. ${ther.name}</h3>
				<p class="therapists__field">${ther.specialization} Therapist</p>
				<hr>
				<p class="therapist__motto">"${ther.motto}"</p>
				<a href="#" class="therapist__btn btn btn-outline-primary" data-id="${ther.id}">Book a Session</a>
			</div>
		`;
		container.appendChild(therapistCard);
	})
}

function bookSession(id){
	if(getCookie('role') !== 'client'){
		alert('You are not a client');
	} else {
		const savedTerms = JSON.parse(localStorage.getItem('terms'));
		const terms = savedTerms.filter(term => term.psycholog === id);
		const modalBody = document.querySelector('#bookingModal .modal-body');
		modalBody.innerHTML = ``;

		if(terms.length === 0){
			modalBody.innerHTML = `No terms available, please choose another therapist`;
		} else {
			terms.forEach(term => {
				const termElement = document.createElement('div');
				termElement.classList.add('term');
				termElement.innerHTML = `
                <p>${term.date} | ${term.start} - ${term.end}</p>
                <button class="delete-term btn btn-sm btn-danger" data-id="${term.date}-${term.start}">Book</button>
            `;
            modalBody.appendChild(termElement);
			});
		};

		modalBody.addEventListener('click', (e) => {
			if (e.target.classList.contains('delete-term')) {
				 const termId = e.target.getAttribute('data-id');
				 let sessions = JSON.parse(localStorage.getItem('sessions'));
				 const psycholog = JSON.parse(localStorage.getItem('users')).find(u => u.email === therapistId).name;
				 const term = terms.find(t => 
					`${t.date}-${t.start}` === termId
				 );

				 const meeting = {
					id: sessions.length + 1,
					client: getCookie('email'),
					psycholog: psycholog,
					date: term.date,
					startTime: term.start,
					endTime: term.end,
					status: 'upcoming',
					rate: null
				 };

				 sessions.push(meeting);
				 localStorage.setItem('sessions', JSON.stringify(sessions));
				 removeTerm(therapistId, termId);
			}
	   });

		const bookingModal = new bootstrap.Modal(document.getElementById('bookingModal'));
    	bookingModal.show();
	}

	
}

function removeTerm(therapistId, termId) {
	let savedTerms = JSON.parse(localStorage.getItem('terms')) || [];

	
	savedTerms = savedTerms.filter(term => !(term.psycholog === therapistId && `${term.date}-${term.start}` === termId));

	localStorage.setItem('terms', JSON.stringify(savedTerms));

	
	const modal = document.querySelector('.modal'); 
    if (modal && modal.close) {
        modal.close();
    }
}
