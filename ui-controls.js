// UI Controls Implementation

// Toggle sidebar
function toggleSidebar() {
    document.body.classList.toggle('sidebar-open');
}

// Close sidebar
function closeSidebar() {
    document.body.classList.remove('sidebar-open');
}

// Open settings panel
function openSettings() {
    document.body.classList.add('settings-open');
}

// Close settings panel
function closeSettings() {
    document.body.classList.remove('settings-open');
}

// Close modal
function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// Handle theme change from settings
function handleThemeChange(e) {
    currentTheme = e.target.value;
    localStorage.setItem('theme', currentTheme);
    applyTheme(currentTheme);
}

// Handle keyboard shortcuts
function handleKeyDown(e) {
    // Ctrl+Enter to submit
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        chatForm.dispatchEvent(new Event('submit'));
    }
}

// Handle global keyboard shortcuts
function handleGlobalKeyDown(e) {
    // Ctrl+N for new chat
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        startNewChat();
    }
    
    // Ctrl+S to save chat
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        openSaveChatModal();
    }
    
    // Ctrl+, to open settings
    if (e.ctrlKey && e.key === ',') {
        e.preventDefault();
        openSettings();
    }
    
    // Ctrl+M to toggle voice input
    if (e.ctrlKey && e.key === 'm') {
        e.preventDefault();
        toggleVoiceInput();
    }
    
    // Escape to close modals and panels
    if (e.key === 'Escape') {
        closeSettings();
        closeModal();
    }
}

// Export data
function exportData() {
    const data = {
        chats: chats,
        settings: {
            theme: currentTheme,
            voice: selectedVoice,
            voiceRate: voiceRateValue,
            voicePitch: voicePitchValue,
            autoReadResponses: autoReadResponsesEnabled
        }
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'multi-model-ai-chatbot-data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showSuccess('Data exported successfully');
}

// Import data
function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = e => {
        const file = e.target.files[0];
        
        if (!file) {
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = event => {
            try {
                const data = JSON.parse(event.target.result);
                
                // Validate data structure
                if (!data.chats) {
                    throw new Error('Invalid data format: missing chats');
                }
                
                // Import chats
                chats = data.chats;
                localStorage.setItem('chats', JSON.stringify(chats));
                
                // Import settings if available
                if (data.settings) {
                    if (data.settings.theme) {
                        currentTheme = data.settings.theme;
                        localStorage.setItem('theme', currentTheme);
                        applyTheme(currentTheme);
                        themeSelect.value = currentTheme;
                    }
                    
                    if (data.settings.voice) {
                        selectedVoice = data.settings.voice;
                        localStorage.setItem('selectedVoice', selectedVoice);
                        if (voiceSelect) voiceSelect.value = selectedVoice;
                    }
                    
                    if (data.settings.voiceRate) {
                        voiceRateValue = data.settings.voiceRate;
                        localStorage.setItem('voiceRate', voiceRateValue);
                        if (voiceRateInput) {
                            voiceRateInput.value = voiceRateValue;
                            voiceRateDisplay.textContent = voiceRateValue.toFixed(1);
                        }
                    }
                    
                    if (data.settings.voicePitch) {
                        voicePitchValue = data.settings.voicePitch;
                        localStorage.setItem('voicePitch', voicePitchValue);
                        if (voicePitchInput) {
                            voicePitchInput.value = voicePitchValue;
                            voicePitchDisplay.textContent = voicePitchValue.toFixed(1);
                        }
                    }
                    
                    if (data.settings.autoReadResponses !== undefined) {
                        autoReadResponsesEnabled = data.settings.autoReadResponses;
                        localStorage.setItem('autoReadResponses', autoReadResponsesEnabled);
                        if (autoReadResponsesCheckbox) {
                            autoReadResponsesCheckbox.checked = autoReadResponsesEnabled;
                        }
                    }
                }
                
                // Refresh chat list
                loadChatHistory();
                
                // Start a new chat
                startNewChat();
                
                showSuccess('Data imported successfully');
            } catch (error) {
                console.error('Error importing data:', error);
                showError('Failed to import data: ' + error.message);
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Confirm clear all data
function confirmClearAllData() {
    if (confirm('Are you sure you want to clear all data? This will delete all chats and reset all settings.')) {
        clearAllData();
    }
}

// Clear all data
function clearAllData() {
    // Clear chats
    chats = {};
    localStorage.removeItem('chats');
    
    // Reset settings to defaults
    currentTheme = 'dark';
    localStorage.setItem('theme', currentTheme);
    applyTheme(currentTheme);
    themeSelect.value = currentTheme;
    
    selectedVoice = '';
    localStorage.removeItem('selectedVoice');
    if (voiceSelect) voiceSelect.value = '';
    
    voiceRateValue = 1;
    localStorage.setItem('voiceRate', voiceRateValue);
    if (voiceRateInput) {
        voiceRateInput.value = voiceRateValue;
        voiceRateDisplay.textContent = voiceRateValue.toFixed(1);
    }
    
    voicePitchValue = 1;
    localStorage.setItem('voicePitch', voicePitchValue);
    if (voicePitchInput) {
        voicePitchInput.value = voicePitchValue;
        voicePitchDisplay.textContent = voicePitchValue.toFixed(1);
    }
    
    autoReadResponsesEnabled = true;
    localStorage.setItem('autoReadResponses', autoReadResponsesEnabled);
    if (autoReadResponsesCheckbox) {
        autoReadResponsesCheckbox.checked = autoReadResponsesEnabled;
    }
    
    // Refresh chat list
    loadChatHistory();
    
    // Start a new chat
    startNewChat();
    
    // Close settings
    closeSettings();
    
    showSuccess('All data cleared successfully');
}

// Show success message
function showSuccess(message) {
    const successElement = document.createElement('div');
    successElement.className = 'success-toast';
    successElement.textContent = message;
    
    document.body.appendChild(successElement);
    
    // Remove after 5 seconds
    setTimeout(() => {
        successElement.remove();
    }, 5000);
}
