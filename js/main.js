
function renderPsychologist(psychologists){
	const container = document.querySelector('.therapist-container');
	container.innerHTML = '';

	psychologists.forEach(ther => {
		const therapistCard = document.createElement('div');
		therapistCard.classList.add('col-md-4', 'mb-4', 'therapist-card');
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
		therapistCard.setAttribute('data-user', ther.idUser);
		container.appendChild(therapistCard);
	})
}

function addBookListeners() {
	const bookBtns = document.querySelectorAll('.therapist__btn');

	bookBtns.forEach(btn => {
		btn.addEventListener('click', (e) => {
			e.preventDefault();
			const therapistId = e.target.closest('.therapist-card').getAttribute('data-user');
			console.log(therapistId);
			bookSession(therapistId);
		});
	});
}

function bookSession(id){
	if(getCookie('role') !== 'client'){
		alert('You are not a client');
	} else {

		fetch('http://localhost:8080/api/hours/getAll')
		.then(response => response.json())
		.then(data => {
			const terms = data.filter(term => term.id_psycholog === id);
			console.log(terms);
			const modalBody = document.querySelector('#bookingModal .modal-body');
			modalBody.innerHTML = ``;

			if(terms.length === 0){
				modalBody.innerHTML = `No terms available, please choose another therapist`;
			} else {
				terms.forEach(term => {
					const termElement = document.createElement('div');
					termElement.classList.add('term');
					termElement.innerHTML = `
						 <p>${term.date} | ${term.start_time} - ${term.end_time}</p>
						 <button class="delete-term btn btn-sm btn-danger" data-id="${term.date}-${term.start}">Book</button>
					`;
					termElement.setAttribute('data-id', term.id);
					modalBody.appendChild(termElement);
				});
			};

			
	
			const bookingModal = new bootstrap.Modal(document.getElementById('bookingModal'));
			 bookingModal.show();

			modalBody.addEventListener('click', (e) => {
				if (e.target.classList.contains('delete-term')) {
					 const termId = e.target.closest('.term').getAttribute('data-id');
					 
					 const term = Array.from(terms).find(t => {return t.id == termId}
					 );

					 console.log(term);
	
					const appointment = {
						start_time: term.start_time,
						end_time: term.end_time,
						rate: null,
						date: term.date,
						client_id: getCookie('email'),
						psychologist_id: term.id_psycholog,
						status: {
							code: 3
						}
					}

					fetch('http://localhost:8080/api/appointments', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(appointment),
					})
					.then(response => {
						if (!response.ok) {
							throw new Error("Failed to post");
						}
						
						alert("Appointment created successfully");
					})
					.catch(error => {
						console.error("Error booking an appointment:", error);
					});
	
					
					fetch(`http://localhost:8080/api/hours/${termId}`, {
						method: 'DELETE',
					})
					.then(response => {
						if (!response.ok) {
							throw new Error("Failed to delete");
						}
						
						console.log("Deleted successfully");
					})
					.catch(error => {
						console.error("Error deleting term:", error);
					});
				
					
					const bookingModal = bootstrap.Modal.getInstance(document.getElementById('bookingModal'));
					bookingModal.hide();

				}
			});
		})
		.catch((error) => {
			console.error('Error:', error);
		});
		
		
	}

	
}


