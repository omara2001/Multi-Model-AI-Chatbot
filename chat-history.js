// Chat History Implementation

// Load chat history
function loadChatHistory() {
    // Clear chat list
    chatList.innerHTML = '';
    
    // Get chats from localStorage
    const savedChats = JSON.parse(localStorage.getItem('chats') || '{}');
    
    // If no chats, show empty state
    if (Object.keys(savedChats).length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <i class="fas fa-comment-slash"></i>
            <p>No saved chats yet</p>
        `;
        chatList.appendChild(emptyState);
        return;
    }
    
    // Sort chats by last updated time (newest first)
    const sortedChats = Object.entries(savedChats)
        .sort(([, a], [, b]) => b.lastUpdated - a.lastUpdated);
    
    // Add each chat to the list
    sortedChats.forEach(([id, chat]) => {
        addChatToList(id, chat);
    });
}

// Add a chat to the sidebar list
function addChatToList(id, chat) {
    const chatItem = document.createElement('div');
    chatItem.className = 'chat-item';
    chatItem.dataset.id = id;
    
    if (currentChatId === id) {
        chatItem.classList.add('active');
    }
    
    const chatItemContent = document.createElement('div');
    chatItemContent.className = 'chat-item-content';
    
    const chatTitle = document.createElement('div');
    chatTitle.className = 'chat-item-title';
    chatTitle.textContent = chat.title || 'Untitled Chat';
    
    const chatDate = document.createElement('div');
    chatDate.className = 'chat-item-date';
    chatDate.textContent = formatDate(chat.lastUpdated);
    
    chatItemContent.appendChild(chatTitle);
    chatItemContent.appendChild(chatDate);
    
    const chatItemActions = document.createElement('div');
    chatItemActions.className = 'chat-item-actions';
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'icon-button';
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.title = 'Delete chat';
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteChat(id);
    });
    
    chatItemActions.appendChild(deleteBtn);
    
    chatItem.appendChild(chatItemContent);
    chatItem.appendChild(chatItemActions);
    
    // Add click event to load chat
    chatItem.addEventListener('click', () => {
        loadChat(id);
    });
    
    chatList.appendChild(chatItem);
}

// Format date for display
function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    
    // If today, show time
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this year, show month and day
    if (date.getFullYear() === now.getFullYear()) {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // Otherwise show full date
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
}

// Load a chat
function loadChat(id) {
    // Save current chat if needed
    if (currentChatId && messages.length > 0) {
        saveChat(currentChatId);
    }
    
    // Set current chat ID
    currentChatId = id;
    
    // Get chat data
    const chat = chats[id];
    
    if (!chat) {
        showError('Chat not found');
        return;
    }
    
    // Clear current messages
    messages = [];
    chatMessages.innerHTML = '';
    welcomeMessage.style.display = 'none';
    
    // Update active state in sidebar
    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.toggle('active', item.dataset.id === id);
    });
    
    // Load messages
    chat.messages.forEach(msg => {
        addMessage(msg.role, msg.content, false);
    });
    
    // Close sidebar on mobile
    if (window.innerWidth < 768) {
        closeSidebar();
    }
}

// Save current chat
function saveChat(id = null) {
    if (messages.length === 0) return;
    
    const chatId = id || currentChatId || generateId();
    
    // Get existing chat or create new one
    const chat = chats[chatId] || {
        title: 'Untitled Chat',
        created: Date.now(),
        lastUpdated: Date.now(),
        messages: []
    };
    
    // Update chat data
    chat.lastUpdated = Date.now();
    chat.messages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
    }));
    
    // Save to chats object
    chats[chatId] = chat;
    
    // Save to localStorage
    localStorage.setItem('chats', JSON.stringify(chats));
    
    // Update current chat ID
    currentChatId = chatId;
    
    // Refresh chat list
    loadChatHistory();
    
    return chatId;
}

// Delete a chat
function deleteChat(id) {
    if (!confirm('Are you sure you want to delete this chat?')) {
        return;
    }
    
    // Delete from chats object
    delete chats[id];
    
    // Save to localStorage
    localStorage.setItem('chats', JSON.stringify(chats));
    
    // If current chat was deleted, start a new chat
    if (currentChatId === id) {
        startNewChat();
    }
    
    // Refresh chat list
    loadChatHistory();
}

// Start a new chat
function startNewChat() {
    // Save current chat if needed
    if (currentChatId && messages.length > 0) {
        saveChat(currentChatId);
    }
    
    // Clear current chat
    currentChatId = null;
    messages = [];
    chatMessages.innerHTML = '';
    welcomeMessage.style.display = 'flex';
    
    // Update active state in sidebar
    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Close sidebar on mobile
    if (window.innerWidth < 768) {
        closeSidebar();
    }
}

// Reset current chat
function resetChat() {
    if (!confirm('Are you sure you want to reset this chat? All messages will be cleared.')) {
        return;
    }
    
    // Clear messages
    messages = [];
    chatMessages.innerHTML = '';
    welcomeMessage.style.display = 'flex';
    
    // If this was a saved chat, update it
    if (currentChatId) {
        saveChat(currentChatId);
    }
}

// Open save chat modal
function openSaveChatModal() {
    if (messages.length === 0) {
        showError('Cannot save an empty chat');
        return;
    }
    
    // Get chat title if it exists
    if (currentChatId && chats[currentChatId]) {
        chatNameInput.value = chats[currentChatId].title;
    } else {
        chatNameInput.value = 'Chat ' + new Date().toLocaleDateString();
    }
    
    // Show modal
    saveChatModal.classList.add('active');
    chatNameInput.focus();
}

// Save current chat with name
function saveCurrentChat() {
    const chatName = chatNameInput.value.trim();
    
    if (!chatName) {
        showError('Please enter a name for this chat');
        return;
    }
    
    // Save chat
    const chatId = saveChat();
    
    // Update title
    chats[chatId].title = chatName;
    
    // Save to localStorage
    localStorage.setItem('chats', JSON.stringify(chats));
    
    // Refresh chat list
    loadChatHistory();
    
    // Close modal
    closeModal();
    
    // Show success message
    showSuccess('Chat saved successfully');
}

// Generate a unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}
