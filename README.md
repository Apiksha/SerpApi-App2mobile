# SerpApi-App2mobile

This is a full-stack MERN project built for App2Mobile that uses SerpAPI to fetch local business search results. Users can search via keyword and coordinates, view paginated data, download it as CSV, and store it in MongoDB.

#Features
🔎 Search local businesses using SerpAPI
📍 Supports location-based queries
📄 Auto-pagination with total page calculation
⬇️ Export all search results to CSV
🛠 Save results to MongoDB via backend API
✅ Real-time loading and error handling

🧩 Tech Stack
Frontend: React (Custom Hook)
Backend: Node.js + Express
Database: MongoDB
API: SerpAPI (Google Local Results)

📁 API Endpoints
GET /search?q=...&ll=...&page=... → Get local results from SerpAPI

POST /api/results/bulk → Save all results to MongoDB

🏢 Developed For
📱 App2 Mobile – to support business intelligence and local data aggregation for mobile solutions.

