-- ============================================
-- ArduinoHub - Supabase Seed Script
-- Chạy trong: Supabase Dashboard → SQL Editor
-- ============================================

-- 1. Tạo enum types
DO $$ BEGIN
  CREATE TYPE "UserRole" AS ENUM ('USER', 'MODERATOR', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "BoardType" AS ENUM ('UNO', 'MEGA', 'NANO', 'ESP32', 'ESP8266', 'LEONARDO', 'DUE', 'OTHER');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "Difficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "ProjectStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "TagCategory" AS ENUM ('SENSOR', 'MOTOR', 'IOT', 'DISPLAY', 'COMMUNICATION', 'POWER', 'INPUT', 'LED', 'AUDIO', 'OTHER');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 2. Tạo bảng
CREATE TABLE IF NOT EXISTS "users" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "username" TEXT UNIQUE NOT NULL,
  "email" TEXT UNIQUE NOT NULL,
  "emailVerified" TIMESTAMPTZ,
  "passwordHash" TEXT,
  "avatarUrl" TEXT,
  "reputation" INTEGER NOT NULL DEFAULT 0,
  "role" "UserRole" NOT NULL DEFAULT 'USER',
  "isBanned" BOOLEAN NOT NULL DEFAULT false,
  "banReason" TEXT,
  "bannedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "accounts" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  UNIQUE("provider", "providerAccountId")
);

CREATE TABLE IF NOT EXISTS "sessions" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "sessionToken" TEXT UNIQUE NOT NULL,
  "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "expires" TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS "verification_tokens" (
  "identifier" TEXT NOT NULL,
  "token" TEXT UNIQUE NOT NULL,
  "expires" TIMESTAMPTZ NOT NULL,
  UNIQUE("identifier", "token")
);

CREATE TABLE IF NOT EXISTS "projects" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "description" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "boardType" "BoardType" NOT NULL,
  "difficulty" "Difficulty" NOT NULL,
  "hardwareRequirements" TEXT NOT NULL,
  "usageGuide" TEXT NOT NULL,
  "wiringDiagramUrl" TEXT,
  "status" "ProjectStatus" NOT NULL DEFAULT 'PENDING',
  "upvotes" INTEGER NOT NULL DEFAULT 0,
  "viewCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "tags" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "name" TEXT UNIQUE NOT NULL,
  "category" "TagCategory" NOT NULL DEFAULT 'OTHER'
);

CREATE TABLE IF NOT EXISTS "project_tags" (
  "projectId" TEXT NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "tagId" TEXT NOT NULL REFERENCES "tags"("id") ON DELETE CASCADE,
  PRIMARY KEY("projectId", "tagId")
);

CREATE TABLE IF NOT EXISTS "project_errors" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "projectId" TEXT NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "errorMessage" TEXT NOT NULL,
  "cause" TEXT NOT NULL,
  "fix" TEXT NOT NULL,
  "codeSnippet" TEXT,
  "upvotes" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "comments" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "projectId" TEXT NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "project_versions" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "projectId" TEXT NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "code" TEXT NOT NULL,
  "changelog" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "upvotes" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "projectId" TEXT REFERENCES "projects"("id") ON DELETE CASCADE,
  "errorId" TEXT REFERENCES "project_errors"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE("userId", "projectId"),
  UNIQUE("userId", "errorId")
);

CREATE TABLE IF NOT EXISTS "badges" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "name" TEXT UNIQUE NOT NULL,
  "description" TEXT NOT NULL,
  "icon" TEXT NOT NULL,
  "criteria" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "user_badges" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "badgeId" TEXT NOT NULL REFERENCES "badges"("id") ON DELETE CASCADE,
  "earnedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE("userId", "badgeId")
);

CREATE TABLE IF NOT EXISTS "reports" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "reporterId" TEXT NOT NULL,
  "projectId" TEXT,
  "commentId" TEXT,
  "reason" TEXT NOT NULL,
  "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON "projects"("userId");
CREATE INDEX IF NOT EXISTS idx_projects_status ON "projects"("status");
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON "projects"("createdAt");
CREATE INDEX IF NOT EXISTS idx_projects_upvotes ON "projects"("upvotes");
CREATE INDEX IF NOT EXISTS idx_project_errors_project_id ON "project_errors"("projectId");
CREATE INDEX IF NOT EXISTS idx_project_errors_upvotes ON "project_errors"("upvotes");
CREATE INDEX IF NOT EXISTS idx_comments_project_id ON "comments"("projectId");
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON "comments"("createdAt");
CREATE INDEX IF NOT EXISTS idx_project_versions_project_id ON "project_versions"("projectId");
CREATE INDEX IF NOT EXISTS idx_reports_status ON "reports"("status");

