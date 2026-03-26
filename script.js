/* script.js (Matrix + Hearts) */
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*()✦♥★✿'.split('');
const fontSize = 16;
let columns = Math.floor(canvas.width / fontSize);
let drops = [];

function initDrops() {
    columns = Math.floor(canvas.width / fontSize);
    drops = [];
    for (let x = 0; x < columns; x++) {
        drops[x] = 1;
    }
}
initDrops();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initDrops();
});

function drawMatrix() {
    ctx.fillStyle = 'rgba(5, 5, 20, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];

        if (['♥', '✿', '★'].includes(char)) {
            ctx.fillStyle = '#FF66CC'; // Magenta for cute icons
            ctx.font = `bold ${fontSize + 4}px 'Rajdhani', monospace`;
        } else {
            ctx.fillStyle = '#00FFFF'; // Cyan for text
            ctx.font = `${fontSize}px 'VT323', monospace`;
        }

        ctx.fillText(char, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}
setInterval(drawMatrix, 90);

// Add Web Audio Context and Sword Clash Sound generator
let audioCtx;
function playCyberSwordSound(x, y) {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const time = audioCtx.currentTime;

    // Clash metallic frequencies for sword collision
    const freqs = [1200, 2043, 3102, 4509, 5802];
    freqs.forEach(freq => {
        const osc = audioCtx.createOscillator();
        const oscGain = audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);
        // Slight pitch bend
        osc.frequency.exponentialRampToValueAtTime(freq * 0.98, time + 0.3);

        oscGain.gain.setValueAtTime(0.5 / freqs.length, time);
        oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);

        osc.connect(oscGain).connect(audioCtx.destination);
        osc.start(time);
        osc.stop(time + 0.4);
    });

    // Metallic scrape noise (clang impact)
    const bufferSize = Math.floor(audioCtx.sampleRate * 0.2);
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const bandpass = audioCtx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(6000, time);
    bandpass.frequency.exponentialRampToValueAtTime(1000, time + 0.2);
    bandpass.Q.value = 5;

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0, time);
    noiseGain.gain.linearRampToValueAtTime(1.5, time + 0.02);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

    noise.connect(bandpass).connect(noiseGain).connect(audioCtx.destination);
    noise.start(time);
    noise.stop(time + 0.3);

    createSparks(x, y);
}

// Spark Animation Generator
function createSparks(x, y) {
    for (let i = 0; i < 15; i++) {
        const spark = document.createElement('div');
        spark.classList.add('sword-spark');
        document.body.appendChild(spark);

        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 80 + 20;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        spark.style.left = x + 'px';
        spark.style.top = y + 'px';
        spark.style.setProperty('--tx', tx + 'px');
        spark.style.setProperty('--ty', ty + 'px');

        setTimeout(() => spark.remove(), 400);
    }
}

// Ensure flash overlay exists
let flashOverlay = document.createElement('div');
flashOverlay.id = 'flash-overlay';
document.body.appendChild(flashOverlay);

// Modal logic
function openModal(event, id) {
    if (event && event.clientX) playCyberSwordSound(event.clientX, event.clientY);
    else playCyberSwordSound(window.innerWidth / 2, window.innerHeight / 2);

    flashOverlay.classList.remove('flash-active');
    void flashOverlay.offsetWidth; // trigger reflow
    flashOverlay.classList.add('flash-active');

    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.classList.remove('shake-active');
        void mainContent.offsetWidth;
        mainContent.classList.add('shake-active');
    }

    document.getElementById(id).classList.add('active');
}
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

// Submit simulation
function submitForm(form) {
    const btn = form.querySelector('.submit-btn');
    const og = btn.innerHTML;
    btn.innerHTML = 'DATA_SENT ♥ [GLITCH]';
    btn.classList.add('glitch-active');
    setTimeout(() => {
        form.reset();
        btn.innerHTML = og;
        btn.classList.remove('glitch-active');
    }, 2000);
}

// Tooltips & Automations
document.addEventListener('DOMContentLoaded', () => {
    const triggers = document.querySelectorAll('.tooltip-trigger');
    const tooltip = document.getElementById('cyber-tooltip');

    if (tooltip) {
        const tooltipText = document.getElementById('tooltip-text');

        triggers.forEach(trigger => {
            trigger.addEventListener('mousemove', (e) => {
                const text = trigger.getAttribute('data-tooltip');
                if (text) {
                    tooltip.classList.remove('hidden');
                    tooltip.style.left = e.pageX + 15 + 'px';
                    tooltip.style.top = e.pageY + 15 + 'px';
                    tooltipText.textContent = text;
                }
            });
            trigger.addEventListener('mouseleave', () => { tooltip.classList.add('hidden'); });
        });
    }

    // Autoscroll Achievements
    const track = document.querySelector('.achievement-track');
    if (track) {
        let scrollPos = 0;
        let isHovered = false;
        track.addEventListener('mouseenter', () => isHovered = true);
        track.addEventListener('mouseleave', () => isHovered = false);

        setInterval(() => {
            if (!isHovered) {
                scrollPos += 3;
                // loop back if reached the end
                if (scrollPos >= track.scrollWidth - track.clientWidth) {
                    scrollPos = 0;
                }
                track.scrollLeft = scrollPos;
            }
        }, 20);
    }
});
