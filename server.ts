import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { getCitiesList } from "./src/data/cities";
import { getPillarsList } from "./src/data/pillars";
import { createServer as createHttpServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Interface structures
interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone: string;
  city: string;
  createdAt: string;
}

interface PickupRequest {
  id: string;
  userId: string | null;
  clientEmail: string;
  clientPhone: string;
  city: string;
  deviceType: string;
  quantity: number;
  estimatedPayout: number;
  status: 'pending' | 'assigned' | 'in_transit' | 'completed';
  createdAt: string;
  driverName?: string;
  driverPhone?: string;
  driverLat?: number;
  driverLng?: number;
  estimatedArrivalMinutes?: number;
}

// Simple In-Memory Database store with real persistent simulation across connections
const users: User[] = [];
const sessions: Record<string, string> = {}; // sessionToken -> userId
const pickups: PickupRequest[] = [];

// Seed some test data to show immediate tracking status
const demoUser: User = {
  id: "USR-001",
  name: "Adarsh Nair",
  email: "codesbyfebin@gmail.com",
  passwordHash: "demo123", // Simple password check for demo utility
  phone: "+91-9845011223",
  city: "kozhikode",
  createdAt: new Date().toISOString()
};
users.push(demoUser);

// Seed active pickup for demo tracking
const demoPickup: PickupRequest = {
  id: "PKP-2026",
  userId: "USR-001",
  clientEmail: "codesbyfebin@gmail.com",
  clientPhone: "+91-9845011223",
  city: "kozhikode",
  deviceType: "laptop_working",
  quantity: 2,
  estimatedPayout: 7350,
  status: "assigned",
  createdAt: new Date().toISOString(),
  driverName: "Rohan Kumar",
  driverPhone: "+91-9876543210",
  driverLat: 11.2588, // Kozhikode coords slightly offset
  driverLng: 75.7804,
  estimatedArrivalMinutes: 12
};
pickups.push(demoPickup);

