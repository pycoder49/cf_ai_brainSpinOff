/* ============================================== */
/* RAG CHATBOT - Main JavaScript                 */
/* ============================================== */


/* ============================================== */
/* DATA - Sample data (replace with your own)    */
/* ============================================== */

/* ============================================== */
const API_BASE_URL = "https://cf-ai-brainspinoff.arahuja.workers.dev";

/* ============================================== */
/* MY HELPERS MADE BY ARYAN */
/* ============================================== */
function getChatId(){
    const key = "chat_id";
    let id = localStorage.getItem(key);

    if(!id){
        id = crypto.randomUUID();
        localStorage.setItem(key, id);
    }

    return id;
}

// Relevant chats data - these would come from your RAG system
// based on similarity to the current conversation
const relevantChats = [
    {
        id: 1,
        title: 'API Integration Guide',
        preview: 'Discussion about REST endpoints...',
        similarity: 94
    },
    {
        id: 2,
        title: 'Database Schema Design',
        preview: 'Conversation about PostgreSQL...',
        similarity: 87
    },
    {
        id: 3,
        title: 'Authentication Flow',
        preview: 'OAuth2 implementation details...',
        similarity: 82
    }
];

// Recent chats data - user's chat history
const recentChats = [
    { id: 1, title: 'Project Setup', date: 'Today', unread: true },
    { id: 2, title: 'Deployment Pipeline', date: 'Yesterday', unread: false },
    { id: 3, title: 'Code Review Notes', date: 'Jan 30', unread: false },
    { id: 4, title: 'Feature Planning', date: 'Jan 28', unread: false },
    { id: 5, title: 'Bug Triage Session', date: 'Jan 25', unread: false }
];

// File system data - your knowledge base structure
const fileSystem = {
    id: 'root',
    name: 'Knowledge Base',
    type: 'folder',
    children: [
        {
            id: 'documents',
            name: 'Documents',
            type: 'folder',
            children: [
                { id: 'doc1', name: 'API_Documentation.pdf', type: 'file', ext: 'pdf' },
                { id: 'doc2', name: 'Architecture_Overview.md', type: 'file', ext: 'md' },
                { id: 'doc3', name: 'Meeting_Notes_Q4.docx', type: 'file', ext: 'docx' }
            ]
        },
        {
            id: 'research',
            name: 'Research',
            type: 'folder',
            children: [
                { id: 'res1', name: 'Market_Analysis.pdf', type: 'file', ext: 'pdf' },
                { id: 'res2', name: 'Competitor_Report.xlsx', type: 'file', ext: 'xlsx' }
            ]
        },
        {
            id: 'code',
            name: 'Code Snippets',
            type: 'folder',
            children: [
                { id: 'code1', name: 'utils.py', type: 'file', ext: 'py' },
                { id: 'code2', name: 'config.json', type: 'file', ext: 'json' }
            ]
        }
    ]
};

// Recent files - files recently accessed/retrieved
const recentFiles = [
    { id: 'doc1', name: 'API_Documentation.pdf', ext: 'pdf', accessed: '2 min ago' },
    { id: 'res1', name: 'Market_Analysis.pdf', ext: 'pdf', accessed: '15 min ago' },
    { id: 'doc2', name: 'Architecture_Overview.md', ext: 'md', accessed: '1 hour ago' },
    { id: 'code1', name: 'utils.py', ext: 'py', accessed: '3 hours ago' }
];

// Chat messages
let messages = [
    {
        id: 1,
        type: 'assistant',
        text: "Hello! I'm your AI assistant. I can help you find information from your documents and previous conversations. What would you like to know?"
    }
];


/* ============================================== */
/* STATE - Application state                     */
/* ============================================== */

// Track which folders are expanded
let expandedFolders = ['root', 'documents'];

// Current search query for file filtering
let fileSearchQuery = '';


/* ============================================== */
/* DOM ELEMENTS                                  */
/* ============================================== */

