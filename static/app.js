// Main Application JavaScript for Offline-First PWA
// Handles IndexedDB, offline sync, and autocomplete

// ============================================
// IndexedDB Setup
// ============================================

const DB_NAME = 'StoreBillingDB';
const DB_VERSION = 1;
let db = null;

// Initialize IndexedDB
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      console.log('IndexedDB opened successfully');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Customers store
      if (!db.objectStoreNames.contains('customers')) {
        const customerStore = db.createObjectStore('customers', { keyPath: 'id' });
        customerStore.createIndex('name', 'name', { unique: false });
        customerStore.createIndex('phone', 'phone', { unique: false });
      }

      // Items store
      if (!db.objectStoreNames.contains('items')) {
        const itemStore = db.createObjectStore('items', { keyPath: 'id' });
        itemStore.createIndex('name', 'name', { unique: false });
      }

      // Sales store (for offline sales)
      if (!db.objectStoreNames.contains('sales')) {
        const saleStore = db.createObjectStore('sales', { keyPath: 'id', autoIncrement: true });
        saleStore.createIndex('customer_id', 'customer_id', { unique: false });
        saleStore.createIndex('date', 'date', { unique: false });
        saleStore.createIndex('synced', 'synced', { unique: false });
      }

      // Pending sync queue
      if (!db.objectStoreNames.contains('syncQueue')) {
        const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        syncStore.createIndex('type', 'type', { unique: false });
        syncStore.createIndex('synced', 'synced', { unique: false });
      }
    };
  });
}

// ============================================
// IndexedDB Operations
// ============================================

// Save customers to IndexedDB
async function saveCustomersToDB(customers) {
  if (!db) await initDB();
  const tx = db.transaction('customers', 'readwrite');
  const store = tx.objectStore('customers');
  
  for (const customer of customers) {
    await store.put(customer);
  }
  
  return tx.complete;
}

// Save single customer to IndexedDB
async function saveCustomerToDB(customer) {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('customers', 'readwrite');
    const store = tx.objectStore('customers');
    const request = store.put(customer);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Get customers from IndexedDB
async function getCustomersFromDB() {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('customers', 'readonly');
    const store = tx.objectStore('customers');
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Search customers in IndexedDB
async function searchCustomersInDB(query) {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('customers', 'readonly');
    const store = tx.objectStore('customers');
    const request = store.getAll();
    
    request.onsuccess = () => {
      const customers = request.result;
      const lowerQuery = query.toLowerCase();
      const filtered = customers.filter(c => 
        c.name.toLowerCase().includes(lowerQuery) ||
        (c.phone && c.phone.includes(query))
      );
      resolve(filtered);
    };
    
    request.onerror = () => reject(request.error);
  });
}

// Save items to IndexedDB
async function saveItemsToDB(items) {
  if (!db) await initDB();
  const tx = db.transaction('items', 'readwrite');
  const store = tx.objectStore('items');
  
  for (const item of items) {
    await store.put(item);
  }
  
  return tx.complete;
}

// Get items from IndexedDB
async function getItemsFromDB() {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('items', 'readonly');
    const store = tx.objectStore('items');
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Save offline sale to IndexedDB
async function saveOfflineSale(saleData) {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sales', 'readwrite');
    const store = tx.objectStore('sales');
    
    const sale = {
      ...saleData,
      synced: false,
      date: new Date().toISOString(),
      temp_id: 'temp_' + Date.now()
    };
    
    const request = store.add(sale);
    
    request.onsuccess = () => {
      resolve(request.result);
      // Add to sync queue
      addToSyncQueue('sale', sale);
    };
    
    request.onerror = () => reject(request.error);
  });
}