async function bootstrap() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // WebSocket Setup
  const httpServer = createHttpServer(app);
  const wss = new WebSocketServer({ noServer: true });

  // Map to store connected WS clients subscribing to pickup IDs
  const activeSubscriptions = new Map<WebSocket, string>(); // ws -> pickupId

  httpServer.on("upgrade", (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  });

  wss.on("connection", (ws) => {
    console.log("Client connected to server WebSocket.");

    ws.on("message", (messageStr) => {
      try {
        const data = JSON.parse(messageStr.toString());
        if (data.type === "subscribe") {
          activeSubscriptions.set(ws, data.pickupId);
          console.log(`ws client subscribed to pickup tracker: ${data.pickupId}`);
          
          // Instantly send current state
          const pickup = pickups.find(p => p.id === data.pickupId);
          if (pickup) {
            ws.send(JSON.stringify({ type: "pickup_update", pickup }));
          }
        }
      } catch (err) {
        console.error("Error in WS message: ", err);
      }
    });

    ws.on("close", () => {
      activeSubscriptions.delete(ws);
      console.log("Client disconnected from server WebSocket.");
    });
  });

  // Helper function to broadcast pickup updates to subscribers
  function broadcastPickupUpdate(pickupId: string, pickup: PickupRequest) {
    activeSubscriptions.forEach((subPickupId, ws) => {
      if (subPickupId === pickupId && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "pickup_update", pickup }));
      }
    });
  }

  // 1. Authentication REST Endpoints
  app.post("/api/auth/signup", (req, res) => {
    const { name, email, password, phone, city } = req.body;
    if (!name || !email || !password || !phone || !city) {
      return res.status(400).json({ error: "All profile fields are required." });
    }

    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ error: "Email already registered." });
    }

    const newUser: User = {
      id: `USR-${Math.floor(Math.random() * 9000 + 1000)}`,
      name,
      email: email.toLowerCase(),
      passwordHash: password, // For simulation convenience, stored as-is
      phone,
      city,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);

    // Auto log-in
    const sessionToken = `SES-${Math.random().toString(36).substring(2, 15)}`;
    sessions[sessionToken] = newUser.id;

    res.json({ user: { id: newUser.id, name: newUser.name, email: newUser.email, phone: newUser.phone, city: newUser.city }, sessionToken });
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user || user.passwordHash !== password) {
      return res.status(401).json({ error: "Invalid email credentials or incorrect password." });
    }

    const sessionToken = `SES-${Math.random().toString(36).substring(2, 15)}`;
    sessions[sessionToken] = user.id;

    res.json({ user: { id: user.id, name: user.name, email: user.email, phone: user.phone, city: user.city }, sessionToken });
  });

  app.post("/api/auth/logout", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (token && sessions[token]) {
      delete sessions[token];
    }
    res.json({ success: true });
  });

  app.get("/api/auth/me", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token || !sessions[token]) {
      return res.status(401).json({ error: "Unauthorized session context." });
    }
    const userId = sessions[token];
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(401).json({ error: "User session expired." });
    }
    res.json({ id: user.id, name: user.name, email: user.email, phone: user.phone, city: user.city });
  });

  // 2. Pickups REST Endpoints
  app.post("/api/pickups/schedule", (req, res) => {
    const { email, phone, city, deviceType, quantity, estimatedPayout } = req.body;
    
    // Check session for optional authenticated user association
    const token = req.headers.authorization?.split(" ")[1];
    let authenticatedUserId: string | null = null;
    if (token && sessions[token]) {
      authenticatedUserId = sessions[token];
    }

    const newPickup: PickupRequest = {
      id: `PKP-${Math.floor(Math.random() * 900000 + 100000)}`,
      userId: authenticatedUserId,
      clientEmail: email || "anonymous@ewastekochi.com",
      clientPhone: phone || "+91-0000000000",
      city: city || "kochi",
      deviceType: deviceType || "laptop_dead",
      quantity: Number(quantity) || 1,
      estimatedPayout: Number(estimatedPayout) || 0,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    // Auto assign driver for immediate demonstration joy
    setTimeout(() => {
      newPickup.status = "assigned";
      newPickup.driverName = "Ramesh Chandran";
      newPickup.driverPhone = "+91-9447012345";
      newPickup.estimatedArrivalMinutes = 15;
      
      // Default to slightly offset starting coordinates near dynamic city zones
      newPickup.driverLat = 11.25 + (Math.random() - 0.5) * 0.05;
      newPickup.driverLng = 75.78 + (Math.random() - 0.5) * 0.05;
      
      broadcastPickupUpdate(newPickup.id, newPickup);
    }, 4000);

    pickups.push(newPickup);
    res.json(newPickup);
  });

  app.get("/api/pickups/user", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token || !sessions[token]) {
      return res.status(401).json({ error: "Unauthorized session context." });
    }
    const userId = sessions[token];
    const userPickups = pickups.filter(p => p.userId === userId);
    res.json(userPickups);
  });

  // Fetch individual pickup specs
  app.get("/api/pickups/:id", (req, res) => {
    const pickup = pickups.find(p => p.id === req.params.id);
    if (!pickup) {
      return res.status(404).json({ error: "Pickup request not identified." });
    }
    res.json(pickup);
  });

  // 3. Driver/Admin Simulation Engine Endpoint
  // Allows pushing simulated path ticks to live clients via standard WebSockets
  app.post("/api/driver/simulate-tick", (req, res) => {
    const { pickupId, action, lat, lng, minutes } = req.body;
    const pickup = pickups.find(p => p.id === pickupId);

    if (!pickup) {
      return res.status(404).json({ error: "Target pickup id not identified." });
    }

    if (action === "assign") {
      pickup.status = "assigned";
      pickup.driverName = "Rohan Nair";
      pickup.driverPhone = "+91-9895012345";
      pickup.driverLat = lat || 11.2588;
      pickup.driverLng = lng || 75.7804;
      pickup.estimatedArrivalMinutes = minutes || 12;
    } else if (action === "transmit") {
      pickup.status = "in_transit";
      if (lat) pickup.driverLat = lat;
      if (lng) pickup.driverLng = lng;
      if (minutes !== undefined) pickup.estimatedArrivalMinutes = minutes;
    } else if (action === "complete") {
      pickup.status = "completed";
      pickup.estimatedArrivalMinutes = 0;
    }

    // Persist and broadcast live via socket
    broadcastPickupUpdate(pickupId, pickup);
    res.json({ success: true, pickup });
  });

  // 4. Dynamic XML Sitemap core generator
  app.get("/sitemap.xml", (req, res) => {
    try {
      const cities = getCitiesList();
      const pillars = getPillarsList();

      res.header("Content-Type", "application/xml");

      const urls = [
        // Main domain assets
        { loc: "https://ewastekochi.com/", changefreq: "weekly", priority: "1.0" },
        { loc: "https://ewastekochi.com/campaign/itad-infopark-kakkanad", changefreq: "weekly", priority: "0.9" },
      ];

      // Add all 100 city pages under location.ewastekochi.com
      cities.forEach((city) => {
        urls.push({
          loc: `https://location.ewastekochi.com/${city.slug}`,
          changefreq: "daily",
          priority: "0.85"
        });
      });

      // Add all 100 evergreen pillar pages
      pillars.forEach((pillar) => {
        urls.push({
          loc: `https://ewastekochi.com/pillar/${pillar.slug}`,
          changefreq: "daily",
          priority: "0.85"
        });
      });

      const xmlItems = urls
        .map(
          (url) => `  <url>
    <loc>${url.loc}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
        )
        .join("\n");

      const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlItems}
</urlset>`;

      res.send(sitemapXml);
    } catch (error) {
      console.error("Sitemap generation failure:", error);
      res.status(500).send("Error generating sitemap XML");
    }
  });

  // Vite Integration Setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`[FULL-STACK HOST] Server active on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("System crash while initializing server: ", err);
});
