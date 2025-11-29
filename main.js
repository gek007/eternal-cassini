// ===========================
// CONSTANTS & CONFIG
// ===========================
const API_BASE_URL = 'http://localhost:3000/api';
const STORAGE_KEY = 'rss_feeds';

// ===========================
// STATE MANAGEMENT
// ===========================
let feeds = [];
let allArticles = [];

// ===========================
// DOM ELEMENTS
// ===========================
const elements = {
    subscriptionForm: document.getElementById('subscriptionForm'),
    feedUrlInput: document.getElementById('feedUrlInput'),
    addFeedBtn: document.getElementById('addFeedBtn'),
    addBtnText: document.getElementById('addBtnText'),
    addBtnSpinner: document.getElementById('addBtnSpinner'),
    refreshBtn: document.getElementById('refreshBtn'),
    refreshBtnText: document.getElementById('refreshBtnText'),
    refreshBtnSpinner: document.getElementById('refreshBtnSpinner'),
    feedList: document.getElementById('feedList'),
    articlesGrid: document.getElementById('articlesGrid'),
    emptyState: document.getElementById('emptyState'),
    articleCount: document.getElementById('articleCount'),
    notificationContainer: document.getElementById('notificationContainer')
};

// ===========================
// INITIALIZATION
// ===========================
async function init() {
    loadFeedsFromStorage();
    setupEventListeners();

    if (feeds.length > 0) {
        await fetchAllFeeds();
    }
}

// ===========================
// EVENT LISTENERS
// ===========================
function setupEventListeners() {
    elements.subscriptionForm.addEventListener('submit', handleAddFeed);
    elements.refreshBtn.addEventListener('click', handleRefreshAll);
}

// ===========================
// FEED MANAGEMENT
// ===========================
async function handleAddFeed(e) {
    e.preventDefault();

    const url = elements.feedUrlInput.value.trim();

    if (!url) {
        showNotification('Please enter a feed URL', 'error');
        return;
    }

    // Check if feed already exists
    if (feeds.some(feed => feed.url === url)) {
        showNotification('This feed is already added', 'error');
        return;
    }

    // Show loading state
    setButtonLoading(elements.addFeedBtn, elements.addBtnText, elements.addBtnSpinner, true);

    try {
        const feedData = await fetchFeed(url);

        // Add feed to state
        const newFeed = {
            url,
            title: feedData.title,
            description: feedData.description,
            link: feedData.link,
            itemCount: feedData.items.length
        };

        feeds.push(newFeed);
        saveFeedsToStorage();

        // Add articles to state
        const articlesWithSource = feedData.items.map(item => ({
            ...item,
            source: feedData.title
        }));
        allArticles = [...allArticles, ...articlesWithSource];

        // Update UI
        renderFeedList();
        renderArticles();

        // Clear input
        elements.feedUrlInput.value = '';

        showNotification(`Successfully added "${feedData.title}"`, 'success');
    } catch (error) {
        showNotification(error.message || 'Failed to add feed', 'error');
    } finally {
        setButtonLoading(elements.addFeedBtn, elements.addBtnText, elements.addBtnSpinner, false);
    }
}

async function handleRefreshAll() {
    if (feeds.length === 0) {
        showNotification('No feeds to refresh', 'error');
        return;
    }

    setButtonLoading(elements.refreshBtn, elements.refreshBtnText, elements.refreshBtnSpinner, true);

    try {
        await fetchAllFeeds();
        showNotification('All feeds refreshed successfully', 'success');
    } catch (error) {
        showNotification('Failed to refresh some feeds', 'error');
    } finally {
        setButtonLoading(elements.refreshBtn, elements.refreshBtnText, elements.refreshBtnSpinner, false);
    }
}

async function fetchAllFeeds() {
    allArticles = [];

    const promises = feeds.map(async (feed) => {
        try {
            const feedData = await fetchFeed(feed.url);

            // Update feed item count
            feed.itemCount = feedData.items.length;

            // Add articles with source
            const articlesWithSource = feedData.items.map(item => ({
                ...item,
                source: feedData.title
            }));

            allArticles = [...allArticles, ...articlesWithSource];
        } catch (error) {
            console.error(`Failed to fetch feed: ${feed.title}`, error);
        }
    });

    await Promise.all(promises);

    saveFeedsToStorage();
    renderFeedList();
    renderArticles();
}