// Add item to sync queue
async function addToSyncQueue(type, data) {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('syncQueue', 'readwrite');
    const store = tx.objectStore('syncQueue');
    
    const queueItem = {
      type: type,
      data: data,
      synced: false,
      timestamp: new Date().toISOString()
    };
    
    const request = store.add(queueItem);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ============================================
// Network Status & Sync
// ============================================

// Check if online
function isOnline() {
  return navigator.onLine;
}

// Sync offline data when online
async function syncOfflineData() {
  if (!isOnline() || !db) return;
  
  try {
    const tx = db.transaction('syncQueue', 'readonly');
    const store = tx.objectStore('syncQueue');
    const request = store.index('synced').getAll(false);
    
    request.onsuccess = async () => {
      const pendingItems = request.result;
      
      for (const item of pendingItems) {
        try {
          if (item.type === 'sale') {
            await syncSale(item.data);
          }
          
          // Mark as synced
          const updateTx = db.transaction('syncQueue', 'readwrite');
          const updateStore = updateTx.objectStore('syncQueue');
          item.synced = true;
          await updateStore.put(item);
        } catch (error) {
          console.error('Error syncing item:', error);
        }
      }
      
      // Show notification
      if (pendingItems.length > 0) {
        showNotification(`${pendingItems.length} offline sales synced successfully!`);
      }
    };
  } catch (error) {
    console.error('Error syncing offline data:', error);
  }
}

// Sync a single sale
async function syncSale(saleData) {
  const formData = new FormData();
  formData.append('sale_type', saleData.sale_type || 'credit');
  formData.append('item_id', saleData.item_id);
  formData.append('quantity', saleData.quantity);
  formData.append('unit_price', saleData.unit_price);
  formData.append('paid_amount', saleData.paid_amount || 0);
  
  if (saleData.customer_id) {
    formData.append('customer_id', saleData.customer_id);
  }
  
  const response = await fetch('/add-sale', {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    throw new Error('Failed to sync sale');
  }
  
  return response;
}

// ============================================
// Customer Autocomplete
// ============================================

// Initialize customer autocomplete
function initCustomerAutocomplete(inputElement, hiddenInputElement, onSelectCallback) {
  let currentFocus = -1;
  let customers = [];
  
  // Load customers (from API or IndexedDB)
  async function loadCustomers() {
    if (isOnline()) {
      try {
        const response = await fetch('/api/customers');
        if (response.ok) {
          customers = await response.json();
          await saveCustomersToDB(customers);
        }
      } catch (error) {
        console.error('Error loading customers from API:', error);
        customers = await getCustomersFromDB();
      }
    } else {
      customers = await getCustomersFromDB();
    }
  }
  
  // Search customers
  async function searchCustomers(query) {
    if (!query || query.length < 1) {
      return [];
    }
    
    if (isOnline()) {
      try {
        const response = await fetch(`/api/customers/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.error('Error searching customers:', error);
      }
    }
    
    // Fallback to IndexedDB search
    return await searchCustomersInDB(query);
  }
  
  // Create autocomplete dropdown
  function createAutocompleteDropdown(items) {
    // Remove existing dropdown
    const existing = document.getElementById('customer-autocomplete-list');
    if (existing) existing.remove();
    
    if (items.length === 0) {
      // Show "Add New Customer" option
      const div = document.createElement('div');
      div.id = 'customer-autocomplete-list';
      div.className = 'autocomplete-items';
      div.innerHTML = `<div class="autocomplete-item" onclick="openAddCustomerModal('${inputElement.value}')">
        <strong>+ Add New Customer: "${inputElement.value}"</strong>
      </div>`;
      inputElement.parentElement.appendChild(div);
      return;
    }
    
    const div = document.createElement('div');
    div.id = 'customer-autocomplete-list';
    div.className = 'autocomplete-items';
    
    items.forEach((customer, index) => {
      const item = document.createElement('div');
      item.className = 'autocomplete-item';
      item.innerHTML = `<strong>${customer.name}</strong> - ${customer.phone || 'No phone'}`;
      item.addEventListener('click', () => {
        selectCustomer(customer);
      });
      div.appendChild(item);
    });
    
    inputElement.parentElement.appendChild(div);
  }
  
  // Select a customer
  function selectCustomer(customer) {
    inputElement.value = `${customer.name} - ${customer.phone || ''}`;
    hiddenInputElement.value = customer.id;
    
    // Remove dropdown
    const existing = document.getElementById('customer-autocomplete-list');
    if (existing) existing.remove();
    
    currentFocus = -1;
    
    if (onSelectCallback) {
      onSelectCallback(customer);
    }
  }
  
  // Handle input
  inputElement.addEventListener('input', async function(e) {
    const query = this.value;
    hiddenInputElement.value = ''; // Clear hidden input
    
    if (query.length >= 1) {
      const results = await searchCustomers(query);
      createAutocompleteDropdown(results);
    } else {
      const existing = document.getElementById('customer-autocomplete-list');
      if (existing) existing.remove();
    }
  });
  
  // Handle keyboard navigation
  inputElement.addEventListener('keydown', function(e) {
    const list = document.getElementById('customer-autocomplete-list');
    if (!list) return;
    
    const items = list.getElementsByClassName('autocomplete-item');
    
    if (e.key === 'ArrowDown') {
      currentFocus++;
      if (currentFocus >= items.length) currentFocus = 0;
      addActive(items);
    } else if (e.key === 'ArrowUp') {
      currentFocus--;
      if (currentFocus < 0) currentFocus = items.length - 1;
      addActive(items);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (currentFocus > -1 && items[currentFocus]) {
        items[currentFocus].click();
      }
    } else if (e.key === 'Escape') {
      list.remove();
    }
  });
  
  function addActive(items) {
    removeActive(items);
    if (currentFocus >= 0 && currentFocus < items.length) {
      items[currentFocus].classList.add('autocomplete-active');
    }
  }
  
  function removeActive(items) {
    for (let i = 0; i < items.length; i++) {
      items[i].classList.remove('autocomplete-active');
    }
  }
  
  // Close dropdown when clicking outside
  document.addEventListener('click', function(e) {
    if (!inputElement.contains(e.target) && 
        !document.getElementById('customer-autocomplete-list')?.contains(e.target)) {
      const existing = document.getElementById('customer-autocomplete-list');
      if (existing) existing.remove();
    }
  });
  
  // Load customers on init
  loadCustomers();
}

// ============================================
// Utility Functions
// ============================================

// Show notification
function showNotification(message, type = 'success') {
  // Create a simple notification
  const notification = document.createElement('div');
  notification.className = `alert alert-${type === 'error' ? 'danger' : 'success'} alert-dismissible fade show position-fixed`;
  notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
  notification.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 5000);
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize IndexedDB
  await initDB();
  
  // Load initial data
  if (isOnline()) {
    try {
      // Load customers
      const customersRes = await fetch('/api/customers');
      if (customersRes.ok) {
        const customers = await customersRes.json();
        await saveCustomersToDB(customers);
      }
      
      // Load items
      const itemsRes = await fetch('/api/items');
      if (itemsRes.ok) {
        const items = await itemsRes.json();
        await saveItemsToDB(items);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  }
  
  // Set up online/offline listeners
  window.addEventListener('online', () => {
    showNotification('Connection restored. Syncing offline data...', 'success');
    syncOfflineData();
  });
  
  window.addEventListener('offline', () => {
    showNotification('You are offline. Data will be synced when connection is restored.', 'warning');
  });
  
  // Try to sync on load if online
  if (isOnline()) {
    setTimeout(syncOfflineData, 1000);
  }
});

// Export functions for global use
window.StoreApp = {
  initCustomerAutocomplete,
  saveOfflineSale,
  saveCustomerToDB,
  isOnline,
  syncOfflineData,
  showNotification,
  getCustomersFromDB,
  getItemsFromDB,
  getCustomersFromDB: getCustomersFromDB  // Make sure it's exported
};

