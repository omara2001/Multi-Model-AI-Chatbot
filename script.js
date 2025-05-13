// API URL - Change this to your deployed backend URL
const API_URL = 'https://multi-model-ai-chatbot-production.up.railway.app';

// DOM Elements - Main UI
const modelSelect = document.getElementById('model-select');
const chatMessages = document.getElementById('chat-messages');
const welcomeMessage = document.getElementById('welcome-message');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const themeToggle = document.getElementById('theme-toggle');

// DOM Elements - Chat History
const chatSidebar = document.getElementById('chat-sidebar');
const chatList = document.getElementById('chat-list');
const toggleSidebarBtn = document.getElementById('toggle-sidebar');
const newChatBtn = document.getElementById('new-chat');
const closeSidebarBtn = document.getElementById('close-sidebar');
const resetChatBtn = document.getElementById('reset-chat');
const saveChatBtn = document.getElementById('save-chat');

// DOM Elements - Settings
const settingsPanel = document.getElementById('settings-panel');
const openSettingsBtn = document.getElementById('open-settings');
const closeSettingsBtn = document.getElementById('close-settings');
const themeSelect = document.getElementById('theme-select');
const voiceSelect = document.getElementById('voice-select');
const voiceRateInput = document.getElementById('voice-rate');
const voicePitchInput = document.getElementById('voice-pitch');
const voiceRateDisplay = document.getElementById('voice-rate-value');
const voicePitchDisplay = document.getElementById('voice-pitch-value');
const autoReadResponsesCheckbox = document.getElementById('auto-read-responses');
const exportDataBtn = document.getElementById('export-data');
const importDataBtn = document.getElementById('import-data');
const clearAllDataBtn = document.getElementById('clear-all-data');

// DOM Elements - Voice Input
const voiceToggleBtn = document.getElementById('voice-toggle');
const voiceInputBtn = document.getElementById('voice-input');
const voiceIndicator = document.getElementById('voice-indicator');
const voiceText = document.getElementById('voice-text');
const stopVoiceBtn = document.getElementById('stop-voice');

// DOM Elements - Modal
const saveChatModal = document.getElementById('save-chat-modal');
const chatNameInput = document.getElementById('chat-name');
const confirmSaveChatBtn = document.getElementById('confirm-save-chat');
const closeModalBtns = document.querySelectorAll('.close-modal');

// State
let messages = [];
let isLoading = false;
let selectedModel = '';
let currentTheme = localStorage.getItem('theme') || 'dark';
let currentChatId = null;
let chats = JSON.parse(localStorage.getItem('chats') || '{}');
let recognition = null;
let isListening = false;
let speechSynthesis = window.speechSynthesis;
let voices = [];
let selectedVoice = localStorage.getItem('selectedVoice') || '';
let voiceRateValue = parseFloat(localStorage.getItem('voiceRate') || '1');
let voicePitchValue = parseFloat(localStorage.getItem('voicePitch') || '1');
let autoReadResponsesEnabled = localStorage.getItem('autoReadResponses') !== 'false';

// Initialize the application
async function init() {
    try {
        // Apply saved theme
        applyTheme(currentTheme);

        // Initialize theme select
        themeSelect.value = currentTheme;

        // Initialize voice features
        initVoiceFeatures();

        // Load chat history
        loadChatHistory();

        // Fetch available models
        const models = await fetchModels();
        populateModelSelect(models);

        // Set up event listeners
        setupEventListeners();

        // Add animation classes after a delay to allow page to load
        setTimeout(() => {
            document.querySelectorAll('.model-card, .feature-item').forEach((item, index) => {
                item.style.animationDelay = `${index * 0.1}s`;
                item.classList.add('animate-in');
            });
        }, 300);
    } catch (error) {
        showError('Failed to initialize the application. Please try again later.');
        console.error('Initialization error:', error);
    }
}

