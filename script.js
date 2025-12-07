/* 
   GLOBAL VARIABLES (Must be declared first)
   ================================================================ 
*/
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

/* 
   STARFIELD ANIMATION 
   ================================================================ 
*/
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');

let width, height;
let stars = [];

const STAR_COUNT_FACTOR = 8000; 
const STAR_SPEED_BASE = 0.05;

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    initStars();
}

class Star {
    constructor() {
        this.reset(true);
    }

    reset(initial = false) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.z = Math.random() * 2 + 0.5; 
        this.size = Math.random() * 1.5;
        this.opacity = Math.random();
        this.twinkleSpeed = Math.random() * 0.02 + 0.005;
        this.twinkleDir = Math.random() > 0.5 ? 1 : -1;
    }

    update() {
        // Parallax with cursor position
        const mouseOffsetX = (mouseX - width / 2) * 0.005 * this.z;
        const mouseOffsetY = (mouseY - height / 2) * 0.005 * this.z;

        this.x += 0.1 * this.z; 
        
        this.opacity += this.twinkleSpeed * this.twinkleDir;
        if (this.opacity > 1 || this.opacity < 0.2) {
            this.twinkleDir *= -1;
        }

        if (this.x > width) {
            this.x = 0;
            this.y = Math.random() * height;
        }
    }

    draw() {
        let drawX = this.x - (mouseX - width / 2) * 0.02 * this.z;
        let drawY = this.y - (mouseY - height / 2) * 0.02 * this.z;

        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(drawX, drawY, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        if (this.size > 1.2) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = "white";
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
}

function initStars() {
    stars = [];
    const count = Math.floor((width * height) / STAR_COUNT_FACTOR);
    for (let i = 0; i < count; i++) {
        stars.push(new Star());
    }
}

function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; 
    ctx.clearRect(0, 0, width, height);

    stars.forEach(star => {
        star.update();
        star.draw();
    });

    requestAnimationFrame(animate);
}

window.addEventListener('resize', resize);
resize();
animate();

/* 
   CUSTOM CURSOR & TILT
   ================================================================ 
*/
const cursor = document.getElementById('cursor');
const cursorBlur = document.getElementById('cursor-blur');
const card = document.getElementById('tilt-card');

// Smooth cursor
let cursorX = window.innerWidth / 2;
let cursorY = window.innerHeight / 2;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Tilt Calculation
    if (window.innerWidth > 480) {
        const rect = card.getBoundingClientRect();
        const cardX = rect.left + rect.width / 2;
        const cardY = rect.top + rect.height / 2;
        
        const angleX = (cardY - mouseY) / 100;
        const angleY = (mouseX - cardX) / 100;
        
        card.style.transform = `rotateX(${angleX}deg) rotateY(${angleY}deg)`;
    }
});

// Reset tilt on leave
document.addEventListener('mouseleave', () => {
    card.style.transform = `rotateX(0deg) rotateY(0deg)`;
});

function cursorLoop() {
    // Linear interpolation for smoothness
    cursorX += (mouseX - cursorX) * 0.2;
    cursorY += (mouseY - cursorY) * 0.2;
    
    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;
    
    cursorBlur.style.left = `${cursorX}px`;
    cursorBlur.style.top = `${cursorY}px`;
    
    requestAnimationFrame(cursorLoop);
}
cursorLoop();

/* 
   DISCORD STATUS & ACTIVITY (Lanyard)
   ================================================================ 
*/
const DISCORD_ID = '489395225681461270';
const statusDot = document.getElementById('status-dot');
const avatarImg = document.getElementById('avatar');

// Activity Elements
const activityContainer = document.getElementById('activity-container');
const actImg = document.getElementById('activity-img');
const actDefaultIcon = document.getElementById('activity-default-icon');
const actName = document.getElementById('activity-name');
const actState = document.getElementById('activity-state');
const actTime = document.getElementById('activity-time');

let currentActivityStart = null;

async function fetchLanyard() {
    try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
        const data = await response.json();
        
        if (data.success && data.data) {
            updatePresence(data.data);
        }
    } catch (error) {
        console.error('Lanyard Fetch Error:', error);
    }
}

// Initial fetch and interval
fetchLanyard();
setInterval(fetchLanyard, 5000);

