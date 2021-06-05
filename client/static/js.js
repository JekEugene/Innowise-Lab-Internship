class AbstractView {
	constructor(params) {
		this.params = params;
	}

	setTitle(title) {
		document.title = title;
	}

	async getHtml() {
		return '';
	}
}

class Home extends AbstractView {
	constructor(params) {
		super(params);
		this.setTitle('Home');
	}

	async getHtml() {
		
		let response = await fetch(`http://localhost:4000/`, {
			method: `get`,
			credentials: 'include',
		})
		const result = await response.json()
		const res = result.map((el)=>{
			return `
				<div class="videoblock">
					<video class="video" src="/static/videos/${el.link}.mp4" controls></video>
					<p>video name: ${el.name}</p>
					<p>user: ${el.user_id}</p>
				</div>
			`
		})

		return res.join();
	}
}

class Login extends AbstractView {
	constructor(params) {
		super(params);
		this.setTitle('Login');
	}

	async getHtml() {
		return `
				<form onsubmit="log_in(); return false">
					<label>login:</label>
					<input type="text" class="login" name="login" placeholder="enter email" required >
					<label>password:</label>
					<input type="password" class="password" name="password" placeholder="enter password" required >
					<button type="submit">login</button>
				</form>
			`;
	}
}

class Register extends AbstractView {
	constructor(params) {
		super(params);
		this.setTitle('Registration');
	}

	async getHtml() {
		return `
				<form onsubmit="register(); return false">
					<label>login:</label>
					<input type="text" class="login" name="login" placeholder="enter email" required >
					<label>password:</label>
					<input type="password" class="password" name="password" placeholder="enter password" required >
					<button type="submit">registration</button>
				</form>
			`;
	}
}

class AllUsers extends AbstractView {
	constructor(params) {
		super(params);
		this.setTitle('all users');
	}

	async getHtml() {

		let response = await fetch(`http://localhost:4000/users`, {
			method: `get`,
			credentials: 'include',
		})
		const result = await response.json()
		const res = result.map((el)=>{
			return `
				<div class="videoblock">
					<video class="video" src="/static/videos/${el.link}.mp4" controls></video>
					<p>video name: ${el.name}</p>
					<p>user: ${el.user_id}</p>
				</div>
			`
		})

		return `
					<h1>Ваши видео:</h1>
			`;
	}
}


class Users extends AbstractView {
	constructor(params) {
		super(params);
		this.setTitle(getCookie("login"));
	}

	async getHtml() {
		let response = await fetch(`http://localhost:4000/users${location.href.slice(location.href.lastIndexOf('/'))}`, {
			method: `get`,
			credentials: 'include',
		})
		const result = await response.json()

		if(location.href.slice(location.href.lastIndexOf('/')+1) === getCookie('id')){

			const res = result.map((el)=>{
				return `
					<div class="videoblock">
						<a href="/videos/${el.link}"><video class="video" src="/static/videos/${el.link}.mp4" poster></video></a>
						<p>video name: ${el.name}</p>
						<p>user: <a href="/users/${el.user_id}">${el.user_id}</a></p>
					</div>
				`
			})

			return `
					<h1>Ваши видео:</h1>
			` + res.join('');
		} else {

			const res = result.map((el)=>{
				return `
					<div class="videoblock">
						<video class="video" src="/static/videos/${el.link}.mp4" poster></video>
						<p>video name: ${el.name}</p>
						<p>user: ${el.user_id}</p>
					</div>
				`
			})

			return `
					<h1>Видео пользователя:</h1>
			` + res.join('');
		}
		
	}
}

class Videos extends AbstractView {
	constructor(params) {
		super(params);
		this.setTitle('Video');
	}

	async getHtml() {
		return `
					<h1>Video</h1>
			`;
	}
}

class VideoSettings extends AbstractView {
	constructor(params) {
		super(params);
		this.setTitle('Video Settings');
	}

	async getHtml() {
		return `
					<h1>Video Settings</h1>
			`;
	}
}

class Logout extends AbstractView {
	constructor(params) {
		super(params);
		console.log('logout')
		logout()
	}

	async getHtml() {
		return `
					<h1>Logout</h1>
			`;
	}
}

const pathToRegex = (path) =>
	new RegExp('^' + path.replace(/\//g, '\\/').replace(/:\w+/g, '(.+)') + '$');

const navigateTo = (url) => {
	history.pushState(null, null, url);
	router();
};

const getParams = (match) => {
	const values = match.result.slice(1);
	const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(
		(result) => result[1]
	);

	return Object.fromEntries(
		keys.map((key, i) => {
			return [key, values[i]];
		})
	);
};

const router = async () => {
	const routes = [
		{ path: '/', view: Home },
		{ path: '/users', view: AllUsers },
		{ path: '/users/:id', view: Users },
		{ path: '/users/newvideo', view: Users },
		{ path: '/videos/:id', view: Videos },
		{ path: '/videos/:id/settings', view: VideoSettings },
		{ path: '/register', view: Register },
		{ path: '/login', view: Login },
		{ path: '/logout', view: Logout },
	];

	const potentialMatches = routes.map((route) => {
		return {
			route: route,
			result: location.pathname.match(pathToRegex(route.path)),
		};
	});

	let match = potentialMatches.find(
		(potentialMatch) => potentialMatch.result !== null
	);

	if (!match) {
		match = {
			route: routes[0],
			result: [location.pathname],
		};
	}

	const view = new match.route.view(getParams(match));

	console.log(view)

	document.querySelector('#app').innerHTML = await view.getHtml();

	if (getCookie('login')) {
		document.querySelector('.nav').innerHTML = `
			<a href="/" class="nav__link" data-link>home</a>
			<a href="/users/${getCookie('id')}" class="nav__link" data-link>${getCookie(
			'login'
		)}</a>
			<a href="/logout" class="nav__link logout" data-link>logout</a>
		`;
	} else {
		document.querySelector('.nav').innerHTML = `
			<a href="/" class="nav__link" data-link>home</a>
			<a href="/login" class="nav__link" data-link>login</a>
			<a href="/register" class="nav__link" data-link>register</a>
		`;
	}
};

window.addEventListener('popstate', router)

document.querySelector(`.logout`)?.addEventListener('click', (e)=>{
	e.preventDefault()
	logout()
	navigateTo(`/`)
})

document.addEventListener('DOMContentLoaded', () => {
	document.body.addEventListener('click', (e) => {
		if (e.target.matches('[data-link]')) {
			console.log('ae');
			e.preventDefault();
			navigateTo(e.target.href);
		}
	});

	router();
});

function getCookie(name) {
	let matches = document.cookie.match(
		new RegExp(
			'(?:^|; )' +
				name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') +
				'=([^;]*)'
		)
	);
	return matches ? decodeURIComponent(matches[1]) : undefined;
}

function logout() {
	fetch(`http://localhost:4000/auth/logout`, {
		method: `GET`,
		credentials: 'include',
	});
}