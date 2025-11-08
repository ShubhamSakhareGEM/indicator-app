# Index Viewer Project

A simple web application that displays a 30-day price history for selected financial indices (SPY & QQQ). This project uses a server-side route to fetch data from the Alpha Vantage API and includes a robust caching strategy to respect rate limits.

**Deployed Link:** [https://indicator-app-phzj.vercel.app/](https://indicator-app-phzj.vercel.app/)

## Tech Stack
* **Frontend:** HTML, CSS, Vanilla JavaScript (ES6+)
* **Charting:** Chart.js
* **Backend:** Node.js / Express (as a Vercel Serverless Function)
* **API:** Alpha Vantage
* **Deployment:** Vercel

## Local Setup & Running

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git)
    cd YOUR_REPO_NAME
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create an environment file:**
    Create a file named `.env` in the root of the project. Get a free API key from [Alpha Vantage](https://www.alphavantage.co/support/#api-key) and add it:
    ```ini
    API_KEY=YOUR_API_KEY_HERE
    ```

4.  **Run the development server:**
    ```bash
    vercel dev
    ```
    The app will be running at `http://localhost:3000`.

## Caching Strategy

This project's primary constraint is the Alpha Vantage free API limit (25 requests/day). To manage this, a server-side, in-memory cache is implemented in `/api/index.js`.

* **Mechanism:** A simple JavaScript object (`cache`) is used to store API responses.
* **Key:** The cache key is the stock symbol (e.g., "SPY").
* **TTL (Time-To-Live):** A `CACHE_TTL` is set to **120 seconds** (120,000 ms).
* **Logic:**
    1.  When a request hits `/api/data?symbol=SPY`, the server checks the `cache` object.
    2.  **Cache Hit:** If a valid, non-expired entry for "SPY" exists (i.e., `timestamp` is less than 120 seconds old), the cached data is returned instantly. No API call is made.
    3.  **Cache Miss/Stale:** If no entry exists or the entry is older than 120 seconds, the server makes a new API call to Alpha Vantage.
    4.  The fresh data is then used to update the `cache[SPY]` entry with a new `timestamp` and is sent to the client.

This strategy ensures that if 100 users request "SPY" within a 2-minute window, only **one** API call is made.