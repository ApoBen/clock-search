document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const searchInput = document.getElementById('searchInput');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const dobInput = document.getElementById('dobInput');
    const ageCounter = document.getElementById('ageCounter');

    // State
    let birthDate = localStorage.getItem('userDob');
    let animationFrameId = null;

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
        settingsModal.classList.add('active');
    });

    cancelBtn.addEventListener('click', () => {
        settingsModal.classList.remove('active');
        if (!birthDate) {
            // Optional: User cancelled without setting birthdate
            ageCounter.textContent = "0.000000000";
        }
    });

    saveBtn.addEventListener('click', () => {
        if (dobInput.value) {
            birthDate = dobInput.value;
            localStorage.setItem('userDob', birthDate);
            settingsModal.classList.remove('active');
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

    function updateSphere(age) {
        // Base size 100px. Grows slightly as age increases.
        // Example: 20 years old = ~140px, 40 years old = ~180px
        const baseSize = 100;
        const sizeMultiplier = 2; // px per year
        let newSize = baseSize + (age * sizeMultiplier);
        
        // Cap size so it doesn't break layout
        if (newSize > 250) newSize = 250;
        if (newSize < 100) newSize = 100;

        // Color mapping
        // Youth: cool colors (Hue ~200, Cyan/Blue)
        // Middle age: warm colors (Hue ~100-50, Green/Yellow)
        // Older: hot colors (Hue ~0, Red)
        // Let's map age 0->200 to age 100->0 roughly.
        // Formula: Hue starts at 220, decreases by ~2 per year.
        let hue = 220 - (age * 2.5);
        if (hue < 0) hue = 0; // Cap at Red

        // Update CSS variables
        document.documentElement.style.setProperty('--sphere-size', `${newSize}px`);
        document.documentElement.style.setProperty('--sphere-color', `hsl(${hue}, 80%, 50%)`);
    }

    function renderLoop() {
        const age = calculateAge();
        if (age !== null && age >= 0) {
            // Update exact text (9 decimal places for fast ticking effect)
            ageCounter.textContent = age.toFixed(9);
            
            // Only update sphere logic roughly every frame
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