const elements = {
    // Left sidebar
    relevantChatsList: document.getElementById('relevant-chats-list'),
    recentChatsList: document.getElementById('recent-chats-list'),
    btnNewChat: document.getElementById('btn-new-chat'),
    
    // Main chat
    messagesContainer: document.getElementById('messages-container'),
    messageInput: document.getElementById('message-input'),
    btnSend: document.getElementById('btn-send'),
    documentCount: document.getElementById('document-count'),
    
    // Right sidebar
    fileTree: document.getElementById('file-tree'),
    fileSearch: document.getElementById('file-search'),
    searchClear: document.getElementById('search-clear'),
    recentFilesList: document.getElementById('recent-files-list'),
    dropZone: document.getElementById('drop-zone'),
    fileInput: document.getElementById('file-input'),
    browseLink: document.getElementById('browse-link')
};


/* ============================================== */
/* UTILITY FUNCTIONS                             */
/* ============================================== */

/**
 * Get the appropriate icon for a file extension
 * @param {string} ext - File extension
 * @returns {string} - Emoji icon
 */
function getFileIcon(ext) {
    const icons = {
        pdf: '📄',
        md: '📝',
        docx: '📃',
        xlsx: '📊',
        py: '🐍',
        json: '⚙️',
        js: '🟨',
        html: '🌐',
        css: '🎨',
        txt: '📋',
        default: '📎'
    };
    
    return icons[ext] || icons.default;
}

/**
 * Generate a unique ID
 * @returns {number} - Unique timestamp-based ID
 */
