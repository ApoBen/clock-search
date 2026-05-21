document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const searchInput = document.getElementById('searchInput');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const dobInput = document.getElementById('dobInput');
    const ageCounter = document.getElementById('ageCounter');
    const decimalsInput = document.getElementById('decimalsInput');

    // State
    let birthDate = localStorage.getItem('userDob');
    let userDecimals = parseInt(localStorage.getItem('userDecimals')) || 9;
    let animationFrameId = null;
    let currentDotCount = -1;

    // --- Search functionality & Auto-focus ---
    
    // Auto focus on load
    searchInput.focus();

    // Focus on any keypress (if not already focused and not interacting with modal)
    document.addEventListener('keydown', (e) => {
        // Exclude system keys, function keys, and modal interactions
        if (settingsModal.classList.contains('active')) return;
        
        if (e.key.length === 1 && document.activeElement !== searchInput) {
            searchInput.focus();
        }
    });

    // Handle search submission
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                // Redirect to Google search
                window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            }
        }
    });

    // --- Settings Modal Logic ---

    settingsBtn.addEventListener('click', () => {
        if (birthDate) {
            dobInput.value = birthDate;
        }
        decimalsInput.value = userDecimals;
        settingsModal.classList.add('active');
    });

    cancelBtn.addEventListener('click', () => {
        settingsModal.classList.remove('active');
        if (!birthDate) {
            ageCounter.textContent = "0." + "0".repeat(userDecimals);
        }
    });

    saveBtn.addEventListener('click', () => {
        if (dobInput.value) {
            birthDate = dobInput.value;
            userDecimals = parseInt(decimalsInput.value);
            if(isNaN(userDecimals) || userDecimals < 0) userDecimals = 0;
            if(userDecimals > 15) userDecimals = 15;
            
            localStorage.setItem('userDob', birthDate);
            localStorage.setItem('userDecimals', userDecimals);
            
            settingsModal.classList.remove('active');
            
            // Force re-render of dots if decimals changed because size changes
            currentDotCount = -1; 
            
            startClock();
        } else {
            alert('Lütfen geçerli bir tarih seçin.');
        }
    });

    // --- Age Calculation & Sphere Logic ---

    const MILLISECONDS_IN_A_YEAR = 1000 * 60 * 60 * 24 * 365.25;

    function calculateAge() {
        if (!birthDate) return null;
        const now = new Date();
        const dob = new Date(birthDate);
        const diffMs = now - dob;
        const ageInYears = diffMs / MILLISECONDS_IN_A_YEAR;
        return ageInYears;
    }

    function renderDots(count) {
        const orbit = document.getElementById('orbit');
        orbit.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            const angle = (i / count) * 360;
            dot.style.left = '50%';
            dot.style.top = '50%';
            dot.style.marginTop = '-4px';
            dot.style.marginLeft = '-4px';
            dot.style.transform = `rotate(${angle}deg) translateY(calc((var(--sphere-size) / -2) - 20px))`;
            orbit.appendChild(dot);
        }
    }

    function updateSphere(age) {
        // Size mapping based on decimal places chosen (more decimals = bigger sphere)
        const baseSize = 80 + (userDecimals * 15);
        const sizeMultiplier = 1; // px per year
        let newSize = baseSize + (age * sizeMultiplier);
        
        if (newSize > 350) newSize = 350;

        // Color mapping: Blue (220) to Green (120)
        // Let's assume life expectancy 80, so map age 0->80 to hue 220->120
        let hue = 220 - (age * (100 / 80));
        if (hue < 120) hue = 120; // Cap at Green

        // Update CSS variables
        document.documentElement.style.setProperty('--sphere-size', `${newSize}px`);
        document.documentElement.style.setProperty('--sphere-color', `hsl(${hue}, 80%, 50%)`);

        // Dynamic dots: 1 dot per 5 years
        const targetDotCount = Math.floor(age / 5);
        if (currentDotCount !== targetDotCount) {
            renderDots(targetDotCount);
            currentDotCount = targetDotCount;
        }
    }

    function renderLoop() {
        const age = calculateAge();
        if (age !== null && age >= 0) {
            ageCounter.textContent = age.toFixed(userDecimals);
            updateSphere(age);
        } else if (age !== null && age < 0) {
            ageCounter.textContent = "Geçersiz Tarih";
        }

        animationFrameId = requestAnimationFrame(renderLoop);
    }

    function startClock() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        if (birthDate) {
            renderLoop();
        } else {
            // Show modal on first load if no DOB is set
            settingsModal.classList.add('active');
        }
    }

    // Init
    startClock();
});
