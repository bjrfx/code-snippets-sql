import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "mysql",
  dbCredentials: {
    host: "sv63.ifastnet12.org",
    user: "masakali_kiran",
    password: "K143iran",
    database: "masakali_code_snippets",
    port: 3306,
  },
});