// Timer Interval (every 1s)
setInterval(() => {
    if (currentActivityStart) {
        const diff = Date.now() - currentActivityStart;
        if (diff > 0) {
            const hours = Math.floor(diff / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            
            const hStr = hours > 0 ? `${hours}h ` : '';
            const mStr = `${minutes}m `;
            const sStr = `${String(seconds).padStart(2, '0')}s`;
            
            actTime.textContent = `${hStr}${mStr}${sStr} elapsed`;
            actTime.style.display = 'block';
        }
    } else {
        actTime.style.display = 'none';
    }
}, 1000);

function updatePresence(data) {
    // 1. Status Dot
    statusDot.className = `status ${data.discord_status}`;
    
    // 2. Avatar
    if (data.discord_user) {
        const user = data.discord_user;
        avatarImg.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`;
    }

    // 3. Activity Logic
    const activities = data.activities || [];
    
    // Priority: Spotify -> Game/Rich Presence -> Nothing
    const spotify = activities.find(a => a.id === 'spotify:1');
    const game = activities.find(a => a.id !== 'spotify:1' && a.type !== 4);
    
    if (spotify) {
        renderActivity(spotify, 'spotify');
    } else if (game) {
        renderActivity(game, 'game');
    } else {
        activityContainer.classList.add('hidden');
        currentActivityStart = null; // Reset timer
    }
}

// Custom Game Images (Fallback)
const GAME_IMAGES = {
    'War Thunder': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/War_Thunder_Logo.png/640px-War_Thunder_Logo.png',
    'Minecraft': 'https://upload.wikimedia.org/wikipedia/en/5/51/Minecraft_cover.png',
    'Counter-Strike 2': 'https://upload.wikimedia.org/wikipedia/en/f/f2/CS2_Cover_Art.jpg',
    'Visual Studio Code': 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Visual_Studio_Code_1.35_icon.svg'
};

function renderActivity(activity, type) {
    activityContainer.classList.remove('hidden');
    // console.log('Rendering Activity:', activity); // Debug
    
    // Handle Timestamp
    if (activity.timestamps && activity.timestamps.start) {
        currentActivityStart = activity.timestamps.start;
    } else {
        currentActivityStart = null;
    }
    
    if (type === 'spotify') {
        actName.textContent = activity.details; 
        actState.textContent = `by ${activity.state}`; 
        
        if (activity.assets && activity.assets.large_image) {
            const imgId = activity.assets.large_image.replace('spotify:', '');
            actImg.src = `https://i.scdn.co/image/${imgId}`;
            actImg.style.display = 'block';
            actDefaultIcon.style.display = 'none';
        }
    } 
    else if (type === 'game') {
        actName.textContent = activity.name;
        actState.textContent = activity.details || activity.state || 'Playing';
        
        // 1. Try Discord Assets
        if (activity.assets && activity.assets.large_image) {
            let imgId = activity.assets.large_image;
            const appId = activity.application_id;
            
            if (imgId.startsWith('mp:')) {
                imgId = imgId.replace('mp:', 'https://media.discordapp.net/');
                actImg.src = imgId;
            } else {
                actImg.src = `https://cdn.discordapp.com/app-assets/${appId}/${imgId}.png`;
            }
            actImg.style.display = 'block';
            actDefaultIcon.style.display = 'none';
        } 
        // 2. Try Manual Fallback
        else if (GAME_IMAGES[activity.name]) {
            actImg.src = GAME_IMAGES[activity.name];
            actImg.style.display = 'block';
            actDefaultIcon.style.display = 'none';
        }
        // 3. No image found -> Default Icon
        else {
            actImg.style.display = 'none';
            actDefaultIcon.style.display = 'block';
        }
    }
}

/* 
   TIME (Vladivostok UTC+10)
   ================================================================ 
*/
function updateTime() {
    const timeElement = document.getElementById('local-time');
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const vvoTime = new Date(utc + (3600000 * 10));
    
    const hours = String(vvoTime.getHours()).padStart(2, '0');
    const minutes = String(vvoTime.getMinutes()).padStart(2, '0');
    
    timeElement.textContent = `${hours}:${minutes}`;
}
setInterval(updateTime, 1000);
updateTime();

/* 
   COPY TO CLIPBOARD
   ================================================================ 
*/
function copyToClipboard(text, message) {
    navigator.clipboard.writeText(text).then(() => {
        showToast(message);
    }).catch(err => {
        console.error(err);
        showToast('Failed to copy');
    });
}

function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-check"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}