// Set up all event listeners
function setupEventListeners() {
    // Main UI
    chatForm.addEventListener('submit', handleSubmit);
    themeToggle.addEventListener('click', toggleTheme);
    userInput.addEventListener('keydown', handleKeyDown);

    // Chat History
    toggleSidebarBtn.addEventListener('click', toggleSidebar);
    closeSidebarBtn.addEventListener('click', closeSidebar);
    newChatBtn.addEventListener('click', startNewChat);
    resetChatBtn.addEventListener('click', resetChat);
    saveChatBtn.addEventListener('click', openSaveChatModal);

    // Settings
    openSettingsBtn.addEventListener('click', openSettings);
    closeSettingsBtn.addEventListener('click', closeSettings);
    themeSelect.addEventListener('change', handleThemeChange);
    voiceSelect.addEventListener('change', handleVoiceChange);
    voiceRateInput.addEventListener('input', handleVoiceRateChange);
    voicePitchInput.addEventListener('input', handleVoicePitchChange);
    autoReadResponsesCheckbox.addEventListener('change', handleAutoReadChange);
    exportDataBtn.addEventListener('click', exportData);
    importDataBtn.addEventListener('click', importData);
    clearAllDataBtn.addEventListener('click', confirmClearAllData);

    // Voice Input
    voiceToggleBtn.addEventListener('click', toggleVoiceInput);
    voiceInputBtn.addEventListener('click', startVoiceInput);
    stopVoiceBtn.addEventListener('click', stopVoiceInput);

    // Modal
    confirmSaveChatBtn.addEventListener('click', saveCurrentChat);
    closeModalBtns.forEach(btn => btn.addEventListener('click', closeModal));

    // Keyboard shortcuts
    document.addEventListener('keydown', handleGlobalKeyDown);
}

// Apply theme to the document
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);

    // Update theme toggle icon
    if (theme === 'dark') {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        themeToggle.title = 'Switch to light mode';
    } else {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        themeToggle.title = 'Switch to dark mode';
    }
}

// Toggle between light and dark themes
function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', currentTheme);
    applyTheme(currentTheme);

    // Show theme change notification
    const message = currentTheme === 'dark' ? 'Dark mode activated' : 'Light mode activated';
    const toastElement = document.createElement('div');
    toastElement.className = 'success-toast';
    toastElement.textContent = message;
    document.body.appendChild(toastElement);

    // Remove after animation completes
    setTimeout(() => {
        toastElement.remove();
    }, 5000);
}

// Fetch available models from the API
async function fetchModels() {
    try {
        const response = await fetch(`${API_URL}/models`);
        if (!response.ok) {
            throw new Error('Failed to fetch models');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching models:', error);
        throw error;
    }
}

// Populate the model select dropdown
function populateModelSelect(models) {
    // Group models by category
    const groupedModels = models.reduce((acc, model) => {
        if (!acc[model.category]) {
            acc[model.category] = [];
        }
        acc[model.category].push(model);
        return acc;
    }, {});

    // Clear existing options
    modelSelect.innerHTML = '';

    // Add options for each category
    Object.entries(groupedModels).forEach(([category, categoryModels]) => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = category.charAt(0).toUpperCase() + category.slice(1);

        categoryModels.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = model.name;
            optgroup.appendChild(option);
        });

        modelSelect.appendChild(optgroup);
    });

    // Set default selected model
    if (models.length > 0) {
        selectedModel = models[0].id;
        modelSelect.value = selectedModel;
    }

    // Add change event listener
    modelSelect.addEventListener('change', (e) => {
        selectedModel = e.target.value;
    });
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();

    const userMessage = userInput.value.trim();
    if (!userMessage || isLoading) return;

    // Add user message to the chat
    addMessage('user', userMessage);
    userInput.value = '';

    // Hide welcome message
    welcomeMessage.style.display = 'none';

    // Set loading state
    isLoading = true;
    updateSendButtonState();

    // Show typing indicator
    addTypingIndicator();

    try {
        // Send message to API
        const response = await sendMessage(userMessage);

        // Remove typing indicator
        removeTypingIndicator();

        // Add AI response to the chat
        const assistantMessage = response.choices[0].message.content;
        addMessage('assistant', assistantMessage);
    } catch (error) {
        // Remove typing indicator
        removeTypingIndicator();

        // Handle specific error cases
        if (error.status === 402) {
            const errorMessage = "This model requires credits. Please try one of the free open-source models.";
            showError(errorMessage);

            // Add system error message to chat
            const systemErrorMessage = `⚠️ ${errorMessage}

The smaller open-source models like Llama 3 8B, Mistral 7B, Mixtral 8x7B, DeepSeek V3, UI-TARS 72B, Qwen3 4B, and Phi-3 Mini should work with the free API key. The Llama 3 70B model may require additional credits.`;
            addMessage('assistant', systemErrorMessage);
        } else {
            showError('Failed to get response from AI');
            console.error('Error:', error);
        }
    } finally {
        // Reset loading state
        isLoading = false;
        updateSendButtonState();
    }
}