async function fetchFeed(url) {
    const response = await fetch(`${API_BASE_URL}/fetch-feed`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch feed');
    }

    return await response.json();
}

function removeFeed(url) {
    feeds = feeds.filter(feed => feed.url !== url);
    allArticles = allArticles.filter(article => {
        const sourceFeed = feeds.find(f => f.title === article.source);
        return sourceFeed !== undefined;
    });

    saveFeedsToStorage();
    renderFeedList();
    renderArticles();

    showNotification('Feed removed', 'success');
}

// ===========================
// STORAGE
// ===========================
function saveFeedsToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(feeds));
}

function loadFeedsFromStorage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            feeds = JSON.parse(stored);
        } catch (error) {
            console.error('Failed to parse stored feeds', error);
            feeds = [];
        }
    }
}

// ===========================
// RENDERING
// ===========================
function renderFeedList() {
    if (feeds.length === 0) {
        elements.feedList.innerHTML = '<p style="color: var(--color-text-secondary); font-size: var(--font-size-sm);">No feeds added yet</p>';
        return;
    }

    elements.feedList.innerHTML = feeds.map(feed => `
    <div class="feed-item">
      <span class="feed-name">${escapeHtml(feed.title)}</span>
      <span class="feed-count">(${feed.itemCount || 0})</span>
      <button 
        class="btn btn-danger btn-small" 
        onclick="removeFeed('${escapeHtml(feed.url)}')"
        title="Remove feed"
      >
        ✕
      </button>
    </div>
  `).join('');
}

function renderArticles() {
    if (allArticles.length === 0) {
        elements.emptyState.classList.remove('hidden');
        elements.articlesGrid.classList.add('hidden');
        elements.articleCount.textContent = '0 articles';
        return;
    }

    // Sort articles by date (most recent first)
    const sortedArticles = [...allArticles].sort((a, b) => {
        return new Date(b.pubDate) - new Date(a.pubDate);
    });

    elements.emptyState.classList.add('hidden');
    elements.articlesGrid.classList.remove('hidden');
    elements.articleCount.textContent = `${sortedArticles.length} article${sortedArticles.length !== 1 ? 's' : ''}`;

    elements.articlesGrid.innerHTML = sortedArticles.map(article => `
    <article class="article-card">
      ${article.image ? `
        <img 
          src="${escapeHtml(article.image)}" 
          alt="${escapeHtml(article.title)}"
          class="article-image"
          onerror="this.style.display='none'"
        >
      ` : ''}
      
      <div class="article-content">
        <span class="article-source">${escapeHtml(article.source)}</span>
        
        <h3 class="article-title">
          <a href="${escapeHtml(article.link)}" target="_blank" rel="noopener noreferrer">
            ${escapeHtml(article.title)}
          </a>
        </h3>
        
        ${article.description ? `
          <p class="article-description">${escapeHtml(article.description)}</p>
        ` : ''}
        
        <div class="article-meta">
          <span class="article-date">${formatDate(article.pubDate)}</span>
          ${article.author ? `
            <span class="article-author">${escapeHtml(article.author)}</span>
          ` : ''}
        </div>
      </div>
    </article>
  `).join('');
}

// ===========================
// UI HELPERS
// ===========================
function setButtonLoading(button, textElement, spinnerElement, isLoading) {
    if (isLoading) {
        button.disabled = true;
        textElement.classList.add('hidden');
        spinnerElement.classList.remove('hidden');
    } else {
        button.disabled = false;
        textElement.classList.remove('hidden');
        spinnerElement.classList.add('hidden');
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    elements.notificationContainer.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// ===========================
// UTILITY FUNCTIONS
// ===========================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Make removeFeed available globally for onclick handlers
window.removeFeed = removeFeed;

// ===========================
// START APP
// ===========================
init();
