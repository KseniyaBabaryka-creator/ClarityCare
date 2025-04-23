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

	setCookie('password', password);

	return hashPassword(password, email).then(hashed => {
		return fetch(`http://localhost:8080/api/users/by-email?email=${encodeURIComponent(email)}`)
			.then(response => {
				if (!response.ok) {
					throw new Error('User not found');
				}
				return response.json();
			})
			.then(user => {
				console.log('User from server:', user);

				if (user.password === hashed) {
					setCookie('email', email);
					setCookie('role', user.role);
					console.log('Login successful for:', email);
					return true;
				} else {
					console.log('Invalid password');
					deleteCookie('password');
					return false;
				}
			})
			.catch(err => {
				console.error('Login error:', err);
				return false;
			});

		});
}

function registerUser(userData) {
	return new Promise((resolve, reject) => {
		hashPassword(userData.password, userData.email)
			.then(hashed => {
				userData.password = hashed;

				fetch('http://localhost:8080/api/users', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(userData)
				})
					.then(response => {
						if (!response.ok) {
							throw new Error('Registration error');
						}
						return response.json();
					})
					.then(data => {
						console.log('User added:', data);
						resolve({ success: true, message: 'Registration succeeded!' });
					})
					.catch(error => {
						console.error('Registration error:', error);
						reject({ success: false, message: 'Registration failed. Possibly email already exists.' });
					});

				if(userData.role === 'psychologist'){
					fetch('http://localhost:8080/api/psychologists', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify(userData)
					})
						.then(response => {
							if (!response.ok) {
								throw new Error('Registration error');
							}
							return response.json();
						})
						.then(data => {
							console.log('User added:', data);
							resolve({ success: true, message: 'Registration succeeded!' });
						})
						.catch(error => {
							console.error('Registration error:', error);
							reject({ success: false, message: 'Registration failed. Possibly email already exists.' });
						});
				}

				if(userData.role === 'client'){
					fetch('http://localhost:8080/api/clients', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify(userData)
					})
					.then(response => {
						if (!response.ok) {
							throw new Error('Registration error');
						}
						return response.json();
					})
					.then(data => {
						console.log('User added:', data);
						resolve({ success: true, message: 'Registration succeeded!' });
					})
					.catch(error => {
						console.error('Registration error:', error);
						reject({ success: false, message: 'Registration failed. Possibly email already exists.' });
					});
				}
			})
			.catch(err => {
				console.error('Error while password hashing:', err);
				reject({ success: false, message: 'Error occurred while processing your registration.' });
			});
	});
}


