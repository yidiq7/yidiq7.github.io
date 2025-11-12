// Publications loader that automatically reads and displays papers from paper.bib

async function loadPublications() {
    const publicationsContainer = document.getElementById('publications-list');
    
    try {
        // Fetch the BibTeX file
        const response = await fetch('media/bibliography/paper.bib');
        
        if (!response.ok) {
            throw new Error('Could not load bibliography');
        }
        
        const bibtexContent = await response.text();
        
        // Parse the BibTeX content
        const entries = parseBibtex(bibtexContent);
        
        if (entries.length === 0) {
            publicationsContainer.innerHTML = '<p class="no-publications">No publications found.</p>';
            return;
        }
        
        // Sort entries by year (newest first)
        entries.sort((a, b) => {
            const yearA = parseInt(a.year) || 0;
            const yearB = parseInt(b.year) || 0;
            return yearB - yearA;
        });
        
        // Clear loading message
        publicationsContainer.innerHTML = '';
        
        // Create publication elements
        entries.forEach(entry => {
            const pubElement = createPublicationElement(entry);
            publicationsContainer.appendChild(pubElement);
        });
        
    } catch (error) {
        console.error('Error loading publications:', error);
        publicationsContainer.innerHTML = `<p class="error">Failed to load publications. Error: ${error.message}</p>`;
    }
}

// Simple BibTeX parser
function parseBibtex(bibtexText) {
    const entries = [];
    
    // Match each BibTeX entry
    const entryRegex = /@(\w+)\{([^,]+),\s*([\s\S]*?)\n\}/g;
    let match;
    
    while ((match = entryRegex.exec(bibtexText)) !== null) {
        const entryType = match[1];
        const entryKey = match[2];
        const fieldsText = match[3];
        
        const entry = {
            type: entryType,
            key: entryKey
        };
        
        // Parse fields
        const fieldRegex = /(\w+)\s*=\s*\{([^}]*)\}|(\w+)\s*=\s*"([^"]*)"/g;
        let fieldMatch;
        
        while ((fieldMatch = fieldRegex.exec(fieldsText)) !== null) {
            const fieldName = (fieldMatch[1] || fieldMatch[3]).toLowerCase();
            const fieldValue = (fieldMatch[2] || fieldMatch[4]).trim();
            entry[fieldName] = fieldValue;
        }
        
        entries.push(entry);
    }
    
    return entries;
}

// Create a publication element
function createPublicationElement(entry) {
    const div = document.createElement('div');
    div.className = 'publication-item';
    
    const year = entry.year || 'N/A';
    const title = cleanLatex(entry.title || 'Untitled');
    const authors = formatAuthors(entry.author || '');
    const venue = getVenue(entry);
    const links = getLinks(entry);
    
    div.innerHTML = `
        <div class="pub-year">${year}</div>
        <div class="pub-content">
            <div class="pub-title">${title}</div>
            <div class="pub-authors">${authors}</div>
            <div class="pub-venue">${venue}</div>
            ${links ? `<div class="pub-links">${links}</div>` : ''}
        </div>
    `;
    
    return div;
}

// Format authors (convert "Last, First and Last, First" to readable format)
function formatAuthors(authorString) {
    if (!authorString) return '';
    
    // Split by 'and'
    const authors = authorString.split(' and ').map(author => {
        // Clean up whitespace
        author = author.trim();
        
        // If format is "Last, First", convert to "First Last"
        if (author.includes(',')) {
            const parts = author.split(',').map(p => p.trim());
            return `${parts[1]} ${parts[0]}`;
        }
        return author;
    });
    
    // Format author list
    if (authors.length === 1) {
        return formatSingleAuthor(authors[0]);
    } else if (authors.length === 2) {
        return `${formatSingleAuthor(authors[0])} & ${formatSingleAuthor(authors[1])}`;
    } else if (authors.length <= 5) {
        const formatted = authors.map(formatSingleAuthor);
        return formatted.slice(0, -1).join(', ') + ', & ' + formatted[formatted.length - 1];
    } else {
        // More than 5 authors, use et al.
        const formatted = authors.slice(0, 3).map(formatSingleAuthor);
        return formatted.join(', ') + ', et al.';
    }
}

// Format a single author name (abbreviate first/middle names)
function formatSingleAuthor(name) {
    const parts = name.split(' ').filter(p => p);
    if (parts.length === 1) return parts[0];
    
    // Last part is the last name
    const lastName = parts[parts.length - 1];
    
    // Abbreviate first and middle names
    const initials = parts.slice(0, -1).map(part => {
        // Keep if it's already an initial
        if (part.length <= 2 && part.endsWith('.')) return part;
        return part[0] + '.';
    });
    
    return initials.join(' ') + ' ' + lastName;
}

// Get venue information
function getVenue(entry) {
    // Check for explicit note (like "In press, journal name")
    if (entry.note) {
        return cleanLatex(entry.note);
    }
    
    // For proceedings
    if (entry.booktitle) {
        return cleanLatex(entry.booktitle);
    }
    
    // For journal articles
    if (entry.journal) {
        return cleanLatex(entry.journal);
    }
    
    // Check if it's a preprint
    if (entry.eprint && entry.archiveprefix) {
        return `${entry.archiveprefix} Preprint`;
    }
    
    // Fallback to entry type
    const typeMap = {
        'article': 'Journal Article',
        'inproceedings': 'Conference Proceedings',
        'misc': 'Preprint'
    };
    
    return typeMap[entry.type] || 'Publication';
}

// Generate links (arXiv, DOI, etc.)
function getLinks(entry) {
    const links = [];
    
    // arXiv link
    if (entry.eprint) {
        links.push(`<a href="https://arxiv.org/abs/${entry.eprint}" target="_blank" title="arXiv"><i class="fas fa-file-alt"></i> arXiv</a>`);
    }
    
    // DOI link
    if (entry.doi) {
        links.push(`<a href="https://doi.org/${entry.doi}" target="_blank" title="DOI"><i class="fas fa-link"></i> DOI</a>`);
    }
    
    // URL link
    if (entry.url) {
        links.push(`<a href="${entry.url}" target="_blank" title="Link"><i class="fas fa-external-link-alt"></i> Link</a>`);
    }
    
    return links.length > 0 ? links.join('') : null;
}

// Clean LaTeX formatting from text
function cleanLatex(text) {
    if (!text) return '';
    
    // Remove common LaTeX commands
    return text
        .replace(/\\textit\{([^}]+)\}/g, '<em>$1</em>')
        .replace(/\\textbf\{([^}]+)\}/g, '<strong>$1</strong>')
        .replace(/\\emph\{([^}]+)\}/g, '<em>$1</em>')
        .replace(/\\_/g, '_')
        .replace(/\\&/g, '&')
        .replace(/\\\$/g, '$')
        .replace(/\\%/g, '%')
        .replace(/\{\\ss\}/g, 'ß')
        .replace(/\\([a-zA-Z]+)/g, '') // Remove other LaTeX commands
        .replace(/[{}]/g, '') // Remove remaining braces
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
}

// Load publications when page loads
document.addEventListener('DOMContentLoaded', loadPublications);

