/*
 * Plays manim animations beat by beat.
 *
 *   <div class="anim" data-anim="s08_type_confusion"></div>
 *
 * Entering a slide plays beat 0; every "next" plays the following beat; going
 * back shows the previous beat's final frame. Beat k is fragment index k-1, so
 * an HTML fragment with data-fragment-index="k-1" appears together with beat k.
 * Clips come from media/<name>/beat_NN.mp4, final frames from beat_NN.png, and
 * beat counts and render versions from media/anims.js (written by anim/render.py).
 */
window.RevealAnim = (() => {
	const MEDIA = 'media/';
	// If playback cannot start (e.g., a hidden tab), show the beat's final frame instead.
	const PLAY_TIMEOUT_MS = 1500;
	let deck;

	const src = (anim, beat, ext) =>
		`${MEDIA}${anim.name}/beat_${String(beat).padStart(2, '0')}.${ext}?v=${anim.version}`;

	function build(el) {
		const name = el.dataset.anim;
		const { beats, version } = (window.ANIMS || {})[name] || {};
		if (!beats) {
			el.classList.add('anim-missing');
			el.textContent = `missing animation: ${name}`;
			return;
		}
		// `wanted` is the frame the current state asks for; `top` the one painted last.
		el.anim = { name, beats, version, videos: [], stills: [], z: 0, wanted: null, top: null, pending: null };
		for (let beat = 0; beat < beats; beat++) {
			const still = document.createElement('img');
			still.className = 'anim-frame';
			still.loading = 'lazy';
			still.src = src(el.anim, beat, 'png');
			el.appendChild(still);
			el.anim.stills.push(still);
		}
		const section = el.closest('section');
		for (let beat = 1; beat < beats; beat++) {
			const step = document.createElement('span');
			step.className = 'fragment anim-step';
			step.dataset.beat = beat;
			step.dataset.fragmentIndex = beat - 1;
			section.appendChild(step);
		}
	}

	function load(el) {
		if (!el.anim || el.anim.videos.length) return;
		for (let beat = 0; beat < el.anim.beats; beat++) {
			const video = document.createElement('video');
			video.className = 'anim-frame';
			video.muted = true;
			video.playsInline = true;
			video.preload = 'auto';
			video.setAttribute('data-ignore', '');
			video.src = src(el.anim, beat, 'mp4');
			el.appendChild(video);
			el.anim.videos.push(video);
		}
	}

	function unload(el) {
		if (!el.anim) return;
		reset(el);
		for (const video of el.anim.videos) {
			video.pause();
			video.removeAttribute('src');
			video.load();
			video.remove();
		}
		el.anim.videos = [];
	}

	function cancelPending(el) {
		const pending = el.anim.pending;
		if (!pending) return;
		clearTimeout(pending.timer);
		pending.video.removeEventListener('playing', pending.shown);
		el.anim.pending = null;
	}

	function reset(el) {
		cancelPending(el);
		el.anim.wanted = null;
		el.anim.top = null;
		el.anim.videos.forEach((video) => video.pause());
		el.querySelectorAll('.anim-frame.active').forEach((node) => node.classList.remove('active'));
	}

	// Raise `node` above everything, then hide the rest once it has painted, so
	// consecutive beats (whose boundary frames match) swap without a flash.
	function activate(el, node) {
		node.style.zIndex = ++el.anim.z;
		node.classList.add('active');
		el.anim.top = node;
		requestAnimationFrame(() =>
			requestAnimationFrame(() => {
				for (const other of el.querySelectorAll('.anim-frame.active')) {
					if (other === el.anim.top) continue;
					other.classList.remove('active');
					if (other.tagName === 'VIDEO') other.pause();
				}
			})
		);
	}

	function play(el, beat) {
		load(el);
		cancelPending(el);
		const video = el.anim.videos[beat];
		el.anim.wanted = video;
		const pending = { video };
		pending.shown = () => {
			cancelPending(el);
			if (el.anim.wanted === video) activate(el, video);
		};
		pending.timer = setTimeout(() => {
			video.pause();
			still(el, beat);
		}, PLAY_TIMEOUT_MS);
		el.anim.pending = pending;
		video.addEventListener('playing', pending.shown, { once: true });
		video.currentTime = 0;
		video.play().catch(() => {
			if (el.anim.pending === pending) still(el, beat);
		});
	}

	// Not img.decode(): it can stay pending while the page is hidden.
	function still(el, beat) {
		cancelPending(el);
		const img = el.anim.stills[beat];
		img.loading = 'eager';
		el.anim.wanted = img;
		const show = () => {
			if (el.anim.wanted === img) activate(el, img);
		};
		if (img.complete && img.naturalWidth) show();
		else img.addEventListener('load', show, { once: true });
	}

	const animOf = (slide) => slide && slide.querySelector('.anim[data-anim]');
	const visibleBeat = (slide) => slide.querySelectorAll('.anim-step.visible').length;

	function keepNearbyLoaded() {
		const slides = deck.getSlides();
		const current = slides.indexOf(deck.getCurrentSlide());
		slides.forEach((slide, index) => {
			const el = animOf(slide);
			if (!el || !el.anim) return;
			if (Math.abs(index - current) <= 1) load(el);
			else unload(el);
		});
	}

	function enter(slide, forward) {
		const el = animOf(slide);
		if (!el || !el.anim) return;
		const beat = visibleBeat(slide);
		if (beat === 0 && forward) play(el, 0);
		else still(el, beat);
	}

	function onSlideChanged(event) {
		const previous = animOf(event.previousSlide);
		if (previous && previous.anim) reset(previous);
		keepNearbyLoaded();
		const slides = deck.getSlides();
		const forward =
			!event.previousSlide ||
			slides.indexOf(event.currentSlide) > slides.indexOf(event.previousSlide);
		enter(event.currentSlide, forward);
	}

	function onFragment(event, shown) {
		const steps = event.fragments.filter((fragment) => fragment.classList.contains('anim-step'));
		if (!steps.length) return;
		const slide = steps[0].closest('section');
		const el = animOf(slide);
		if (!el || !el.anim) return;
		const beat = visibleBeat(slide);
		if (shown) play(el, beat);
		else still(el, beat);
	}

	// Print pages may be clones without `el.anim`, so work from the DOM alone.
	function printStills() {
		const separate = deck.getConfig().pdfSeparateFragments;
		document.querySelectorAll('.anim[data-anim]').forEach((el) => {
			const stills = el.querySelectorAll('img.anim-frame');
			if (!stills.length) return;
			const beat = separate ? visibleBeat(el.closest('section')) : stills.length - 1;
			stills.forEach((img, index) => {
				img.loading = 'eager';
				img.classList.toggle('active', index === beat);
			});
		});
	}

	return {
		id: 'anim',
		init(reveal) {
			deck = reveal;
			document.querySelectorAll('.reveal .slides .anim[data-anim]').forEach(build);
			if (/print-pdf/i.test(window.location.search)) {
				deck.on('pdf-ready', printStills);
				deck.on('ready', printStills);
				return;
			}
			deck.on('ready', (event) => {
				keepNearbyLoaded();
				enter(event.currentSlide, true);
			});
			deck.on('slidechanged', onSlideChanged);
			deck.on('fragmentshown', (event) => onFragment(event, true));
			deck.on('fragmenthidden', (event) => onFragment(event, false));
		},
	};
})();
