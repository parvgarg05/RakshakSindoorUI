import { Router, type Request, Response } from "express";
import { eq, desc } from "drizzle-orm";
import { db } from "./db";
import { 
  users, 
  messages,
  sosSignals,
  evacuationZones,
  insertUserSchema, 
  type InsertUser,
  type User 
} from "../shared/schema";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";

const router = Router();

// Configure Passport Local Strategy
passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!user) {
          return done(null, false, { message: "Invalid email or password" });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return done(null, false, { message: "Invalid email or password" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user: Express.User, done) => {
  done(null, (user as User).id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// ==================== AUTH ROUTES ====================

// Register a new user
router.post("/api/register", async (req: Request, res: Response) => {
  try {
    const validatedData = insertUserSchema.parse(req.body);
    
    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1);

    if (existingUser) {
      return res.status(400).json({ 
        error: "User with this email already exists" 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Insert new user
    const [newUser] = await db
      .insert(users)
      .values({
        ...validatedData,
        password: hashedPassword,
      })
      .returning();

    // Log the user in after registration
    req.login(newUser, (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to log in after registration" });
      }
      
      // Don't send password back to client
      const { password: _, ...userWithoutPassword } = newUser;
      return res.status(201).json(userWithoutPassword);
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return res.status(400).json({ 
      error: error.message || "Registration failed" 
    });
  }
});

// Login
router.post("/api/login", (req: Request, res: Response, next) => {
  passport.authenticate("local", (err: any, user: User | false, info: any) => {
    if (err) {
      return res.status(500).json({ error: "Authentication error" });
    }
    
    if (!user) {
      return res.status(401).json({ 
        error: info?.message || "Invalid credentials" 
      });
    }

    req.login(user, (loginErr) => {
      if (loginErr) {
        return res.status(500).json({ error: "Login failed" });
      }
      
      // Don't send password back to client
      const { password: _, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    });
  })(req, res, next);
});

// Logout
router.post("/api/logout", (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.json({ message: "Logged out successfully" });
  });
});

// Get current user
router.get("/api/user", (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  
  const { password: _, ...userWithoutPassword } = req.user as User;
  res.json(userWithoutPassword);
});

// ==================== SOS SIGNALS ROUTES ====================

// Create a new SOS signal
router.post("/api/sos", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userId = (req.user as User).id;
    
    const [newSosSignal] = await db
      .insert(sosSignals)
      .values({
        userId,
        location: {
          latitude: req.body.latitude,
          longitude: req.body.longitude,
        },
        severity: req.body.severity || "high",
        description: req.body.message,
        status: "active",
      })
      .returning();

    res.status(201).json(newSosSignal);
  } catch (error: any) {
    console.error("SOS creation error:", error);
    res.status(400).json({ 
      error: error.message || "Failed to create SOS signal" 
    });
  }
});

// Get all SOS signals (for soldiers)
router.get("/api/sos", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userRole = (req.user as User).role;
    
    // Only government officials can view all SOS signals
    if (userRole !== "government") {
      return res.status(403).json({ 
        error: "Access denied. Only government officials can view all SOS signals" 
      });
    }

    const allSosSignals = await db
      .select()
      .from(sosSignals)
      .orderBy(desc(sosSignals.createdAt));

    res.json(allSosSignals);
  } catch (error: any) {
    console.error("SOS fetch error:", error);
    res.status(500).json({ 
      error: error.message || "Failed to fetch SOS signals" 
    });
  }
});

// Get SOS signals for current user
router.get("/api/sos/my-signals", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userId = (req.user as User).id;

    const userSosSignals = await db
      .select()
      .from(sosSignals)
      .where(eq(sosSignals.userId, userId))
      .orderBy(desc(sosSignals.createdAt));

    res.json(userSosSignals);
  } catch (error: any) {
    console.error("User SOS fetch error:", error);
    res.status(500).json({ 
      error: error.message || "Failed to fetch your SOS signals" 
    });
  }
});

// Update SOS signal status
router.patch("/api/sos/:id", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const sosId = req.params.id;
    const { status } = req.body;

    if (!["active", "resolved", "cancelled"].includes(status)) {
      return res.status(400).json({ 
        error: "Invalid status. Must be 'active', 'resolved', or 'cancelled'" 
      });
    }

    const [updatedSos] = await db
      .update(sosSignals)
      .set({ status })
      .where(eq(sosSignals.id, sosId))
      .returning();

    if (!updatedSos) {
      return res.status(404).json({ error: "SOS signal not found" });
    }

    res.json(updatedSos);
  } catch (error: any) {
    console.error("SOS update error:", error);
    res.status(400).json({ 
      error: error.message || "Failed to update SOS signal" 
    });
  }
});

// ==================== MESSAGES ROUTES ====================

// Get all messages for current user
router.get("/api/messages", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userId = (req.user as User).id;

    // Get messages where user is sender or recipient
    const userMessages = await db
      .select()
      .from(messages)
      .where(
        eq(messages.senderId, userId)
      )
      .orderBy(desc(messages.timestamp));

    res.json(userMessages);
  } catch (error: any) {
    console.error("Messages fetch error:", error);
    res.status(500).json({ 
      error: error.message || "Failed to fetch messages" 
    });
  }
});

// Send a new message
router.post("/api/messages", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const senderId = (req.user as User).id;
    const { recipientId, content } = req.body;

    if (!recipientId || !content) {
      return res.status(400).json({ 
        error: "recipientId and content are required" 
      });
    }

    const [newMessage] = await db
      .insert(messages)
      .values({
        senderId,
        recipientId,
        content,
        type: "direct",
      })
      .returning();

    res.status(201).json(newMessage);
  } catch (error: any) {
    console.error("Message send error:", error);
    res.status(400).json({ 
      error: error.message || "Failed to send message" 
    });
  }
});

