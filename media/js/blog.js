// Blog post loader that reads markdown files from the blogs folder

// List of blog post files (you'll need to add new entries here when you add new posts)
// Format: { file: 'filename.md', title: 'Post Title', date: 'YYYY-MM-DD', excerpt: 'Short description' }
const blogPosts = [
    // Example entry (remove or replace with your actual posts):
    // { 
    //     file: 'my-first-post.md', 
    //     title: 'My First Blog Post', 
    //     date: '2025-01-15',
    //     excerpt: 'An introduction to my research journey in AI and mathematics.'
    // }
];

// Function to load and display blog posts
async function loadBlogPosts() {
    const blogListContainer = document.getElementById('blog-list');
    
    if (blogPosts.length === 0) {
        blogListContainer.innerHTML = `
            <div class="no-posts">
                <p>No blog posts yet. Stay tuned!</p>
                <p class="blog-instruction">To add a blog post:</p>
                <ol class="blog-instruction-list">
                    <li>Create a markdown (.md) file in the <code>blogs/</code> folder</li>
                    <li>Add an entry to the <code>blogPosts</code> array in <code>media/js/blog.js</code></li>
                    <li>The post will automatically appear here</li>
                </ol>
            </div>
        `;
        return;
    }

    // Sort posts by date (newest first)
    const sortedPosts = [...blogPosts].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Clear loading message
    blogListContainer.innerHTML = '';
    
    // Create blog post previews
    for (const post of sortedPosts) {
        const postElement = createBlogPostPreview(post);
        blogListContainer.appendChild(postElement);
    }
}

// Create a blog post preview card
function createBlogPostPreview(post) {
    const article = document.createElement('article');
    article.className = 'blog-post-preview';
    
    const formattedDate = formatDate(post.date);
    
    article.innerHTML = `
        <div class="blog-post-header">
            <h2 class="blog-post-title">${post.title}</h2>
            <time class="blog-post-date">${formattedDate}</time>
        </div>
        <p class="blog-post-excerpt">${post.excerpt}</p>
        <a href="blog-post.html?post=${post.file}" class="blog-read-more">
            Read more <i class="fas fa-arrow-right"></i>
        </a>
    `;
    
    return article;
}

// Format date to readable format
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Load blog posts when page loads
document.addEventListener('DOMContentLoaded', loadBlogPosts);


