// Dashboard functionality
class ConversationDashboard {
    constructor() {
        this.apiUrl = '/api';
        this.conversations = [];
        this.currentConversation = null;
        
        this.initializeElements();
        this.initializeEventListeners();
        this.loadConversations();
    }
    
    initializeElements() {
        // Main elements
        this.conversationsList = document.getElementById('conversations-list');
        this.loadingIndicator = document.getElementById('loading-indicator');
        this.searchInput = document.getElementById('search-input');
        this.sortSelect = document.getElementById('sort-select');
        this.refreshBtn = document.getElementById('refresh-btn');
        
        // Stats elements
        this.totalConversations = document.getElementById('total-conversations');
        this.totalMessages = document.getElementById('total-messages');
        this.recentConversations = document.getElementById('recent-conversations');
        
        // Modal elements
        this.modal = document.getElementById('conversation-modal');
        this.closeModalBtn = document.getElementById('close-modal');
        this.closeModalBtn2 = document.getElementById('close-modal-btn');
        this.deleteConversationBtn = document.getElementById('delete-conversation');
        this.modalTitle = document.getElementById('modal-title');
        this.modalConversationId = document.getElementById('modal-conversation-id');
        this.modalCreatedAt = document.getElementById('modal-created-at');
        this.modalMessageCount = document.getElementById('modal-message-count');
        this.modalMessages = document.getElementById('modal-messages');
    }
    