// Get conversation between current user and another user
router.get("/api/messages/conversation/:userId", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const currentUserId = (req.user as User).id;
    const otherUserId = req.params.userId;

    // This would need a more complex query in production
    // For now, return all messages involving both users
    const conversation = await db
      .select()
      .from(messages)
      .orderBy(desc(messages.timestamp));

    // Filter in memory (in production, use SQL OR conditions)
    const filteredConversation = conversation.filter(
      (msg: typeof messages.$inferSelect) =>
        (msg.senderId === currentUserId && msg.recipientId === otherUserId) ||
        (msg.senderId === otherUserId && msg.recipientId === currentUserId)
    );

    res.json(filteredConversation);
  } catch (error: any) {
    console.error("Conversation fetch error:", error);
    res.status(500).json({ 
      error: error.message || "Failed to fetch conversation" 
    });
  }
});

// ==================== EVACUATION ZONES ROUTES ====================

// Get all evacuation zones
router.get("/api/zones", async (req: Request, res: Response) => {
  try {
    const zones = await db
      .select()
      .from(evacuationZones)
      .orderBy(desc(evacuationZones.timestamp));

    res.json(zones);
  } catch (error: any) {
    console.error("Zones fetch error:", error);
    res.status(500).json({ 
      error: error.message || "Failed to fetch zones" 
    });
  }
});

// Get nearest zone
router.get("/api/zones/nearest", async (req: Request, res: Response) => {
  try {
    const { lat, lon, type } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: "Latitude and longitude required" });
    }

    const userLat = parseFloat(lat as string);
    const userLon = parseFloat(lon as string);

    let zonesQuery = db.select().from(evacuationZones);
    
    if (type && type !== "all") {
      zonesQuery = zonesQuery.where(eq(evacuationZones.type, type as string));
    }

    const allZones = await zonesQuery;

    if (allZones.length === 0) {
      return res.status(404).json({ error: "No zones found" });
    }

    // Calculate distances and find nearest
    const zonesWithDistance = allZones.map((zone: any) => {
      const lat1 = userLat * (Math.PI / 180);
      const lat2 = zone.location.latitude * (Math.PI / 180);
      const deltaLat = (zone.location.latitude - userLat) * (Math.PI / 180);
      const deltaLon = (zone.location.longitude - userLon) * (Math.PI / 180);

      const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) *
          Math.cos(lat2) *
          Math.sin(deltaLon / 2) *
          Math.sin(deltaLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = 6371 * c; // Earth's radius in km

      return { ...zone, distance };
    });

    const nearest = zonesWithDistance.reduce((prev: any, curr: any) =>
      prev.distance < curr.distance ? prev : curr
    );

    res.json(nearest);
  } catch (error: any) {
    console.error("Nearest zone error:", error);
    res.status(500).json({ 
      error: error.message || "Failed to find nearest zone" 
    });
  }
});

// Create a new evacuation zone
router.post("/api/zones", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userId = (req.user as User).id;
    const { name, type, latitude, longitude, capacity, description } = req.body;

    if (!name || !type || latitude === undefined || longitude === undefined || !capacity) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [newZone] = await db
      .insert(evacuationZones)
      .values({
        name,
        type,
        location: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        },
        capacity: parseInt(capacity),
        currentOccupancy: 0,
        status: "active",
        description: description || "",
        createdBy: userId,
      })
      .returning();

    res.status(201).json(newZone);
  } catch (error: any) {
    console.error("Zone creation error:", error);
    res.status(400).json({ 
      error: error.message || "Failed to create zone" 
    });
  }
});

// Update an evacuation zone
router.put("/api/zones/:id", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { id } = req.params;
    const updates = req.body;

    // Handle location updates
    if (updates.latitude !== undefined || updates.longitude !== undefined) {
      const [zone] = await db
        .select()
        .from(evacuationZones)
        .where(eq(evacuationZones.id, id))
        .limit(1);

      if (!zone) {
        return res.status(404).json({ error: "Zone not found" });
      }

      updates.location = {
        latitude: updates.latitude ?? zone.location.latitude,
        longitude: updates.longitude ?? zone.location.longitude,
      };
      delete updates.latitude;
      delete updates.longitude;
    }

    const [updatedZone] = await db
      .update(evacuationZones)
      .set(updates)
      .where(eq(evacuationZones.id, id))
      .returning();

    if (!updatedZone) {
      return res.status(404).json({ error: "Zone not found" });
    }

    res.json(updatedZone);
  } catch (error: any) {
    console.error("Zone update error:", error);
    res.status(400).json({ 
      error: error.message || "Failed to update zone" 
    });
  }
});

// Delete an evacuation zone
router.delete("/api/zones/:id", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { id } = req.params;

    const result = await db
      .delete(evacuationZones)
      .where(eq(evacuationZones.id, id))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: "Zone not found" });
    }

    res.json({ message: "Zone deleted successfully" });
  } catch (error: any) {
    console.error("Zone deletion error:", error);
    res.status(400).json({ 
      error: error.message || "Failed to delete zone" 
    });
  }
});

// Health check endpoint
router.get("/api/health", (req: Request, res: Response) => {
  res.json({ 
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: process.env.PORT
  });
});

export async function registerRoutes(app: any) {
  const http = await import("http");
  const server = http.createServer(app);
  
  app.use(router);
  
  return server;
}

export default router;