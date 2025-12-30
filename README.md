# Web Scraping Project
This project demonstrates core web scraping concepts through a simple interface. 

## Features

### URL Analysis
Enter any website URL and instantly analyze its structure. Simply paste a link and let the scraper do the work.

**What you get:**
- Automatic HTML fetching
- Real-time data extraction
- Clean, structured results

### Data Extraction
The scraper automatically extracts all available data from any webpage:
1. **Page Title:** Extract the main title of any webpage — the text that appears in browser tabs and search results.
2. **Meta Description:** Capture the page's description metadata — the summary text that appears in search engine results.
3. **Main Headings (H1):** Identify all primary headings on the page — the most important content sections.
4. **Link Counter:** Count the total number of hyperlinks present on the webpage.
5. **Scraped Items:** Automatically extract structured data including text content, HTML, and associated links from articles, paragraphs, headings, and other content elements.

**Automatic Pagination:** The scraper automatically follows pagination links to extract data from all pages, ensuring you get complete data from multi-page websites.

### Data Export
Download your scraped data in multiple formats:
- **JSON Format:** Export complete scraped data including metadata and all extracted items in structured JSON format.
- **CSV Format:** Export scraped items in CSV format (text and link columns) for easy import into spreadsheets and data analysis tools.

## How it works
1. Enter any website URL
2. Click "Scrape" - everything is extracted automatically
3. View results instantly
4. Download data in JSON or CSV format

## User-Friendly Interface
- Intuitive input form
- Visual loading indicators
- Clear result display
- Responsive design

## Smart Error Handling
Gracefully handles issues without breaking the experience.
**Handles:**
- Invalid URLs
- Failed connections
- Timeout errors
- Malformed responses

## Tech Stack and Documentations

### Frontend
- [Next.js](https://nextjs.org/docs) - React framework for production 
- [React](https://react.dev/learn)- UI component library
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)- HTTP client
- [Tailwind CSS](https://tailwindcss.com/docs/installation/framework-guides/nextjs) - Styling library

### Backend
- [Node.js](https://nodejs.org/docs/latest/api/)- JavaScript runtime
- [TypeScript](https://www.typescriptlang.org/docs/) - Type-safe JavaScript
- [Express](https://expressjs.com/) - Web application framework

### Scraping Tools
- [Axios](https://axios-http.com/docs/intro) - HTTP client for fetching pages
- [Cheerio](https://cheerio.js.org/docs/intro) - Fast HTML parser

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (comes with Node.js)

### Installation & Setup

1. **Clone the repository** 

```bash
git clone <url>
cd web_scraper
```

### Running the Application

**Backend:**

1. Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

2. Build the TypeScript code:

```bash
npm run build
```

3. Start the backend server:

```bash
npm start
```

The backend will run on [http://localhost:4000](http://localhost:4000)

**Frontend:**

1. Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
```

2. Start the development server:

```bash
npm run dev
```

The frontend will run on [http://localhost:3000](http://localhost:3000)

### Access the Application

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:4000](http://localhost:4000)

**Note:** Make sure the backend is running before using the frontend, as the frontend depends on the backend API.