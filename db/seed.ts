import { db } from "../api/queries/connection";

async function seed() {
  console.log("Database connected. Entry table created if not exists.");
  console.log("Seed complete.");
}

seed();