function generateId() {
    return Date.now();
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


/* ============================================== */
/* RENDER FUNCTIONS - Left Sidebar               */
/* ============================================== */

/**
 * Render the relevant chats list
 */
function renderRelevantChats() {
    elements.relevantChatsList.innerHTML = relevantChats.map((chat, index) => `
        <div 
            class="relevant-chat-item" 
            data-id="${chat.id}"
            style="animation-delay: ${index * 0.1}s"
        >
            <div class="relevant-chat-header">
                <span class="relevant-chat-title">${escapeHtml(chat.title)}</span>
                <span class="similarity-badge">${chat.similarity}%</span>
            </div>
            <p class="relevant-chat-preview">${escapeHtml(chat.preview)}</p>
        </div>
    `).join('');
    
    // Add click handlers
    document.querySelectorAll('.relevant-chat-item').forEach(item => {
        item.addEventListener('click', () => handleRelevantChatClick(item.dataset.id));
    });
}

/**
 * Render the recent chats list
 */
function renderRecentChats() {
    elements.recentChatsList.innerHTML = recentChats.map((chat, index) => `
        <div 
            class="recent-chat-item ${chat.unread ? 'unread' : ''}" 
            data-id="${chat.id}"
            style="animation-delay: ${index * 0.05}s"
        >
            ${chat.unread ? '<span class="unread-dot"></span>' : ''}
            <span class="recent-chat-title">${escapeHtml(chat.title)}</span>
            <span class="recent-chat-date">${escapeHtml(chat.date)}</span>
        </div>
    `).join('');
    
    // Add click handlers
    document.querySelectorAll('.recent-chat-item').forEach(item => {
        item.addEventListener('click', () => handleRecentChatClick(item.dataset.id));
    });
}


/* ============================================== */
/* RENDER FUNCTIONS - Chat Messages              */
/* ============================================== */

/**
 * Render all chat messages
 */
function renderMessages() {
    elements.messagesContainer.innerHTML = messages.map(msg => {
        const sourcesHtml = msg.sources ? `
            <div class="message-sources">
                <span class="sources-label">Sources:</span>
                ${msg.sources.map(source => `
                    <span class="source-tag">${escapeHtml(source)}</span>
                `).join('')}
            </div>
        ` : '';
        
        return `
            <div class="message ${msg.type}">
                <div class="message-bubble">
                    <p class="message-text">${escapeHtml(msg.text)}</p>
                    ${sourcesHtml}
                </div>
            </div>
        `;
    }).join('');
    
    // Scroll to bottom
    elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
}

/**
 * Add a new message to the chat
 * @param {string} type - 'user' or 'assistant'
 * @param {string} text - Message text
 * @param {string[]} sources - Optional array of source references
 */
function addMessage(type, text, sources = null) {
    const message = {
        id: generateId(),
        type,
        text
    };
    
    if (sources) {
        message.sources = sources;
    }
    
    messages.push(message);
    renderMessages();
}


/* ============================================== */
/* RENDER FUNCTIONS - File Tree                  */
/* ============================================== */

/**
 * Render the file tree recursively
 * @param {Object} node - File system node
 * @param {number} depth - Current depth level
 * @returns {string} - HTML string
 */
function renderFileTreeNode(node, depth = 0) {
    const paddingLeft = 8 + (depth * 16);
    const isExpanded = expandedFolders.includes(node.id);
    
    // Check if node matches search
    const matchesSearch = !fileSearchQuery || 
        node.name.toLowerCase().includes(fileSearchQuery.toLowerCase());
    
    if (node.type === 'folder') {
        // Check if any children match search
        const hasMatchingChildren = node.children?.some(child => 
            child.name.toLowerCase().includes(fileSearchQuery.toLowerCase()) ||
            (child.type === 'folder' && hasMatchingDescendants(child))
        );
        
        // Hide folder if no matches
        if (fileSearchQuery && !matchesSearch && !hasMatchingChildren) {
            return '';
        }
        
        const childrenHtml = node.children
            ? node.children.map(child => renderFileTreeNode(child, depth + 1)).join('')
            : '';
        
        return `
            <div class="file-tree-folder">
                <div 
                    class="file-tree-item folder" 
                    data-id="${node.id}"
                    style="padding-left: ${paddingLeft}px"
                >
                    <span class="folder-arrow ${isExpanded ? 'expanded' : ''}">▶</span>
                    <span class="file-tree-icon">📁</span>
                    <span class="file-tree-name">${escapeHtml(node.name)}</span>
                    <span class="folder-count">${node.children?.length || 0}</span>
                </div>
                <div class="folder-children ${isExpanded ? 'expanded' : ''}">
                    ${childrenHtml}
                </div>
            </div>
        `;
    }
    
    // Hide file if doesn't match search
    if (fileSearchQuery && !matchesSearch) {
        return '';
    }
    
    return `
        <div 
            class="file-tree-item file" 
            data-id="${node.id}"
            style="padding-left: ${paddingLeft + 20}px"
        >
            <span class="file-tree-icon">${getFileIcon(node.ext)}</span>
            <span class="file-tree-name">${escapeHtml(node.name)}</span>
        </div>
    `;
}

/**
 * Check if a folder has any matching descendants
 * @param {Object} node - Folder node
 * @returns {boolean}
 */
function hasMatchingDescendants(node) {
    if (!node.children) return false;
    
    return node.children.some(child => {
        if (child.name.toLowerCase().includes(fileSearchQuery.toLowerCase())) {
            return true;
        }
        if (child.type === 'folder') {
            return hasMatchingDescendants(child);
        }
        return false;
    });
}

/**
 * Render the complete file tree
 */
function renderFileTree() {
    elements.fileTree.innerHTML = renderFileTreeNode(fileSystem);
    
    // Add click handlers for folders
    document.querySelectorAll('.file-tree-item.folder').forEach(item => {
        item.addEventListener('click', () => toggleFolder(item.dataset.id));
    });
    
    // Add click handlers for files
    document.querySelectorAll('.file-tree-item.file').forEach(item => {
        item.addEventListener('click', () => handleFileClick(item.dataset.id));
    });
}

/**
 * Toggle folder expanded/collapsed state
 * @param {string} folderId - Folder ID
 */
function toggleFolder(folderId) {
    if (expandedFolders.includes(folderId)) {
        expandedFolders = expandedFolders.filter(id => id !== folderId);
    } else {
        expandedFolders.push(folderId);
    }
    renderFileTree();
}


/* ============================================== */
/* RENDER FUNCTIONS - Recent Files               */
/* ============================================== */

/**
 * Render the recent files list
 */
function renderRecentFiles() {
    elements.recentFilesList.innerHTML = recentFiles.map((file, index) => `
        <div 
            class="recent-file-item" 
            data-id="${file.id}"
            style="animation-delay: ${index * 0.05}s"
        >
            <span class="recent-file-icon">${getFileIcon(file.ext)}</span>
            <div class="recent-file-info">
                <div class="recent-file-name">${escapeHtml(file.name)}</div>
                <div class="recent-file-time">${escapeHtml(file.accessed)}</div>
            </div>
        </div>
    `).join('');
    
    // Add click handlers
    document.querySelectorAll('.recent-file-item').forEach(item => {
        item.addEventListener('click', () => handleFileClick(item.dataset.id));
    });
}


/* ============================================== */
/* EVENT HANDLERS                                */
/* ============================================== */

/**
 * Handle sending a message
 */
function handleSendMessage() {
    const text = elements.messageInput.value.trim();
    
    if (!text) return;
    
    // Add user message
    addMessage('user', text);
    
    // Clear input
    elements.messageInput.value = '';
    elements.btnSend.disabled = true;
    
    // TODO: Send message to your RAG backend
    // For now, simulate a response
    callCloudflareAPI(text);
}

/**
 * Call Cloudflare Worker API for response
 * @param {string} userMessage - User's message
 */
async function callCloudflareAPI(userMessage){
    try{
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                message: userMessage,
                chatId: getChatId()
            })
        });

        const data = await response.json();

        if(!response.ok){
            throw new Error(data.error || "API Error");
        }

        // add assistant message
        addMessage("assistant", data.response);
    }
    catch(e){
        addMessage("assistant", "Sorry, there was an error processing your request.");
        console.error("API call error:", e);
    }
    finally{
        elements.btnSend.disabled = false;
    }
}

