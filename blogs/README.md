# How to Add Blog Posts

This folder contains your blog posts in Markdown format.

## Adding a New Blog Post

1. **Create a Markdown file** in this `blogs/` folder with a `.md` extension
   - Example: `my-first-post.md`, `string-theory-thoughts.md`, etc.

2. **Write your content** in Markdown format
   - Use `# Heading` for titles
   - Use `## Subheading` for sections
   - Add links: `[text](url)`
   - Add images: `![alt text](image-url)`
   - Add code: Use backticks for inline code or triple backticks for code blocks

3. **Register your post** in `media/js/blog.js`
   - Open `media/js/blog.js`
   - Find the `blogPosts` array
   - Add a new entry:
   ```javascript
   {
       file: 'your-post-name.md',
       title: 'Your Post Title',
       date: '2025-01-15',
       excerpt: 'A brief description of your post.'
   }
   ```

4. **Save and refresh** - Your blog post will automatically appear on the blog page!

## Example Blog Post

Create a file called `example-post.md`:

```markdown
# My First Blog Post

Welcome to my blog! This is where I'll share thoughts on AI, mathematics, and string theory.

## Introduction

Here's some introductory text...

## Code Example

You can include code:

\`\`\`python
def hello_world():
    print("Hello, world!")
\`\`\`

## Links

Check out [my research](academic-website-demo.html#research).
```

Then add to `media/js/blog.js`:

```javascript
const blogPosts = [
    {
        file: 'example-post.md',
        title: 'My First Blog Post',
        date: '2025-01-15',
        excerpt: 'An introduction to my blog where I share thoughts on AI and mathematics.'
    }
];
```

That's it! Your post will appear on the blog page.