    initializeEventListeners() {
        // Search functionality
        this.searchInput.addEventListener('input', () => this.filterConversations());
        
        // Sort functionality
        this.sortSelect.addEventListener('change', () => this.sortConversations());
        
        // Refresh button
        this.refreshBtn.addEventListener('click', () => this.loadConversations());
        
        // Modal close buttons
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.closeModalBtn2.addEventListener('click', () => this.closeModal());
        
        // Delete conversation
        this.deleteConversationBtn.addEventListener('click', () => this.deleteCurrentConversation());
        
        // Close modal when clicking outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'block') {
                this.closeModal();
            }
        });
    }
    
    async loadConversations() {
        this.showLoading(true);
        
        try {
            console.log('Loading conversations from:', `${this.apiUrl}/conversations`);
            const response = await fetch(`${this.apiUrl}/conversations`);
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Conversations data:', data);
            this.conversations = data;
            this.updateStats();
            this.renderConversations();
            
        } catch (error) {
            console.error('Error loading conversations:', error);
            this.showError(`Failed to load conversations: ${error.message}`);
        } finally {
            this.showLoading(false);
        }
    }
    
    showLoading(show) {
        this.loadingIndicator.style.display = show ? 'flex' : 'none';
        this.conversationsList.style.opacity = show ? '0.5' : '1';
    }
    
    showError(message) {
        this.conversationsList.innerHTML = `
            <div class="empty-state">
                <div class="icon">⚠️</div>
                <h3>Error</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="dashboard.loadConversations()">
                    <span class="icon">🔄</span>
                    Try Again
                </button>
            </div>
        `;
    }
    
    updateStats() {
        const total = this.conversations.length;
        const totalMessages = this.conversations.reduce((sum, conv) => sum + conv.messageCount, 0);
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const recent = this.conversations.filter(conv => new Date(conv.createdAt) > oneDayAgo).length;
        
        this.totalConversations.textContent = total;
        this.totalMessages.textContent = totalMessages;
        this.recentConversations.textContent = recent;
    }
    
    renderConversations() {
        if (this.conversations.length === 0) {
            this.conversationsList.innerHTML = `
                <div class="empty-state">
                    <div class="icon">💬</div>
                    <h3>No Conversations Yet</h3>
                    <p>Start chatting to see conversations appear here!</p>
                    <a href="index.html" class="btn btn-primary">
                        <span class="icon">💅</span>
                        Start Chatting
                    </a>
                </div>
            `;
            return;
        }
        
        this.conversationsList.innerHTML = this.conversations.map(conv => `
            <div class="conversation-item" onclick="dashboard.openConversation('${conv.conversationId}')">
                <div class="conversation-header">
                    <div class="conversation-id">${conv.conversationId}</div>
                    <div class="conversation-date">${this.formatDate(conv.createdAt)}</div>
                </div>
                <div class="conversation-stats">
                    <div class="stat-item">
                        <div class="stat-value">${conv.messageCount}</div>
                        <div class="stat-text">Messages</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${this.getTimeAgo(conv.createdAt)}</div>
                        <div class="stat-text">Ago</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value ${conv.leadAnalysis ? 'analyzed' : 'not-analyzed'}">${conv.leadAnalysis ? '✓' : '○'}</div>
                        <div class="stat-text">Analyzed</div>
                    </div>
                </div>
                <div class="conversation-actions">
                    <button class="btn btn-small btn-primary" onclick="event.stopPropagation(); dashboard.analyzeLead('${conv.conversationId}')">
                        <span class="icon">🔍</span>
                        Analyze Lead
                    </button>
                    ${conv.leadAnalysis ? `<button class="btn btn-small btn-info" onclick="event.stopPropagation(); dashboard.viewLeadAnalysis('${conv.conversationId}')">
                        <span class="icon">📊</span>
                        View Analysis
                    </button>` : ''}
                    ${conv.leadAnalysis ? `<button class="btn btn-small btn-success" onclick="event.stopPropagation(); dashboard.testWebhook('${conv.conversationId}')">
                        <span class="icon">🔗</span>
                        Test Webhook
                    </button>` : ''}
                </div>
            </div>
        `).join('');
    }
    
    filterConversations() {
        const searchTerm = this.searchInput.value.toLowerCase();
        const filtered = this.conversations.filter(conv => 
            conv.conversationId.toLowerCase().includes(searchTerm) ||
            this.formatDate(conv.createdAt).toLowerCase().includes(searchTerm)
        );
        
        this.renderFilteredConversations(filtered);
    }
    
    sortConversations() {
        const sortBy = this.sortSelect.value;
        let sorted = [...this.conversations];
        
        switch (sortBy) {
            case 'newest':
                sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'oldest':
                sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'most-messages':
                sorted.sort((a, b) => b.messageCount - a.messageCount);
                break;
        }
        
        this.renderFilteredConversations(sorted);
    }
    
    renderFilteredConversations(conversations) {
        if (conversations.length === 0) {
            this.conversationsList.innerHTML = `
                <div class="empty-state">
                    <div class="icon">🔍</div>
                    <h3>No Results Found</h3>
                    <p>Try adjusting your search terms or filters.</p>
                </div>
            `;
            return;
        }
        
        this.conversationsList.innerHTML = conversations.map(conv => `
            <div class="conversation-item" onclick="dashboard.openConversation('${conv.conversationId}')">
                <div class="conversation-header">
                    <div class="conversation-id">${conv.conversationId}</div>
                    <div class="conversation-date">${this.formatDate(conv.createdAt)}</div>
                </div>
                <div class="conversation-stats">
                    <div class="stat-item">
                        <div class="stat-value">${conv.messageCount}</div>
                        <div class="stat-text">Messages</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${this.getTimeAgo(conv.createdAt)}</div>
                        <div class="stat-text">Ago</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value ${conv.leadAnalysis ? 'analyzed' : 'not-analyzed'}">${conv.leadAnalysis ? '✓' : '○'}</div>
                        <div class="stat-text">Analyzed</div>
                    </div>
                </div>
                <div class="conversation-actions">
                    <button class="btn btn-small btn-primary" onclick="event.stopPropagation(); dashboard.analyzeLead('${conv.conversationId}')">
                        <span class="icon">🔍</span>
                        Analyze Lead
                    </button>
                    ${conv.leadAnalysis ? `<button class="btn btn-small btn-info" onclick="event.stopPropagation(); dashboard.viewLeadAnalysis('${conv.conversationId}')">
                        <span class="icon">📊</span>
                        View Analysis
                    </button>` : ''}
                    ${conv.leadAnalysis ? `<button class="btn btn-small btn-success" onclick="event.stopPropagation(); dashboard.testWebhook('${conv.conversationId}')">
                        <span class="icon">🔗</span>
                        Test Webhook
                    </button>` : ''}
                </div>
            </div>
        `).join('');
    }
    
    async openConversation(conversationId) {
        try {
            const response = await fetch(`${this.apiUrl}/conversation/${conversationId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.currentConversation = await response.json();
            this.showConversationModal();
            
        } catch (error) {
            console.error('Error loading conversation:', error);
            alert('Failed to load conversation details. Please try again.');
        }
    }
    
    showConversationModal() {
        if (!this.currentConversation) return;
        
        // Update modal content
        this.modalConversationId.textContent = this.currentConversation.conversationId;
        this.modalCreatedAt.textContent = this.formatDate(this.currentConversation.createdAt);
        this.modalMessageCount.textContent = this.currentConversation.messages.length;
        
        // Render messages
        this.renderMessages(this.currentConversation.messages);
        
        // Show modal
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    renderMessages(messages) {
        if (!messages || messages.length === 0) {
            this.modalMessages.innerHTML = `
                <div class="empty-state">
                    <div class="icon">💬</div>
                    <h3>No Messages</h3>
                    <p>This conversation doesn't have any messages yet.</p>
                </div>
            `;
            return;
        }
        
        this.modalMessages.innerHTML = messages.map(msg => `
            <div class="message-item ${msg.role}">
                <div class="message-role">${msg.role === 'user' ? '👤 User' : '💅 Assistant'}</div>
                <div class="message-content">${this.escapeHtml(msg.content)}</div>
                <div class="message-timestamp">${this.formatDateTime(msg.timestamp)}</div>
            </div>
        `).join('');
    }
    
    async deleteCurrentConversation() {
        if (!this.currentConversation) return;
        
        const confirmed = confirm(`Are you sure you want to delete conversation "${this.currentConversation.conversationId}"? This action cannot be undone.`);
        if (!confirmed) return;
        
        try {
            const response = await fetch(`${this.apiUrl}/conversation/${this.currentConversation.conversationId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Close modal and refresh list
            this.closeModal();
            this.loadConversations();
            
        } catch (error) {
            console.error('Error deleting conversation:', error);
            alert('Failed to delete conversation. Please try again.');
        }
    }
    
    closeModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.currentConversation = null;
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
    
    getTimeAgo(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`;
        return `${Math.floor(diffInSeconds / 2592000)}mo`;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    async analyzeLead(conversationId) {
        try {
            // Show loading state
            const button = event.target.closest('button');
            const originalText = button.innerHTML;
            button.innerHTML = '<span class="spinner"></span> Analyzing...';
            button.disabled = true;
            
            const response = await fetch(`${this.apiUrl}/analyze-lead/${conversationId}`, {
                method: 'POST'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            // Show success message
            button.innerHTML = '<span class="icon">✓</span> Analyzed!';
            button.classList.remove('btn-primary');
            button.classList.add('btn-success');
            
            // Store the analysis result for immediate viewing
            if (result.analysis) {
                // Find the conversation in our list and update it
                const conversation = this.conversations.find(conv => conv.conversationId === conversationId);
                if (conversation) {
                    conversation.leadAnalysis = result.analysis;
                    conversation.analyzedAt = new Date();
                    
                    // Immediately re-render to show the "View Analysis" button
                    this.renderConversations();
                }
            }
            
        } catch (error) {
            console.error('Error analyzing lead:', error);
            alert('Failed to analyze lead. Please try again.');
            
            // Reset button
            const button = event.target.closest('button');
            button.innerHTML = '<span class="icon">🔍</span> Analyze Lead';
            button.disabled = false;
        }
    }
    
    async viewLeadAnalysis(conversationId) {
        try {
            console.log('=== VIEW ANALYSIS DEBUG ===');
            console.log('Conversation ID:', conversationId);
            console.log('Available conversations:', this.conversations);
            
            // Find the conversation data
            const conversation = this.conversations.find(conv => conv.conversationId === conversationId);
            console.log('Found conversation:', conversation);
            
            if (!conversation) {
                console.log('ERROR: Conversation not found');
                alert('Conversation not found.');
                return;
            }
            
            if (!conversation.leadAnalysis) {
                console.log('ERROR: No analysis found');
                alert('No analysis found for this conversation.');
                return;
            }
            
            console.log('Lead analysis data:', conversation.leadAnalysis);
            console.log('Calling showLeadAnalysisModal...');
            this.showLeadAnalysisModal(conversation.leadAnalysis, conversationId);
            
        } catch (error) {
            console.error('Error viewing lead analysis:', error);
            alert('Failed to load lead analysis. Please try again.');
        }
    }
    
    showLeadAnalysisModal(analysis, conversationId) {
        console.log('=== SHOW MODAL DEBUG ===');
        console.log('Analysis data:', analysis);
        console.log('Conversation ID:', conversationId);
        
        // Remove any existing modal first
        const existingModal = document.getElementById('lead-analysis-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create modal HTML
        const modalHtml = `
            <div class="modal" id="lead-analysis-modal" style="display: block;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>📊 Lead Analysis</h3>
                        <button class="close-btn" onclick="dashboard.closeLeadAnalysisModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="lead-quality-badge ${analysis.leadQuality}">
                            <span class="quality-icon">${this.getQualityIcon(analysis.leadQuality)}</span>
                            <span class="quality-text">${analysis.leadQuality.toUpperCase()}</span>
                        </div>
                        
                        <div class="analysis-details">
                            <div class="detail-section">
                                <h4>👤 Customer Information</h4>
                                <div class="detail-grid">
                                    <div class="detail-item">
                                        <span class="label">Name:</span>
                                        <span class="value">${analysis.customerName || 'Not provided'}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="label">Email:</span>
                                        <span class="value">${analysis.customerEmail || 'Not provided'}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="label">Phone:</span>
                                        <span class="value">${analysis.customerPhone || 'Not provided'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="detail-section">
                                <h4>💅 Service Details</h4>
                                <div class="detail-grid">
                                    <div class="detail-item">
                                        <span class="label">Service:</span>
                                        <span class="value">${analysis.customerService || 'Not specified'}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="label">Appointment:</span>
                                        <span class="value">${analysis.customerAppointment ? 'Yes' : 'No'}</span>
                                    </div>
                                    ${analysis.customerTime ? `
                                    <div class="detail-item">
                                        <span class="label">Time:</span>
                                        <span class="value">${analysis.customerTime}</span>
                                    </div>
                                    ` : ''}
                                    ${analysis.customerTechnician ? `
                                    <div class="detail-item">
                                        <span class="label">Technician:</span>
                                        <span class="value">${analysis.customerTechnician}</span>
                                    </div>
                                    ` : ''}
                                </div>
                            </div>
                            
                            ${analysis.customerNotes ? `
                            <div class="detail-section">
                                <h4>📝 Notes</h4>
                                <div class="notes-content">${analysis.customerNotes}</div>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="dashboard.closeLeadAnalysisModal()">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.body.style.overflow = 'hidden';
        
        console.log('Modal HTML added to page');
        console.log('Modal element:', document.getElementById('lead-analysis-modal'));
    }
    
    closeLeadAnalysisModal() {
        const modal = document.getElementById('lead-analysis-modal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = 'auto';
        }
    }
    
    getQualityIcon(quality) {
        switch (quality) {
            case 'good': return '⭐';
            case 'ok': return '👍';
            case 'spam': return '❌';
            default: return '❓';
        }
    }
    
    async testWebhook(conversationId) {
        try {
            // Find the conversation data
            const conversation = this.conversations.find(conv => conv.conversationId === conversationId);
            
            if (!conversation) {
                alert('Conversation not found.');
                return;
            }
            
            if (!conversation.leadAnalysis) {
                alert('No analysis found for this conversation. Please analyze the lead first.');
                return;
            }
            
            // Store the customer data in localStorage for the webhook test page
            localStorage.setItem('webhookTestData', JSON.stringify(conversation.leadAnalysis));
            
            // Open the webhook test page
            window.open('webhook-test.html', '_blank');
            
        } catch (error) {
            console.error('Error opening webhook test:', error);
            alert('Failed to open webhook test. Please try again.');
        }
    }
}

// Initialize dashboard when page loads
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new ConversationDashboard();
});