/**
 * Handle clicking on a relevant chat
 * @param {string} chatId - Chat ID
 */
function handleRelevantChatClick(chatId) {
    console.log('Relevant chat clicked:', chatId);
    // TODO: Load the relevant chat or show context
}

/**
 * Handle clicking on a recent chat
 * @param {string} chatId - Chat ID
 */
function handleRecentChatClick(chatId) {
    console.log('Recent chat clicked:', chatId);
    // TODO: Load the chat history
}

/**
 * Handle clicking on a file
 * @param {string} fileId - File ID
 */
function handleFileClick(fileId) {
    console.log('File clicked:', fileId);
    // TODO: Show file preview or add to context
}

/**
 * Handle creating a new chat
 */
function handleNewChat() {
    console.log('New chat clicked');
    // TODO: Clear messages and start fresh
    messages = [
        {
            id: generateId(),
            type: 'assistant',
            text: "Hello! I'm your AI assistant. I can help you find information from your documents and previous conversations. What would you like to know?"
        }
    ];
    renderMessages();
}

/**
 * Handle file search input
 */
function handleFileSearch() {
    fileSearchQuery = elements.fileSearch.value;
    elements.searchClear.hidden = !fileSearchQuery;
    
    // Expand all folders when searching
    if (fileSearchQuery) {
        expandAllFolders(fileSystem);
    }
    
    renderFileTree();
}

/**
 * Expand all folders recursively
 * @param {Object} node - File system node
 */
function expandAllFolders(node) {
    if (node.type === 'folder') {
        if (!expandedFolders.includes(node.id)) {
            expandedFolders.push(node.id);
        }
        node.children?.forEach(child => expandAllFolders(child));
    }
}

