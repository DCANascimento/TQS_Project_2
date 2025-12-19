/**
 * Rental History Page Manager
 * Displays rental booking history for the logged-in renter
 */

class PurchaseHistoryManager {
    constructor() {
        this.bookings = [];
        this.filteredBookings = [];
        this.currentFilter = 'all';
        this.currentSort = 'date-desc';
        this.currentUser = null;
        this.elements = this.initializeElements();
        this.init();
    }

    initializeElements() {
        return {
            bookingsGrid: document.getElementById('bookingsGrid'),
            emptyState: document.getElementById('emptyState'),
            loadingState: document.getElementById('loadingState'),
            searchInput: document.getElementById('searchBookings'),
            statusFilter: document.getElementById('statusFilter'),
            sortFilter: document.getElementById('sortFilter'),
            totalBookings: document.getElementById('totalBookings'),
            activeBookings: document.getElementById('activeBookings'),
            completedBookings: document.getElementById('completedBookings'),
            totalSpent: document.getElementById('totalSpent'),
            signOutBtn: document.getElementById('sign-out-btn')
        };
    }

    async init() {
        BitSwapUtils.init();
        this.getCurrentUser();
        await this.loadBookings();
        this.bindEvents();
    }

    getCurrentUser() {
        const userData = localStorage.getItem('bitswap_demo_user');
        if (!userData) {
            window.location.href = '/login';
            return;
        }
        this.currentUser = JSON.parse(userData);
    }

    async loadBookings() {
        try {
            this.showLoading();

            const response = await fetch(`/bookings/user/${this.currentUser.userId}`);
            if (!response.ok) {
                throw new Error('Failed to load bookings');
            }

            this.bookings = await response.json();
            console.log('Loaded bookings:', this.bookings);

            this.filterAndSortBookings();
            this.updateStats();
            this.renderBookings();

        } catch (error) {
            console.error('Error loading bookings:', error);
            this.showError('Failed to load rental history');
        }
    }

    filterAndSortBookings() {
        const searchTerm = this.elements.searchInput?.value?.toLowerCase() || '';
        const status = this.currentFilter;

        // Filter by search and status
        this.filteredBookings = this.bookings.filter(booking => {
            // Handle null/undefined status by defaulting to 'PENDING'
            const bookingStatus = booking.status || 'PENDING';

            const matchesSearch = !searchTerm ||
                booking.game.title.toLowerCase().includes(searchTerm);

            const matchesStatus = status === 'all' || bookingStatus === status.toUpperCase();

            return matchesSearch && matchesStatus;
        });

        // Sort bookings
        this.sortBookings();
    }

    sortBookings() {
        const sortType = this.currentSort;

        this.filteredBookings.sort((a, b) => {
            switch (sortType) {
                case 'date-desc':
                    return new Date(b.startDate) - new Date(a.startDate);
                case 'date-asc':
                    return new Date(a.startDate) - new Date(b.startDate);
                case 'price-desc':
                    return b.totalPrice - a.totalPrice;
                case 'price-asc':
                    return a.totalPrice - b.totalPrice;
                default:
                    return 0;
            }
        });
    }

    updateStats() {
        const total = this.bookings.length;
        const active = this.bookings.filter(b => {
            const status = (b.status || 'PENDING').toUpperCase();
            return status === 'APPROVED' || status === 'PENDING';
        }).length;
        const completed = this.bookings.filter(b => {
            const status = (b.status || 'PENDING').toUpperCase();
            return status === 'DECLINED';
        }).length;
        const totalSpent = this.bookings
            .filter(b => (b.status || 'PENDING').toUpperCase() === 'APPROVED')
            .reduce((sum, b) => sum + b.totalPrice, 0);

        this.elements.totalBookings.textContent = total;
        this.elements.activeBookings.textContent = active;
        this.elements.completedBookings.textContent = completed;
        this.elements.totalSpent.textContent = `$${totalSpent.toFixed(2)}`;
    }