-- ============================================
-- SEED DATA
-- ============================================

-- Xóa dữ liệu cũ (nếu có)
TRUNCATE TABLE project_tags, comments, project_errors, project_versions, upvotes, user_badges, reports, projects, tags, badges, accounts, sessions, "users" CASCADE;

-- 4. Seed Users (có passwordHash để đăng nhập được)
-- Mật khẩu: password123 (cho cả 3 tài khoản)
-- Hash: $2b$12$2g632oWKqYY7cTSEUat4OOhHI/ztmG/qOrLqYOrI2od.PT47.xHFy
INSERT INTO "users" ("id", "username", "email", "passwordHash", "reputation", "role", "isBanned")
VALUES
  ('u1', 'arduino_vn', 'arduino_vn@gmail.com', '$2b$12$2g632oWKqYY7cTSEUat4OOhHI/ztmG/qOrLqYOrI2od.PT47.xHFy', 120, 'ADMIN', false),
  ('u2', 'maker_hcm', 'maker_hcm@gmail.com', '$2b$12$2g632oWKqYY7cTSEUat4OOhHI/ztmG/qOrLqYOrI2od.PT47.xHFy', 85, 'USER', false),
  ('u3', 'esp32_dev', 'esp32_dev@gmail.com', '$2b$12$2g632oWKqYY7cTSEUat4OOhHI/ztmG/qOrLqYOrI2od.PT47.xHFy', 200, 'MODERATOR', false),
  ('u4', 'ddos_kid_69', 'spam@evil.com', NULL, 0, 'USER', true);

-- 5. Seed Projects
INSERT INTO "projects" ("id", "userId", "title", "slug", "description", "code", "boardType", "difficulty", "hardwareRequirements", "usageGuide", "status", "upvotes")
VALUES
(
  'p1', 'u1',
  'Cảm biến nhiệt độ DHT11 hiển thị LCD',
  'cam-bien-nhiet-do-dht11-hien-thi-lcd',
  'Đọc nhiệt độ và độ ẩm từ DHT11, hiển thị lên màn hình LCD 16x2 qua I2C.',
  '#include <DHT.h>
#include <LiquidCrystal_I2C.h>

#define DHTPIN 2
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  dht.begin();
  lcd.init();
  lcd.backlight();
}

void loop() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if (isnan(h) || isnan(t)) {
    lcd.setCursor(0, 0);
    lcd.print("Loi cam bien!");
    return;
  }

  lcd.setCursor(0, 0);
  lcd.print("Nhiet do: ");
  lcd.print(t);
  lcd.print("C");

  lcd.setCursor(0, 1);
  lcd.print("Do am:    ");
  lcd.print(h);
  lcd.print("%");

  delay(2000);
}',
  'UNO', 'BEGINNER',
  'Arduino UNO, DHT11, LCD 16x2 I2C (dia chi 0x27), day jumper',
  '1. Cai thu vien DHT va LiquidCrystal_I2C trong Arduino IDE
2. Noi DHT11: VCC->5V, GND->GND, DATA->Pin 2
3. Noi LCD I2C: VCC->5V, GND->GND, SDA->A4, SCL->A5
4. Upload code
5. Mo Serial Monitor neu muon debug',
  'APPROVED', 12
),
(
  'p2', 'u2',
  'Dieu khien LED bang nut bam',
  'dieuh-khien-led-bang-nut-bam',
  'Bat tat LED bang nut bam, co debounce chong rung.',
  '#define LED_PIN 13
#define BTN_PIN 2

bool ledState = false;
bool lastBtnState = HIGH;
unsigned long lastDebounce = 0;
const unsigned long DEBOUNCE_DELAY = 50;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  pinMode(BTN_PIN, INPUT_PULLUP);
}

void loop() {
  bool reading = digitalRead(BTN_PIN);

  if (reading != lastBtnState) {
    lastDebounce = millis();
  }

  if ((millis() - lastDebounce) > DEBOUNCE_DELAY) {
    if (reading == LOW) {
      ledState = !ledState;
      digitalWrite(LED_PIN, ledState);
    }
  }

  lastBtnState = reading;
}',
  'UNO', 'BEGINNER',
  'Arduino UNO, LED, dien tro 220 ohm, nut bam, breadboard',
  '1. Noi LED: chan dai -> Pin 13 qua dien tro 220 ohm, chan ngan -> GND
