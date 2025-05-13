// Voice Features Implementation

// Initialize voice features
function initVoiceFeatures() {
    // Initialize speech recognition if available
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onstart = () => {
            isListening = true;
            voiceIndicator.classList.add('active');
            voiceInputBtn.classList.add('active');
            voiceToggleBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
            voiceToggleBtn.classList.add('active');
        };
        
        recognition.onend = () => {
            isListening = false;
            voiceIndicator.classList.remove('active');
            voiceInputBtn.classList.remove('active');
            voiceToggleBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            voiceToggleBtn.classList.remove('active');
        };
        
        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            
            if (finalTranscript) {
                userInput.value = finalTranscript;
                voiceText.textContent = '';
                stopVoiceInput();
                // Submit the form after a short delay
                setTimeout(() => {
                    chatForm.dispatchEvent(new Event('submit'));
                }, 500);
            } else {
                voiceText.textContent = interimTranscript;
            }
        };
        
        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            stopVoiceInput();
            showError(`Speech recognition error: ${event.error}`);
        };
    } else {
        // Hide voice buttons if speech recognition is not available
        voiceToggleBtn.style.display = 'none';
        voiceInputBtn.style.display = 'none';
    }
    
    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
        // Get available voices
        speechSynthesis = window.speechSynthesis;
        
        // Chrome loads voices asynchronously
        speechSynthesis.onvoiceschanged = loadVoices;
        loadVoices();
        
        // Initialize voice settings
        voiceRateInput.value = voiceRateValue;
        voicePitchInput.value = voicePitchValue;
        voiceRateDisplay.textContent = voiceRateValue.toFixed(1);
        voicePitchDisplay.textContent = voicePitchValue.toFixed(1);
        autoReadResponsesCheckbox.checked = autoReadResponsesEnabled;
    } else {
        // Hide voice settings if speech synthesis is not available
        document.querySelector('.settings-section:nth-child(2)').style.display = 'none';
    }
}

// Load available voices
function loadVoices() {
    voices = speechSynthesis.getVoices();
    
    if (voices.length === 0) {
        return;
    }
    
    // Clear voice select
    voiceSelect.innerHTML = '';
    
    // Add voices to select
    voices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(option);
    });
    
    // Set selected voice
    if (selectedVoice) {
        voiceSelect.value = selectedVoice;
    }
}

// Handle voice change
function handleVoiceChange(e) {
    selectedVoice = e.target.value;
    localStorage.setItem('selectedVoice', selectedVoice);
    
    // Speak a test phrase
    speakText('Hello, this is a test of the selected voice.');
}

// Handle voice rate change
function handleVoiceRateChange(e) {
    voiceRateValue = parseFloat(e.target.value);
    voiceRateDisplay.textContent = voiceRateValue.toFixed(1);
    localStorage.setItem('voiceRate', voiceRateValue);
}

// Handle voice pitch change
function handleVoicePitchChange(e) {
    voicePitchValue = parseFloat(e.target.value);
    voicePitchDisplay.textContent = voicePitchValue.toFixed(1);
    localStorage.setItem('voicePitch', voicePitchValue);
}

// Handle auto-read change
function handleAutoReadChange(e) {
    autoReadResponsesEnabled = e.target.checked;
    localStorage.setItem('autoReadResponses', autoReadResponsesEnabled);
}

// Toggle voice input
function toggleVoiceInput() {
    if (isListening) {
        stopVoiceInput();
    } else {
        startVoiceInput();
    }
}

// Start voice input
function startVoiceInput() {
    if (!recognition) return;
    
    try {
        recognition.start();
    } catch (error) {
        console.error('Error starting speech recognition:', error);
    }
}

// Stop voice input
function stopVoiceInput() {
    if (!recognition) return;
    
    try {
        recognition.stop();
    } catch (error) {
        console.error('Error stopping speech recognition:', error);
    }
}

// Speak text using speech synthesis
function speakText(text) {
    if (!speechSynthesis) return;
    
    // Stop any current speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice if selected
    if (selectedVoice && voices.length > 0) {
        utterance.voice = voices[selectedVoice];
    }
    
    // Set rate and pitch
    utterance.rate = voiceRateValue;
    utterance.pitch = voicePitchValue;
    
    speechSynthesis.speak(utterance);
}

// Speak assistant message
function speakAssistantMessage(message) {
    if (!autoReadResponsesEnabled) return;
    
    // Clean up the message - remove markdown and code blocks
    let cleanText = message.replace(/```[\s\S]*?```/g, 'Code block omitted.');
    cleanText = cleanText.replace(/`([^`]+)`/g, '$1');
    cleanText = cleanText.replace(/\*\*([^*]+)\*\*/g, '$1');
    cleanText = cleanText.replace(/\*([^*]+)\*/g, '$1');
    cleanText = cleanText.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    
    speakText(cleanText);
}
