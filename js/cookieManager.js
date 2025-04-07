function setCookie(name, value){
	let expires = '';
	let days = 1;
	let date = new Date();
	date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
	expires = '; expires =' + date.toUTCString();
	document.cookie = name + '=' + value + '; path=/' + expires;
}

function getCookie(name){
	let cookies = document.cookie.split('; ');
	for(let cookie of cookies){
		let [key, value] = cookie.split('=');
		if (key === name){
			return value;
		}
	}
	return null;
}

function deleteCookie(name){
	document.cookie = name + '=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC';
}

function updateMenu(){
	let loginLink = document.querySelector('[data-login');

	if(!loginLink){
		loginLink = document.querySelector('[data-logout')
	}

	let menu = loginLink.closest('li');
	if(menu){
		if(getCookie('email')){
			menu.innerHTML = '<button type="button" class="btn btn-primary ms-3" data-logout>Log Out</button>';


			const dashboard = document.createElement('li');
			if(getCookie('role') === 'client'){
				dashboard.innerHTML = `<a href="clientDash.html" class="nav-link dash">Dashboard</a>`
			} else dashboard.innerHTML = `<a href="psychoDash.html" class="nav-link dash">Dashboard</a>`;

			const parentEl = menu.parentNode;

			parentEl.insertBefore(dashboard, menu);

			document.querySelector('[data-logout]').addEventListener('click', () => {
				deleteCookie('email');
				deleteCookie('role');
				if (document.querySelector('.dash')){
					document.querySelector('.dash').remove();
				}
				updateMenu();
			});
			
		} else {
			menu.innerHTML = `<a href="login.html" class="btn btn-primary ms-3" data-login>Log In</a>`;
		}
	}
}

window.setCookie = setCookie;
window.deleteCookie = deleteCookie;
window.getCookie = getCookie;
window.updateMenu = updateMenu;
