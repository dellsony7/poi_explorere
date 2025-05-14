Here’s a professional and complete `README.md` tailored for your **POI Explorer** project based on your package configuration and project requirements:

---

````markdown
# 🗺️ POI Explorer

A geolocation-based web application built with **Next.js**, **Supabase**, **PGLite**, and **Leaflet** that allows users to search, view, and manage Points of Interest (POIs) with offline support and interactive maps.

![POI Explorer Screenshot](./public/screenshot.png) <!-- Optional image -->

---

## 🚀 Features

- 🔐 **Authentication**: Sign-up, login, and logout with Supabase Auth
- 🌐 **POI Search**: Search POIs via [OpenStreetMap Nominatim API](https://nominatim.openstreetmap.org/)
- 🗺️ **Interactive Map**: View POIs on Leaflet with zoom, pan, and marker interactions
- 📍 **Geospatial Calculations**: Measure distances using the Haversine formula
- 🎯 **Sorting & Filtering**: Sort POIs by name/distance, filter by radius
- 📦 **Offline Support**: Local data storage and sync with Supabase using PGLite
- 💅 **Responsive UI**: Built with Ant Design (AntD)
- 💥 **Error Handling**: Friendly feedback for network or validation issues

---

## 🧱 Tech Stack

| Tech         | Role                              |
|--------------|-----------------------------------|
| Next.js      | Frontend Framework                |
| Supabase     | Auth & Cloud PostgreSQL Storage   |
| PGLite       | Local PostgreSQL for Offline Mode |
| Leaflet      | Interactive Map                   |
| React        | UI Components                     |
| Ant Design   | UI Component Library              |
| Nominatim API| POI Data Source                   |

---

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/poi-explorer.git
cd poi-explorer
````

### 2. Install Dependencies

```bash
yarn install
# or
npm install
```

### 3. Setup Supabase

* Create a [Supabase](https://supabase.com) project.
* Enable **Email Auth** in `Authentication > Providers`.
* Create `pois` and `users` tables based on your schema.
* Get your Supabase URL and public anon key.

### 4. Add `.env.local` File

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Run the App
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## 🛠 PGLite (Local Offline Support)

* Used for local storage of POIs and user data.
* Automatically syncs with Supabase when back online.
* Enables searching, adding POIs offline.

> PGLite runs in-browser using `pg-lite`. No extra setup required.

---

## 📡 API Usage – Nominatim

This app uses the OpenStreetMap **Nominatim API** for POI search.
**Important**: Respect API rate limits and include a user-agent.

```ts
fetch(`https://nominatim.openstreetmap.org/search?...`, {
  headers: {
    'User-Agent': 'poi-explorer-app'
  }
})
```


## ✅ Completed Requirements

* [x] Supabase Auth
* [x] Offline support with PGLite
* [x] POI search via Nominatim
* [x] Map rendering via Leaflet
* [x] Sorting, radius filtering
* [x] Distance calculation
* [x] AntD-based UI
* [x] Error boundaries

---

## 📦 Scripts

```bash
npm dev       # Run development server
npm build     # Build for production
npm start     # Start production server
npm lint      # Run ESLint
```

---

## 📄 License

This project is open-source and free to use under the MIT License.

---

## 📬 Contact

Have questions or feedback?

* GitHub: [@your-username](https://github.com/dellsony7)

---

```

Let me know if you'd like this in a downloadable `.md` file or want help customizing the `PGLite` or Supabase schema.
```
