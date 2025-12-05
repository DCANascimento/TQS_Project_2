/**
 * Game Details Page Manager
 */

class GameDetails {
    constructor() {
        this.gameId = null;
        this.gameData = null;
        this.currentCalendarDate = new Date();
        this.elements = this.initializeElements();
        this.init();
    }

    initializeElements() {
        return {
            loadingState: document.getElementById('loading-state'),
            errorState: document.getElementById('error-state'),
            gameContent: document.getElementById('game-content'),
            gameTitle: document.getElementById('game-title'),
            gamePrice: document.getElementById('game-price'),
            gameCondition: document.getElementById('game-condition'),
            gameDate: document.getElementById('game-date'),
            gameDescription: document.getElementById('game-description'),
            statusBadge: document.getElementById('status-badge'),
            ownerName: document.getElementById('owner-name'),
            ownerInitial: document.getElementById('owner-initial'),
            ownerRating: document.getElementById('owner-rating'),
            startDate: document.getElementById('start-date'),
            endDate: document.getElementById('end-date'),
            availabilitySection: document.getElementById('availability-section'),
            mainImage: document.getElementById('game-main-image'),
            imagePlaceholder: document.getElementById('image-placeholder'),
            thumbnailStrip: document.getElementById('thumbnail-strip'),
            rentBtn: document.getElementById('rent-btn'),
            contactOwnerBtn: document.getElementById('contact-owner-btn'),
            signOutBtn: document.getElementById('sign-out-btn'),
            calendarTitle: document.getElementById('calendar-title'),
            calendarDays: document.getElementById('calendar-days'),
            prevMonth: document.getElementById('prev-month'),
            nextMonth: document.getElementById('next-month')
        };
    }

    async init() {
        BitSwapUtils.init();
        this.getGameIdFromUrl();

        if (this.gameId) {
            await this.loadGameDetails();
        } else {
            this.showError();
        }

        this.bindEvents();
    }

    getGameIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        this.gameId = urlParams.get('id');
    }

    async loadGameDetails() {
        try {
            this.showLoading();

            const response = await fetch(`/games/${this.gameId}`);
            if (!response.ok) {
                throw new Error('Game not found');
            }

            this.gameData = await response.json();
            this.displayGameDetails();
            this.showContent();
        } catch (error) {
            console.error('Error loading game details:', error);
            this.showError();
        }
    }

    displayGameDetails() {
        // Title
        this.elements.gameTitle.textContent = this.gameData.title;

        // Price
        this.elements.gamePrice.textContent = `$${this.gameData.pricePerDay.toFixed(2)}/day`;

        // Condition
        this.elements.gameCondition.textContent = this.gameData.condition.charAt(0).toUpperCase() + this.gameData.condition.slice(1);

        // Date
        const dateAdded = new Date(this.gameData.createdAt);
        this.elements.gameDate.textContent = dateAdded.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        // Description
        this.elements.gameDescription.textContent = this.gameData.description || 'No description available.';

        // Status
        const statusClass = this.gameData.active ? 'available' : 'rented';
        const statusText = this.gameData.active ? 'Available' : 'Rented';
        this.elements.statusBadge.className = `status-badge ${statusClass}`;
        this.elements.statusBadge.textContent = statusText;

        // Owner
        const ownerUsername = this.gameData.ownerUsername || 'Unknown';
        this.elements.ownerName.textContent = ownerUsername;
        this.elements.ownerInitial.textContent = ownerUsername.charAt(0).toUpperCase();

        // Owner rating (default 4.5 since backend doesn't have this)
        const rating = 4.5;
        this.displayRating(rating);

        // Availability calendar
        if (this.gameData.startDate && this.gameData.endDate) {
            this.elements.availabilitySection.style.display = 'block';
            this.renderCalendar();
        } else {
            this.elements.availabilitySection.style.display = 'none';
        }

        // Images
        this.displayImages();

        // Update rent button state
        if (!this.gameData.active) {
            this.elements.rentBtn.disabled = true;
            this.elements.rentBtn.textContent = 'Currently Rented';
        }
    }

    displayImages() {
        if (this.gameData.photos && this.gameData.photos.trim() !== '') {
            // Split photos by comma (assuming comma-separated base64 or URLs)
            const photos = this.gameData.photos.split(',').filter(p => p.trim() !== '');

            if (photos.length > 0) {
                // Display main image
                this.elements.mainImage.src = photos[0];
                this.elements.mainImage.style.display = 'block';
                this.elements.imagePlaceholder.style.display = 'none';

                // Display thumbnails if there are multiple images
                if (photos.length > 1) {
                    this.elements.thumbnailStrip.innerHTML = '';
                    photos.forEach((photo, index) => {
                        const thumbnail = document.createElement('div');
                        thumbnail.className = `thumbnail ${index === 0 ? 'active' : ''}`;
                        thumbnail.innerHTML = `<img src="${photo}" alt="Game image ${index + 1}">`;
                        thumbnail.addEventListener('click', () => this.switchImage(photo, thumbnail));
                        this.elements.thumbnailStrip.appendChild(thumbnail);
                    });
                } else {
                    this.elements.thumbnailStrip.style.display = 'none';
                }
            } else {
                this.showPlaceholderImage();
            }
        } else {
            this.showPlaceholderImage();
        }
    }

    showPlaceholderImage() {
        this.elements.mainImage.style.display = 'none';
        this.elements.imagePlaceholder.style.display = 'flex';
        this.elements.thumbnailStrip.style.display = 'none';
    }

    switchImage(imageSrc, thumbnail) {
        // Update main image
        this.elements.mainImage.src = imageSrc;

        // Update active thumbnail
        document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
        thumbnail.classList.add('active');
    }

    displayRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let starsHtml = '';

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                starsHtml += '<span class="star">★</span>';
            } else if (i === fullStars + 1 && hasHalfStar) {
                starsHtml += '<span class="star">★</span>';
            } else {
                starsHtml += '<span class="star empty">☆</span>';
            }
        }

        this.elements.ownerRating.querySelector('.stars').innerHTML = starsHtml;
        this.elements.ownerRating.querySelector('.rating-text').textContent = `(${rating.toFixed(1)})`;
    }

    showLoading() {
        this.elements.loadingState.style.display = 'flex';
        this.elements.errorState.style.display = 'none';
        this.elements.gameContent.style.display = 'none';
    }

    showError() {
        this.elements.loadingState.style.display = 'none';
        this.elements.errorState.style.display = 'flex';
        this.elements.gameContent.style.display = 'none';
    }

    showContent() {
        this.elements.loadingState.style.display = 'none';
        this.elements.errorState.style.display = 'none';
        this.elements.gameContent.style.display = 'grid';
    }

    bindEvents() {
        // Rent button
        this.elements.rentBtn?.addEventListener('click', () => {
            this.handleRent();
        });

        // Contact owner button
        this.elements.contactOwnerBtn?.addEventListener('click', () => {
            this.handleContactOwner();
        });

        // Sign out button
        this.elements.signOutBtn?.addEventListener('click', () => {
            BitSwapUtils.signOut();
        });

        // Calendar navigation
        this.elements.prevMonth?.addEventListener('click', () => {
            this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() - 1);
            this.renderCalendar();
        });

        this.elements.nextMonth?.addEventListener('click', () => {
            this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() + 1);
            this.renderCalendar();
        });
    }

    handleRent() {
        if (!this.gameData.active) {
            alert('This game is currently rented.');
            return;
        }

        // Get logged-in user
        const userData = localStorage.getItem('bitswap_demo_user');
        if (!userData) {
            alert('Please log in to rent games.');
            window.location.href = '/login';
            return;
        }

        const user = JSON.parse(userData);

        // Check if user is trying to rent their own game
        if (user.username === this.gameData.ownerUsername) {
            alert('You cannot rent your own game.');
            return;
        }

        // Navigate to booking/rental flow (to be implemented)
        alert(`Rent functionality coming soon!\n\nYou will be able to rent "${this.gameData.title}" for $${this.gameData.pricePerDay.toFixed(2)}/day.`);
    }

    handleContactOwner() {
        // Get logged-in user
        const userData = localStorage.getItem('bitswap_demo_user');
        if (!userData) {
            alert('Please log in to contact owners.');
            window.location.href = '/login';
            return;
        }

        const ownerUsername = this.gameData.ownerUsername || 'Unknown';
        alert(`Contact owner functionality coming soon!\n\nYou will be able to message ${ownerUsername} about "${this.gameData.title}".`);
    }

    renderCalendar() {
        if (!this.elements.calendarDays || !this.gameData) return;

        const year = this.currentCalendarDate.getFullYear();
        const month = this.currentCalendarDate.getMonth();

        // Update calendar title
        this.elements.calendarTitle.textContent = this.currentCalendarDate.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Parse availability dates
        const startDate = this.gameData.startDate ? new Date(this.gameData.startDate) : null;
        const endDate = this.gameData.endDate ? new Date(this.gameData.endDate) : null;

        // Clear existing days
        this.elements.calendarDays.innerHTML = '';

        // Add empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            this.elements.calendarDays.appendChild(emptyDay);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;

            const currentDate = new Date(year, month, day);
            currentDate.setHours(0, 0, 0, 0);

            // Check if it's today
            if (currentDate.getTime() === today.getTime()) {
                dayElement.classList.add('today');
            }

            // Check availability
            if (startDate && endDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                const end = new Date(endDate);
                end.setHours(0, 0, 0, 0);

                if (currentDate >= start && currentDate <= end) {
                    // Within the availability range
                    if (this.gameData.active) {
                        dayElement.classList.add('available');
                        dayElement.title = 'Available for rent';
                    } else {
                        dayElement.classList.add('rented');
                        dayElement.title = 'Currently rented';
                    }
                } else {
                    // Outside availability range
                    dayElement.classList.add('unavailable');
                    dayElement.title = 'Not available';
                }
            } else {
                // No dates set, mark as unavailable
                dayElement.classList.add('unavailable');
            }

            this.elements.calendarDays.appendChild(dayElement);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new GameDetails();
});