    renderBookings() {
        this.hideLoading();

        if (this.filteredBookings.length === 0) {
            this.elements.bookingsGrid.style.display = 'none';
            this.elements.emptyState.style.display = 'block';
            return;
        }

        this.elements.bookingsGrid.style.display = 'grid';
        this.elements.emptyState.style.display = 'none';
        this.elements.bookingsGrid.innerHTML = '';

        this.filteredBookings.forEach(booking => {
            const card = this.createBookingCard(booking);
            this.elements.bookingsGrid.appendChild(card);
        });
    }

    createBookingCard(booking) {
        const card = document.createElement('div');
        card.className = 'booking-card';
        card.dataset.bookingId = booking.bookingId;

        const startDate = new Date(booking.startDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        const endDate = new Date(booking.endDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        const bookingDate = new Date(booking.startDate).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });

        // Get first photo if available
        const gamePhoto = booking.game.photos && booking.game.photos.trim() !== ''
            ? booking.game.photos.split(',')[0].trim()
            : '/images/placeholder.png';

        // Get first letter of owner username for avatar
        const ownerLetter = booking.game.ownerUsername ? booking.game.ownerUsername.charAt(0).toUpperCase() : 'O';
        const ownerName = booking.game.ownerUsername || 'Unknown Owner';

        // Calculate rental duration
        const start = new Date(booking.startDate);
        const end = new Date(booking.endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        const status = booking.status || 'PENDING';

        card.innerHTML = `
            <div class="card-header">
                <img src="${gamePhoto}" alt="${booking.game.title}" class="game-thumbnail" 
                     onerror="this.src='/images/placeholder.png'">
                <div class="card-info">
                    <h3 class="game-title">${booking.game.title}</h3>
                    <span class="booking-status ${status.toLowerCase()}">${this.getStatusText(status)}</span>
                </div>
            </div>

            <div class="owner-info">
                <div class="owner-avatar">${ownerLetter}</div>
                <div class="owner-details">
                    <div class="owner-label">Rented From</div>
                    <div class="owner-name">${ownerName}</div>
                </div>
            </div>

            <div class="card-details">
                <div class="detail-row">
                    <span class="detail-label">Rental Period:</span>
                    <div class="rental-dates">
                        <span>${startDate}</span>
                        <span class="date-arrow">→</span>
                        <span>${endDate}</span>
                    </div>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Duration:</span>
                    <span class="detail-value">${days} day${days !== 1 ? 's' : ''}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Daily Rate:</span>
                    <span class="detail-value">$${booking.game.pricePerDay.toFixed(2)}/day</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total Price:</span>
                    <span class="detail-value highlight">$${booking.totalPrice.toFixed(2)}</span>
                </div>
            </div>
        `;

        return card;
    }

    getStatusText(status) {
        const statusMap = {
            'PENDING': 'Pending Approval',
            'APPROVED': 'Approved',
            'DECLINED': 'Declined'
        };
        return statusMap[status.toUpperCase()] || status;
    }

    bindEvents() {
        // Search
        this.elements.searchInput?.addEventListener('input', () => {
            this.filterAndSortBookings();
            this.renderBookings();
        });

        // Status filter
        this.elements.statusFilter?.addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.filterAndSortBookings();
            this.renderBookings();
        });

        // Sort filter
        this.elements.sortFilter?.addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.filterAndSortBookings();
            this.renderBookings();
        });

        // Sign out
        this.elements.signOutBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('bitswap_demo_user');
            window.location.href = '/login';
        });
    }

    showLoading() {
        this.elements.loadingState.style.display = 'flex';
        this.elements.bookingsGrid.style.display = 'none';
        this.elements.emptyState.style.display = 'none';
    }

    hideLoading() {
        this.elements.loadingState.style.display = 'none';
    }

    showError(message) {
        this.hideLoading();
        this.elements.emptyState.style.display = 'block';
        this.elements.emptyState.querySelector('.empty-title').textContent = 'Error';
        this.elements.emptyState.querySelector('.empty-description').textContent = message;
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        const container = document.getElementById('toastContainer');
        if (container) {
            container.appendChild(toast);

            setTimeout(() => {
                toast.classList.add('show');
            }, 10);

            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PurchaseHistoryManager();
});
