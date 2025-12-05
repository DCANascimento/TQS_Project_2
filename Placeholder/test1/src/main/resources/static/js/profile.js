/* ========================
   PROFILE PAGE JS
   ======================== */

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function () {
    // Initialize shared functionality (particles + navigation)
    BitSwapUtils.init();

    // Load user profile data
    loadUserProfile();

    // Initialize form handlers
    initFormHandlers();

    // Initialize edit functionality
    initEditHandlers();

    // Initialize navigation based on user role
    initNavigation();
});

/* ========================
   LOAD USER PROFILE
   ======================== */

async function loadUserProfile() {
    try {
        // Get logged-in user from localStorage (same as addvideogame.js)
        const storedData = localStorage.getItem('bitswap_demo_user');
        const currentUser = JSON.parse(storedData || '{}');

        if (!currentUser.userId || !currentUser.username) {
            console.warn('No user logged in, redirecting to login...');
            window.location.href = '/login';
            return;
        }

        // Fetch fresh user data from backend
        const response = await fetch(`/users/${currentUser.userId}`);

        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();

        // Populate form fields with logged-in user data
        populateProfile(userData);

    } catch (error) {
        console.error('Error loading profile:', error);
        // Use fallback data from localStorage
        const storedData = localStorage.getItem('bitswap_demo_user');
        const currentUser = JSON.parse(storedData || '{}');

        if (currentUser.userId) {
            populateProfile(currentUser);
        } else {
            window.location.href = '/login';
        }
    }
}

function populateProfile(userData) {
    // Set username fields
    const usernameInput = document.getElementById('username');
    const displayUsername = document.getElementById('display-username');
    const avatarInitial = document.getElementById('avatar-initial');

    if (usernameInput) usernameInput.value = userData.username || '';
    if (displayUsername) displayUsername.textContent = userData.username || 'User';
    if (avatarInitial) avatarInitial.textContent = (userData.username || 'U')[0].toUpperCase();

    // Set bio
    const bioTextarea = document.getElementById('bio');
    const bioCount = document.getElementById('bio-count');
    if (bioTextarea) {
        bioTextarea.value = userData.bio || '';
        if (bioCount) bioCount.textContent = (userData.bio || '').length;
    }

    // Set role
    const roleElement = document.querySelector('.role-badge');
    const accountType = document.getElementById('account-type');
    const role = userData.role || 'renter';

    if (roleElement) {
        roleElement.textContent = role.charAt(0).toUpperCase() + role.slice(1);
    }
    if (accountType) {
        accountType.textContent = role.charAt(0).toUpperCase() + role.slice(1);
    }

    // Set account details
    const userIdElement = document.getElementById('user-id');
    if (userIdElement) userIdElement.textContent = userData.userId || '—';

    const memberSince = document.getElementById('member-since');
    if (memberSince) memberSince.textContent = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short'
    });

    const lastUpdated = document.getElementById('last-updated');
    if (lastUpdated) lastUpdated.textContent = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

}

/* ========================
   NAVIGATION SETUP
   ======================== */

function initNavigation() {
    // Get logged-in user from localStorage
    const storedData = localStorage.getItem('bitswap_demo_user');
    const currentUser = JSON.parse(storedData || '{}');
    const role = currentUser.role || 'renter';

    const ownerNav = document.querySelector('.owner-nav');
    const renterNav = document.querySelector('.renter-nav');

    if (role === 'owner') {
        if (ownerNav) ownerNav.style.display = 'block';
        if (renterNav) renterNav.style.display = 'none';
    } else {
        if (ownerNav) ownerNav.style.display = 'none';
        if (renterNav) renterNav.style.display = 'block';
    }
}

/* ========================
   EDIT HANDLERS
   ======================== */

function initEditHandlers() {
    const editUsernameBtn = document.getElementById('edit-username-btn');
    const editBioBtn = document.getElementById('edit-bio-btn');
    const usernameInput = document.getElementById('username');
    const bioTextarea = document.getElementById('bio');

    // Edit username
    if (editUsernameBtn && usernameInput) {
        editUsernameBtn.addEventListener('click', function () {
            const isDisabled = usernameInput.disabled;
            usernameInput.disabled = !isDisabled;

            if (!isDisabled) {
                // Now disabled (was enabled), so we're canceling edit
                editUsernameBtn.querySelector('.edit-icon').textContent = '✏️';
                hideActionButtons();
            } else {
                // Now enabled (was disabled), so we're starting edit
                usernameInput.focus();
                editUsernameBtn.querySelector('.edit-icon').textContent = '❌';
                showActionButtons();
            }
        });
    }

    // Edit bio
    if (editBioBtn && bioTextarea) {
        editBioBtn.addEventListener('click', function () {
            const isDisabled = bioTextarea.disabled;
            bioTextarea.disabled = !isDisabled;

            if (!isDisabled) {
                // Now disabled (was enabled), so we're canceling edit
                editBioBtn.querySelector('.edit-icon').textContent = '✏️';
                hideActionButtons();
            } else {
                // Now enabled (was disabled), so we're starting edit
                bioTextarea.focus();
                editBioBtn.querySelector('.edit-icon').textContent = '❌';
                showActionButtons();
            }
        });
    }

    // Bio character counter
    if (bioTextarea) {
        bioTextarea.addEventListener('input', function () {
            const bioCount = document.getElementById('bio-count');
            if (bioCount) {
                const count = this.value.length;
                bioCount.textContent = count;

                // Color coding for character limit
                if (count > 450) {
                    bioCount.style.color = 'var(--error)';
                } else if (count > 400) {
                    bioCount.style.color = 'var(--warning)';
                } else {
                    bioCount.style.color = 'var(--text-muted)';
                }
            }
        });
    }
}