2. Noi nut bam: mot chan -> Pin 2, chan kia -> GND
3. Upload code
4. Bam nut de toggle LED',
  'APPROVED', 8
),
(
  'p3', 'u3',
  'ESP32 ket noi WiFi gui du lieu len ThingSpeak',
  'esp32-ket-noi-wifi-gui-du-lieu-thingspeak',
  'ESP32 doc nhiet do tu NTC thermistor, gui len ThingSpeak moi 15 giay.',
  '#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "TEN_WIFI";
const char* password = "MAT_KHAU_WIFI";
const char* apiKey = "THINGSPEAK_API_KEY";
const char* server = "http://api.thingspeak.com";

#define THERMISTOR_PIN 34
#define NOMINAL_RESISTANCE 10000
#define NOMINAL_TEMPERATURE 25
#define B_COEFFICIENT 3950
#define SERIES_RESISTOR 10000

float readTemperature() {
  int raw = analogRead(THERMISTOR_PIN);
  float resistance = SERIES_RESISTOR / (4095.0 / raw - 1.0);
  float steinhart = resistance / NOMINAL_RESISTANCE;
  steinhart = log(steinhart);
  steinhart /= B_COEFFICIENT;
  steinhart += 1.0 / (NOMINAL_TEMPERATURE + 273.15);
  steinhart = 1.0 / steinhart;
  return steinhart - 273.15;
}

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    float temp = readTemperature();
    String url = String(server) + "/update?api_key=" + apiKey + "&field1=" + String(temp);
    http.begin(url);
    int code = http.GET();
    Serial.printf("Temp: %.2f C | HTTP: %d\n", temp, code);
    http.end();
  }
  delay(15000);
}',
  'ESP32', 'INTERMEDIATE',
  'ESP32 DevKit, NTC Thermistor 10k ohm, dien tro 10k ohm, tai khoan ThingSpeak',
  '1. Tao tai khoan ThingSpeak, tao channel, copy API Key
2. Thay TEN_WIFI, MAT_KHAU_WIFI, THINGSPEAK_API_KEY trong code
3. Noi thermistor: mot chan -> 3.3V, chan kia -> Pin 34 va dien tro 10k ohm xuong GND
4. Upload code
5. Mo Serial Monitor 115200 baud de xem nhiet do va status',
  'APPROVED', 15
);

-- 6. Seed Errors
INSERT INTO "project_errors" ("projectId", "errorMessage", "cause", "fix", "upvotes")
VALUES
('p1', 'Nan values from DHT sensor', 'DHT11 khong doc duoc — thuong do day noi long hoac thieu dien tro pull-up 10k ohm tren DATA pin', 'Kiem tra day DATA, them dien tro 10k ohm tu DATA len VCC. Dung isnan() de bat loi nhu trong code mau.', 5),
('p1', 'LiquidCrystal_I2C no display', 'Dia chi I2C sai — khong phai 0x27 ma la 0x3F tuy module', 'Chay I2C Scanner sketch de tim dia chi dung: Tools -> Examples -> Wire -> i2c_scanner', 8),
('p3', 'WiFi.begin stuck', 'SSID hoac password sai, hoac router 5GHz (ESP32 chi ho tro 2.4GHz)', 'Kiem tra lai credentials, dam bao router dang broadcast 2.4GHz.', 6);

-- 7. Seed Tags
INSERT INTO "tags" ("id", "name", "category")
VALUES
('t1', 'DHT11', 'SENSOR'),
('t2', 'LCD', 'DISPLAY'),
('t3', 'I2C', 'COMMUNICATION'),
('t4', 'LED', 'LED'),
('t5', 'WiFi', 'COMMUNICATION'),
('t6', 'ESP32', 'OTHER'),
('t7', 'ThingSpeak', 'IOT'),
('t8', 'Cảm biến', 'SENSOR');

INSERT INTO "project_tags" ("projectId", "tagId")
VALUES
('p1','t1'),('p1','t2'),('p1','t3'),('p1','t8'),
('p2','t4'),
('p3','t5'),('p3','t6'),('p3','t7'),('p3','t8');

-- ============================================
-- DONE! 
-- Tài khoản đăng nhập:
--   Email: arduino_vn@gmail.com  | Password: password123 (Admin)
--   Email: maker_hcm@gmail.com   | Password: password123 (User)
--   Email: esp32_dev@gmail.com   | Password: password123 (Moderator)
-- ============================================
