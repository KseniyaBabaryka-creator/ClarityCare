async function hashPassword(password, username){
	const encoder = new TextEncoder();
	const salt = encoder.encode(username);

	const keyMaterial = await crypto.subtle.importKey(
		'raw', encoder.encode(password), { name: 'PBKDF2' }, false, ['deriveBits']
	);

	const hashBuffer = await crypto.subtle.deriveBits(
		{
			name: 'PBKDF2',
			salt: salt,
			iterations: 100000,
			hash: 'SHA-256',
		},
		keyMaterial, 256
	);

	return Array.from(new Uint8Array(hashBuffer))
		.map(byte => byte.toString(16).padStart(2, '0'))
		.join('');
}

function loginUser(email, password){
	let users = localStorage.getItem('users');

	if (!users) {
		 addToLocalStorage();
		 users = localStorage.getItem('users');
	}

	console.log('Users loaded from localStorage:', users);

	users = JSON.parse(users);

	setCookie('password', password);

	return hashPassword(password, email).then(hashed => {
		 console.log('Hashed entered password:', hashed);

		 for (let user of users) {
			  if (user.email === email && user.password === hashed) {
					setCookie('email', email);
					setCookie('role', user.role);
					console.log('Login successful for:', email);
					return true;
			  }
		 }

		 console.log('Invalid email or password');
		 deleteCookie('password', password)
		 return false;
	}).catch(err => {
		 console.error('Error during login:', err);
		 return false;
	});
}


function addToLocalStorage(){
	let users = [];
	Promise.all([
		hashPassword('Dd123456', 'emily.carter@gmail.com'),
		hashPassword('Kk123456', 'michael.tompson@gmail.com')
	]).then(([hashed1, hashed2]) => 
	{
		users.push(
			{
				name: 'Emily Carter',
				email: 'emily.carter@gmail.com',
				password: hashed1,
				role: 'psychologist'
			},
			{
				name: 'Michael Tompson',
				email: 'michael.tompson@gmail.com',
				password: hashed2,
				role: 'psychologist'
			}
		);

		localStorage.setItem('users', JSON.stringify(users));
	});
}


function registerUser(userData){
	return new Promise((resolve, reject) => {
		 hashPassword(userData.password, userData.email)
			  .then(hashed => {
					userData.password = hashed;

					let users = JSON.parse(localStorage.getItem('users')) || [];

					const existingUser = users.find(u => u.email === userData.email);
					if (existingUser) {
						 reject({ success: false, message: 'User with this email already exists.' });
					} else {
						 const newUser = { id: users.length + 1, ...userData };
						 users.push(newUser);
						 console.log(users);
						 localStorage.setItem('users', JSON.stringify(users));
						 console.log('User added:', newUser);
						 resolve({ success: true, message: 'Registration succeeded!' });
					}
			  })
			  .catch(err => {
					console.error('Error during registration process:', err);
					reject({ success: false, message: 'Error occurred while processing your registration. Please try again.' });
			  });

			  
	});
}