function showActionButtons() {
    const saveBtn = document.getElementById('save-btn');
    const cancelBtn = document.getElementById('cancel-btn');

    if (saveBtn) saveBtn.style.display = 'block';
    if (cancelBtn) cancelBtn.style.display = 'block';
}

function hideActionButtons() {
    const saveBtn = document.getElementById('save-btn');
    const cancelBtn = document.getElementById('cancel-btn');

    if (saveBtn) saveBtn.style.display = 'none';
    if (cancelBtn) cancelBtn.style.display = 'none';
}

/* ========================
   FORM HANDLERS
   ======================== */

function initFormHandlers() {
    const form = document.getElementById('profile-form');
    const cancelBtn = document.getElementById('cancel-btn');

    // Form submission
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    // Cancel button
    if (cancelBtn) {
        cancelBtn.addEventListener('click', handleCancel);
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
        return;
    }

    const saveBtn = document.getElementById('save-btn');
    const btnText = saveBtn.querySelector('.btn-text');
    const btnLoader = saveBtn.querySelector('.btn-loader');

    // Show loading state
    saveBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'block';

    try {
        // Get logged-in user from localStorage
        const storedData = localStorage.getItem('bitswap_demo_user');
        const currentUser = JSON.parse(storedData || '{}');

        if (!currentUser.userId) {
            alert('No user session found. Please log in again.');
            window.location.href = '/login';
            return;
        }

        const username = document.getElementById('username').value.trim();
        const bio = document.getElementById('bio').value.trim();

        // Prepare update data
        const updateData = {
            username: username,
            bio: bio
        };

        // Send to backend to update the logged-in user's profile
        const response = await fetch(`/users/${currentUser.userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (!response.ok) {
            throw new Error('Failed to update profile');
        }

        // Update localStorage with new user data
        currentUser.username = username;
        currentUser.bio = bio;
        localStorage.setItem('bitswap_demo_user', JSON.stringify(currentUser));

        // Update display
        const displayUsername = document.getElementById('display-username');
        const avatarInitial = document.getElementById('avatar-initial');

        if (displayUsername) displayUsername.textContent = username;
        if (avatarInitial) avatarInitial.textContent = username[0].toUpperCase();

        // Disable inputs and hide buttons
        document.getElementById('username').disabled = true;
        document.getElementById('bio').disabled = true;
        document.getElementById('edit-username-btn').querySelector('.edit-icon').textContent = '✏️';
        document.getElementById('edit-bio-btn').querySelector('.edit-icon').textContent = '✏️';
        hideActionButtons();

        // Show success modal
        showSuccessModal();

    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile. Please try again.');
    } finally {
        // Hide loading state
        saveBtn.disabled = false;
        btnText.style.display = 'inline-block';
        btnLoader.style.display = 'none';
    }
}

function handleCancel() {
    // Reload the page to reset all changes
    location.reload();
}

/* ========================
   VALIDATION
   ======================== */

function validateForm() {
    let isValid = true;

    const username = document.getElementById('username').value.trim();
    const usernameError = document.getElementById('username-error');

    // Clear previous errors
    if (usernameError) usernameError.classList.remove('show');

    // Validate username
    if (!username || username.length < 3) {
        if (usernameError) {
            usernameError.textContent = 'Username must be at least 3 characters long';
            usernameError.classList.add('show');
        }
        isValid = false;
    }

    // Validate bio length
    const bio = document.getElementById('bio').value.trim();
    const bioError = document.getElementById('bio-error');

    if (bioError) bioError.classList.remove('show');

    if (bio.length > 500) {
        if (bioError) {
            bioError.textContent = 'Bio must be 500 characters or less';
            bioError.classList.add('show');
        }
        isValid = false;
    }

    return isValid;
}

/* ========================
   MODAL FUNCTIONS
   ======================== */

function showSuccessModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Make closeModal available globally
window.closeModal = closeModal;
