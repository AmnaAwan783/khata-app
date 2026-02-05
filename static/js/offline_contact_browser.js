/**
 * Offline Contact Browser
 * Browses customers from the app's own database (IndexedDB)
 * Works completely offline - no device Contact Picker API needed
 */

/**
 * Open offline contact browser modal
 * Shows all customers from IndexedDB in a searchable list
 * @param {string} nameFieldId - ID of the name input field
 * @param {string} phoneFieldId - ID of the phone input field
 */
async function openOfflineContactBrowser(nameFieldId, phoneFieldId) {
    console.log('Opening offline contact browser...');
    
    // Get customers from IndexedDB (works offline)
    let customers = [];
    
    try {
        // Try multiple methods to get customers
        if (window.StoreApp && window.StoreApp.getCustomersFromDB) {
            console.log('Using StoreApp.getCustomersFromDB');
            customers = await window.StoreApp.getCustomersFromDB();
        } else if (typeof getCustomersFromDB === 'function') {
            console.log('Using global getCustomersFromDB');
            customers = await getCustomersFromDB();
        } else {
            console.log('Using direct IndexedDB access');
            customers = await getCustomersFromIndexedDB();
        }
        
        console.log('Loaded customers:', customers.length);
    } catch (error) {
        console.error('Error loading customers from IndexedDB:', error);
        alert('Error loading customers from database.\n\nError: ' + (error.message || error) + '\n\nPlease enter manually or refresh the page.');
        return;
    }
    
    if (!customers || customers.length === 0) {
        alert('No customers found in database.\n\nPlease add customers first, then you can browse them here.');
        return;
    }
    
    // Create and show modal
    showContactBrowserModal(customers, nameFieldId, phoneFieldId);
}

/**
 * Get customers from IndexedDB directly
 * Works offline - uses app's customer database
 */
async function getCustomersFromIndexedDB() {
    return new Promise(async (resolve, reject) => {
        try {
            // Try to use StoreApp functions first
            if (window.StoreApp && window.StoreApp.getCustomersFromDB) {
                const customers = await window.StoreApp.getCustomersFromDB();
                resolve(customers || []);
                return;
            }
            
            // Try to use global getCustomersFromDB function
            if (typeof getCustomersFromDB === 'function') {
                const customers = await getCustomersFromDB();
                resolve(customers || []);
                return;
            }
            
            // Try to access IndexedDB directly
            if (typeof db !== 'undefined' && db) {
                const tx = db.transaction('customers', 'readonly');
                const store = tx.objectStore('customers');
                const request = store.getAll();
                
                request.onsuccess = () => resolve(request.result || []);
                request.onerror = () => reject(request.error);
                return;
            }
            
            // Initialize DB if needed
            if (typeof initDB === 'function') {
                await initDB();
                const tx = db.transaction('customers', 'readonly');
                const store = tx.objectStore('customers');
                const request = store.getAll();
                
                request.onsuccess = () => resolve(request.result || []);
                request.onerror = () => reject(request.error);
                return;
            }
            
            // Last resort: try to open IndexedDB directly
            const DB_NAME = 'StoreBillingDB';
            const request = indexedDB.open(DB_NAME, 1);
            
            request.onsuccess = (event) => {
                const db = event.target.result;
                if (db.objectStoreNames.contains('customers')) {
                    const tx = db.transaction('customers', 'readonly');
                    const store = tx.objectStore('customers');
                    const getAllRequest = store.getAll();
                    
                    getAllRequest.onsuccess = () => resolve(getAllRequest.result || []);
                    getAllRequest.onerror = () => reject(getAllRequest.error);
                } else {
                    resolve([]);
                }
            };
            
            request.onerror = () => reject(request.error);
            
        } catch (error) {
            console.error('Error getting customers from IndexedDB:', error);
            reject(error);
        }
    });
}

/**
 * Show contact browser modal with customer list
 */
function showContactBrowserModal(customers, nameFieldId, phoneFieldId) {
    // Remove existing modal if any
    const existingModal = document.getElementById('offlineContactBrowserModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal HTML
    const modalHTML = `
        <div class="modal fade" id="offlineContactBrowserModal" tabindex="-1" aria-labelledby="contactBrowserModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="contactBrowserModalLabel">📱 Browse Customers</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <input 
                                type="text" 
                                class="form-control" 
                                id="contactSearchInput" 
                                placeholder="Search by name or phone..."
                                autocomplete="off">
                        </div>
                        <div id="contactList" class="contact-list-container">
                            ${renderContactList(customers)}
                        </div>
                        <div id="noContactsFound" class="text-center text-muted" style="display: none;">
                            No customers found. Try a different search.
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Initialize Bootstrap modal
    const modalElement = document.getElementById('offlineContactBrowserModal');
    const modal = new bootstrap.Modal(modalElement);
    
    // Setup search functionality
    const searchInput = document.getElementById('contactSearchInput');
    const contactList = document.getElementById('contactList');
    const noContactsFound = document.getElementById('noContactsFound');
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const filtered = customers.filter(c => 
            (c.name && c.name.toLowerCase().includes(query)) ||
            (c.phone && c.phone.includes(query))
        );
        
        if (filtered.length === 0) {
            contactList.style.display = 'none';
            noContactsFound.style.display = 'block';
        } else {
            contactList.style.display = 'block';
            noContactsFound.style.display = 'none';
            contactList.innerHTML = renderContactList(filtered);
            attachContactClickHandlers(contactList, nameFieldId, phoneFieldId, modal);
        }
    });
    
    // Attach click handlers to initial list
    attachContactClickHandlers(contactList, nameFieldId, phoneFieldId, modal);
    
    // Show modal
    modal.show();
    
    // Focus search input
    setTimeout(() => {
        searchInput.focus();
    }, 300);
}

/**
 * Render contact list HTML
 */
function renderContactList(customers) {
    if (customers.length === 0) {
        return '<div class="text-center text-muted">No customers found</div>';
    }
    
    return customers.map(customer => `
        <div class="contact-item" data-customer-id="${customer.id}">
            <div class="contact-item-name">
                ${escapeHtml(customer.name || 'No name')}
            </div>
            <div class="contact-item-phone">
                📞 ${escapeHtml(customer.phone || 'No phone')}
            </div>
        </div>
    `).join('');
}

/**
 * Attach click handlers to contact items
 */
function attachContactClickHandlers(container, nameFieldId, phoneFieldId, modal) {
    const contactItems = container.querySelectorAll('.contact-item');
    
    contactItems.forEach(item => {
        item.addEventListener('click', () => {
            const customerId = item.getAttribute('data-customer-id');
            const customerName = item.querySelector('div').textContent.trim();
            const phoneText = item.querySelectorAll('div')[1].textContent;
            const phoneNumber = phoneText.replace('📞', '').trim();
            
            // Fill form fields
            const nameField = document.getElementById(nameFieldId);
            const phoneField = document.getElementById(phoneFieldId);
            
            if (nameField) {
                nameField.value = customerName;
                nameField.dispatchEvent(new Event('input', { bubbles: true }));
            }
            
            if (phoneField) {
                phoneField.value = phoneNumber;
                phoneField.dispatchEvent(new Event('input', { bubbles: true }));
                phoneField.focus();
            }
            
            // Close modal
            modal.hide();
            
            // Show feedback
            if (window.StoreApp && window.StoreApp.showNotification) {
                window.StoreApp.showNotification('Customer selected!', 'success');
            }
        });
    });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Export function for global use
window.openOfflineContactBrowser = openOfflineContactBrowser;