/**
 * Clear the file search
 */
function handleSearchClear() {
    elements.fileSearch.value = '';
    fileSearchQuery = '';
    elements.searchClear.hidden = true;
    renderFileTree();
}

/**
 * Handle file drop
 * @param {DragEvent} event - Drop event
 */
function handleFileDrop(event) {
    event.preventDefault();
    elements.dropZone.classList.remove('drag-over');
    
    const files = Array.from(event.dataTransfer.files);
    
    if (files.length > 0) {
        console.log('Files dropped:', files.map(f => f.name));
        // TODO: Upload files to your backend
        handleFileUpload(files);
    }
}

/**
 * Handle file upload (from drop or browse)
 * @param {File[]} files - Array of files
 */
function handleFileUpload(files) {
    // TODO: Implement actual file upload logic
    console.log('Uploading files:', files);
    
    // Example: Add files to the file system (you'd do this after successful upload)
    files.forEach(file => {
        const ext = file.name.split('.').pop().toLowerCase();
        const newFile = {
            id: `file-${generateId()}`,
            name: file.name,
            type: 'file',
            ext: ext
        };
        
        // Add to root for demo (you'd want proper folder selection)
        fileSystem.children.push(newFile);
    });
    
    renderFileTree();
}

/**
 * Handle drag over the drop zone
 * @param {DragEvent} event - Drag event
 */
function handleDragOver(event) {
    event.preventDefault();
    elements.dropZone.classList.add('drag-over');
}

/**
 * Handle drag leave from the drop zone
 */
function handleDragLeave() {
    elements.dropZone.classList.remove('drag-over');
}

/**
 * Handle browse link click
 */
function handleBrowseClick() {
    elements.fileInput.click();
}

/**
 * Handle file input change (from browse)
 * @param {Event} event - Change event
 */
function handleFileInputChange(event) {
    const files = Array.from(event.target.files);
    
    if (files.length > 0) {
        handleFileUpload(files);
    }
    
    // Reset input
    event.target.value = '';
}

/**
 * Handle message input keydown
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleInputKeydown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSendMessage();
    }
}

/**
 * Handle message input change
 */
function handleInputChange() {
    elements.btnSend.disabled = !elements.messageInput.value.trim();
}


/* ============================================== */
/* INITIALIZATION                                */
/* ============================================== */

/**
 * Initialize the application
 */
function init() {
    // Render all components
    renderRelevantChats();
    renderRecentChats();
    renderMessages();
    renderFileTree();
    renderRecentFiles();
    
    // Attach event listeners
    elements.btnSend.addEventListener('click', handleSendMessage);
    elements.btnNewChat.addEventListener('click', handleNewChat);
    elements.messageInput.addEventListener('keydown', handleInputKeydown);
    elements.messageInput.addEventListener('input', handleInputChange);
    elements.fileSearch.addEventListener('input', handleFileSearch);
    elements.searchClear.addEventListener('click', handleSearchClear);
    elements.dropZone.addEventListener('drop', handleFileDrop);
    elements.dropZone.addEventListener('dragover', handleDragOver);
    elements.dropZone.addEventListener('dragleave', handleDragLeave);
    elements.browseLink.addEventListener('click', handleBrowseClick);
    elements.fileInput.addEventListener('change', handleFileInputChange);
    
    // Update document count
    const totalFiles = countFiles(fileSystem);
    elements.documentCount.textContent = totalFiles;
}

/**
 * Count total files in the file system
 * @param {Object} node - File system node
 * @returns {number} - Total file count
 */
function countFiles(node) {
    if (node.type === 'file') {
        return 1;
    }
    
    if (node.children) {
        return node.children.reduce((sum, child) => sum + countFiles(child), 0);
    }
    
    return 0;
}

// Start the application when DOM is ready
document.addEventListener('DOMContentLoaded', init);