// Send message to the API
async function sendMessage(userMessage) {
    try {
        const response = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: selectedModel,
                messages: [...messages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                }))],
                temperature: 0.7,
                max_tokens: 1000
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.detail || 'Failed to get response from AI');
            error.status = response.status;
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}

// Add a message to the chat
function addMessage(role, content, saveToHistory = true) {
    // Add to messages array if saveToHistory is true
    if (saveToHistory) {
        messages.push({ role, content });

        // Auto-save to current chat if it exists
        if (currentChatId) {
            saveChat(currentChatId);
        }
    }

    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `message ${role}`;

    // Create message content
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';

    // Create message header
    const messageHeader = document.createElement('div');
    messageHeader.className = 'message-header';

    // Add icon based on role
    const icon = document.createElement('i');
    icon.className = role === 'user' ? 'fas fa-user' : 'fas fa-robot';
    messageHeader.appendChild(icon);

    // Add sender name
    const sender = document.createElement('span');
    sender.textContent = role === 'user' ? 'You' : 'AI Assistant';
    sender.className = 'font-semibold';
    messageHeader.appendChild(sender);

    messageContent.appendChild(messageHeader);

    // Create message body with markdown support
    const messageBody = document.createElement('div');
    messageBody.className = 'message-body';

    // Parse markdown and render HTML
    messageBody.innerHTML = marked.parse(content);

    // Apply syntax highlighting to code blocks
    messageBody.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
    });

    messageContent.appendChild(messageBody);
    messageElement.appendChild(messageContent);

    // Add to DOM
    chatMessages.appendChild(messageElement);

    // Scroll to bottom
    scrollToBottom();

    // If this is an assistant message and auto-read is enabled, speak it
    if (role === 'assistant' && autoReadResponsesEnabled) {
        speakAssistantMessage(content);
    }
}

// Add typing indicator
function addTypingIndicator() {
    const typingElement = document.createElement('div');
    typingElement.className = 'message assistant';
    typingElement.id = 'typing-indicator';

    const typingContent = document.createElement('div');
    typingContent.className = 'message-content';

    const messageHeader = document.createElement('div');
    messageHeader.className = 'message-header';

    const icon = document.createElement('i');
    icon.className = 'fas fa-robot';
    messageHeader.appendChild(icon);

    const sender = document.createElement('span');
    sender.textContent = 'AI Assistant';
    sender.className = 'font-semibold';
    messageHeader.appendChild(sender);

    typingContent.appendChild(messageHeader);

    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';

    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        typingIndicator.appendChild(dot);
    }

    typingContent.appendChild(typingIndicator);
    typingElement.appendChild(typingContent);

    chatMessages.appendChild(typingElement);
    scrollToBottom();
}

// Remove typing indicator
function removeTypingIndicator() {
    const typingElement = document.getElementById('typing-indicator');
    if (typingElement) {
        typingElement.remove();
    }
}

// Update send button state based on loading state
function updateSendButtonState() {
    sendButton.disabled = isLoading;
    sendButton.innerHTML = isLoading ?
        '<i class="fas fa-spinner fa-spin"></i>' :
        '<i class="fas fa-paper-plane"></i>';
}

// Show error message
function showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-toast';
    errorElement.textContent = message;

    document.body.appendChild(errorElement);

    // Remove after 5 seconds
    setTimeout(() => {
        errorElement.remove();
    }, 5000);
}

// Scroll to the bottom of the chat
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);
