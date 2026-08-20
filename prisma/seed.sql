-- ============================================
-- ArduinoHub - Supabase Seed Script (FULL)
-- DROP + CREATE + SEED
-- Chay trong: Supabase Dashboard -> SQL Editor
-- ============================================

-- ═══ DROP旧 tables ═══
DROP TABLE IF EXISTS project_tags CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS project_errors CASCADE;
DROP TABLE IF EXISTS project_versions CASCADE;
DROP TABLE IF EXISTS upvotes CASCADE;
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS verification_tokens CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ═══ DROP旧 enums ═══
DROP TYPE IF EXISTS "UserRole" CASCADE;
DROP TYPE IF EXISTS "BoardType" CASCADE;
DROP TYPE IF EXISTS "Difficulty" CASCADE;
DROP TYPE IF EXISTS "ProjectStatus" CASCADE;
DROP TYPE IF EXISTS "TagCategory" CASCADE;
DROP TYPE IF EXISTS "ReportStatus" CASCADE;

-- ═══ CREATE enums ═══
CREATE TYPE "UserRole" AS ENUM ('USER', 'MODERATOR', 'ADMIN');
CREATE TYPE "BoardType" AS ENUM ('UNO', 'MEGA', 'NANO', 'ESP32', 'ESP8266', 'LEONARDO', 'DUE', 'OTHER');
CREATE TYPE "Difficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
CREATE TYPE "ProjectStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED');
CREATE TYPE "TagCategory" AS ENUM ('SENSOR', 'MOTOR', 'IOT', 'DISPLAY', 'COMMUNICATION', 'POWER', 'INPUT', 'LED', 'AUDIO', 'OTHER');
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED');

-- ═══ CREATE tables ═══

CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  email_verified TIMESTAMPTZ,
  password_hash TEXT,
  avatar_url TEXT,
  reputation INTEGER NOT NULL DEFAULT 0,
  role "UserRole" NOT NULL DEFAULT 'USER',
  is_banned BOOLEAN NOT NULL DEFAULT false,
  ban_reason TEXT,
  banned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE accounts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  UNIQUE(provider, provider_account_id)
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  session_token TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMPTZ NOT NULL
);

CREATE TABLE verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  UNIQUE(identifier, token)
);

CREATE TABLE projects (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  code TEXT NOT NULL,
  board_type "BoardType" NOT NULL,
  difficulty "Difficulty" NOT NULL,
  hardware_requirements TEXT NOT NULL,
  usage_guide TEXT NOT NULL,
  wiring_diagram_url TEXT,
  status "ProjectStatus" NOT NULL DEFAULT 'PENDING',
  upvotes INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tags (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT UNIQUE NOT NULL,
  category "TagCategory" NOT NULL DEFAULT 'OTHER'
);

CREATE TABLE project_tags (
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY(project_id, tag_id)
);

CREATE TABLE project_errors (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  error_message TEXT NOT NULL,
  cause TEXT NOT NULL,
  fix TEXT NOT NULL,
  code_snippet TEXT,
  upvotes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE comments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE project_versions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  changelog TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE upvotes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  error_id TEXT REFERENCES project_errors(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, project_id),
  UNIQUE(user_id, error_id)
);

CREATE TABLE badges (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  criteria TEXT NOT NULL
);

CREATE TABLE user_badges (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE TABLE reports (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  reporter_id TEXT NOT NULL,
  project_id TEXT,
  comment_id TEXT,
  reason TEXT NOT NULL,
  status "ReportStatus" NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══ Indexes ═══
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at);
CREATE INDEX idx_projects_upvotes ON projects(upvotes);
CREATE INDEX idx_project_errors_project_id ON project_errors(project_id);
CREATE INDEX idx_project_errors_upvotes ON project_errors(upvotes);
CREATE INDEX idx_comments_project_id ON comments(project_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);
CREATE INDEX idx_project_versions_project_id ON project_versions(project_id);
CREATE INDEX idx_reports_status ON reports(status);

-- ============================================
-- SEED DATA
-- ============================================

-- ═══ USERS (password123 cho tat ca) ═══
INSERT INTO users (id, username, email, password_hash, reputation, role, is_banned)
VALUES
  ('u1', 'arduino_vn', 'arduino_vn@gmail.com', '$2b$12$2g632oWKqYY7cTSEUat4OOhHI/ztmG/qOrLqYOrI2od.PT47.xHFy', 120, 'ADMIN', false),
  ('u2', 'maker_hcm', 'maker_hcm@gmail.com', '$2b$12$2g632oWKqYY7cTSEUat4OOhHI/ztmG/qOrLqYOrI2od.PT47.xHFy', 85, 'USER', false),
  ('u3', 'esp32_dev', 'esp32_dev@gmail.com', '$2b$12$2g632oWKqYY7cTSEUat4OOhHI/ztmG/qOrLqYOrI2od.PT47.xHFy', 200, 'MODERATOR', false),
  ('u4', 'iot_hanoi', 'iot_hanoi@gmail.com', '$2b$12$2g632oWKqYY7cTSEUat4OOhHI/ztmG/qOrLqYOrI2od.PT47.xHFy', 150, 'USER', false),
  ('u5', 'robot_fan', 'robot_fan@gmail.com', '$2b$12$2g632oWKqYY7cTSEUat4OOhHI/ztmG/qOrLqYOrI2od.PT47.xHFy', 75, 'USER', false),
  ('u6', 'ddos_kid_69', 'spam@evil.com', NULL, 0, 'USER', true);

-- ═══ PROJECT 1: DHT11 + LCD ═══
INSERT INTO projects (id, user_id, title, slug, description, code, board_type, difficulty, hardware_requirements, usage_guide, status, upvotes)
VALUES ('p1', 'u1', 'Cam bien nhiet do DHT11 hien thi LCD 16x2',
'cam-bien-nhiet-do-dht11-hien-thi-lcd',
'Doc nhiet do va do am tu DHT11, hien thi len man hinh LCD 16x2 qua I2C.',
'#include <DHT.h>
#include <LiquidCrystal_I2C.h>

#define DHTPIN 2
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  Serial.begin(9600);
  dht.begin();
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("ArduinoHub!");
  delay(2000);
  lcd.clear();
}

void loop() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if (isnan(h) || isnan(t)) {
    lcd.setCursor(0, 0);
    lcd.print("Loi cam bien!    ");
    lcd.setCursor(0, 1);
    lcd.print("Kiem tra day noi ");
    return;
  }

  lcd.setCursor(0, 0);
  lcd.print("Nhiet do: ");
  lcd.print(t, 1);
  lcd.print(" C  ");

  lcd.setCursor(0, 1);
  lcd.print("Do am:    ");
  lcd.print(h, 1);
  lcd.print(" %  ");

  Serial.print("T=");
  Serial.print(t);
  Serial.print("C  H=");
  Serial.print(h);
  Serial.println("%");

  delay(2000);
}',
'UNO', 'BEGINNER',
'Arduino UNO, DHT11, LCD 16x2 I2C (dia chi 0x27), day jumper',
'1. Cai thu vien DHT va LiquidCrystal_I2C trong Arduino IDE
2. Noi DHT11: VCC->5V, GND->GND, DATA->Pin 2
3. Noi LCD I2C: VCC->5V, GND->GND, SDA->A4, SCL->A5
4. Upload code, mo Serial Monitor 9600 baud de debug',
'APPROVED', 24);

-- ═══ PROJECT 2: Robot tranh chap ═══
INSERT INTO projects (id, user_id, title, slug, description, code, board_type, difficulty, hardware_requirements, usage_guide, status, upvotes)
VALUES ('p2', 'u2', 'Robot tranh chuong ngai vat HC-SR04 + L298N',
'robot-tranh-chuong-ngai-vat',
'Robot 2 banh tu dong tranh chuong ngai vat bang cam bien sieu am, dieu khien dong co DC qua L298N.',
'#define TRIG_PIN 9
#define ECHO_PIN 10
#define MOTOR_L_F 5
#define MOTOR_L_B 6
#define MOTOR_R_F 3
#define MOTOR_R_B 11
#define SPEED 180

long measureDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long duration = pulseIn(ECHO_PIN, HIGH, 30000);
  return duration * 0.034 / 2;
}

void goForward() {
  analogWrite(MOTOR_L_F, SPEED);
  digitalWrite(MOTOR_L_B, LOW);
  analogWrite(MOTOR_R_F, SPEED);
  digitalWrite(MOTOR_R_B, LOW);
}

void stopMotors() {
  digitalWrite(MOTOR_L_F, LOW);
  digitalWrite(MOTOR_L_B, LOW);
  digitalWrite(MOTOR_R_F, LOW);
  digitalWrite(MOTOR_R_B, LOW);
}

void turnRight() {
  analogWrite(MOTOR_L_F, SPEED);
  digitalWrite(MOTOR_L_B, LOW);
  digitalWrite(MOTOR_R_F, LOW);
  analogWrite(MOTOR_R_B, SPEED);
}

void goBackward() {
  digitalWrite(MOTOR_L_F, LOW);
  analogWrite(MOTOR_L_B, SPEED);
  digitalWrite(MOTOR_R_F, LOW);
  analogWrite(MOTOR_R_B, SPEED);
}

void turnLeft() {
  digitalWrite(MOTOR_L_F, LOW);
  analogWrite(MOTOR_L_B, SPEED);
  analogWrite(MOTOR_R_F, SPEED);
  digitalWrite(MOTOR_R_B, LOW);
}

void setup() {
  Serial.begin(9600);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(MOTOR_L_F, OUTPUT);
  pinMode(MOTOR_L_B, OUTPUT);
  pinMode(MOTOR_R_F, OUTPUT);
  pinMode(MOTOR_R_B, OUTPUT);
}

void loop() {
  long dist = measureDistance();
  Serial.print("Distance: ");
  Serial.print(dist);
  Serial.println(" cm");

  if (dist > 30) {
    goForward();
  } else if (dist > 10) {
    stopMotors();
    delay(200);
    turnRight();
    delay(400);
  } else {
    stopMotors();
    delay(200);
    goBackward();
    delay(500);
    turnLeft();
    delay(600);
  }
  delay(50);
}',
'UNO', 'INTERMEDIATE',
'Arduino UNO, 2 dong co DC, L298N driver, HC-SR04, nguon 7.4V',
'1. Noi dong co qua L298N: OUT1/OUT2 -> dong co trai, OUT3/OUT4 -> dong co phai
2. Noi HC-SR04: Trig->Pin9, Echo->Pin10
3. Noi L298N: IN1->Pin5, IN2->Pin6, IN3->Pin3, IN4->Pin11
4. Cap nguon 7.4V vao L298N
5. Upload code, thu nguoc chuong ngai vat',
'APPROVED', 31);

-- ═══ PROJECT 3: ESP32 ThingSpeak ═══
INSERT INTO projects (id, user_id, title, slug, description, code, board_type, difficulty, hardware_requirements, usage_guide, status, upvotes)
VALUES ('p3', 'u3', 'ESP32 gui nhiet do len ThingSpeak',
'esp32-gui-nhiet-do-thingspeak',
'ESP32 doc NTC thermistor, tinh nhiet do, gui len ThingSpeak cloud moi 15 giay.',
'#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "TEN_WIFI";
const char* password = "MAT_KHAU";
const char* apiKey = "THING_SPEAK_KEY";

#define THERMISTOR_PIN 34
#define NOMINAL_R 10000
#define NOMINAL_T 25
#define B_COEFF 3950
#define SERIES_R 10000

float readTemp() {
  int raw = analogRead(THERMISTOR_PIN);
  float resistance = SERIES_R / (4095.0 / raw - 1.0);
  float steinhart = resistance / NOMINAL_R;
  steinhart = log(steinhart);
  steinhart /= B_COEFF;
  steinhart += 1.0 / (NOMINAL_T + 273.15);
  steinhart = 1.0 / steinhart;
  return steinhart - 273.15;
}

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  Serial.print("Dang ket noi WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected!");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    float temp = readTemp();
    String url = "http://api.thingspeak.com/update?api_key=";
    url += apiKey;
    url += "&field1=";
    url += String(temp, 2);

    HTTPClient http;
    http.begin(url);
    int httpCode = http.GET();
    Serial.print("Temp: ");
    Serial.print(temp, 2);
    Serial.print(" C | HTTP: ");
    Serial.println(httpCode);
    http.end();
  }
  delay(15000);
}',
'ESP32', 'INTERMEDIATE',
'ESP32 DevKit V1, NTC Thermistor 10K, dien tro 10K, tai khoan ThingSpeak',
'1. Tao tai khoan ThingSpeak, tao Channel, copy API Key
2. Thay TEN_WIFI, MAT_KHAU, THING_SPEAK_KEY trong code
3. Noi NTC: 3.3V -> NTC -> Pin34 va DienTro 10K -> GND
4. Upload code, xem Serial Monitor 115200 baud',
'APPROVED', 28);

-- ═══ PROJECT 4: LED RGB 7 mau ═══
INSERT INTO projects (id, user_id, title, slug, description, code, board_type, difficulty, hardware_requirements, usage_guide, status, upvotes)
VALUES ('p4', 'u4', 'Dieu khien LED RGB 7 mau PWM',
'dieu-khien-led-rgb-7-mau',
'Dieu kien mau sac LED RGB qua 3 chan PWM, tu dong doi mau moi 1 giay.',
'#define RED_PIN 9
#define GREEN_PIN 10
#define BLUE_PIN 11

int colors[][3] = {
  {255, 0, 0}, {0, 255, 0}, {0, 0, 255},
  {255, 255, 0}, {255, 0, 255}, {0, 255, 255}, {255, 255, 255}
};

const char* colorNames[] = {"DO", "XANH LA", "XANH DUONG", "VANG", "TIM", "CYAN", "TRANG"};

void setColor(int r, int g, int b) {
  analogWrite(RED_PIN, r);
  analogWrite(GREEN_PIN, g);
  analogWrite(BLUE_PIN, b);
}

void setup() {
  Serial.begin(9600);
  pinMode(RED_PIN, OUTPUT);
  pinMode(GREEN_PIN, OUTPUT);
  pinMode(BLUE_PIN, OUTPUT);
  Serial.println("LED RGB - 7 mau");
}

void loop() {
  for (int i = 0; i < 7; i++) {
    setColor(colors[i][0], colors[i][1], colors[i][2]);
    Serial.print("Mau: ");
    Serial.println(colorNames[i]);
    delay(1000);
  }
}',
'UNO', 'BEGINNER',
'Arduino UNO, LED RGB, 3 dien tro 220 ohm, breadboard',
'1. Noi LED RGB: Red->Pin9, Green->Pin10, Blue->Pin11 qua dien tro 220 ohm
2. Noi GND chung xuong GND
3. Upload code, LED se tu dong doi mau',
'APPROVED', 18);

-- ═══ PROJECT 5: BH1750 ═══
INSERT INTO projects (id, user_id, title, slug, description, code, board_type, difficulty, hardware_requirements, usage_guide, status, upvotes)
VALUES ('p5', 'u1', 'Doc cuong do anh sang BH1750',
'doc-cuong-do-anh-sang-bh1750',
'Doc gia tri cuong do anh sang tu sensor BH1750 qua I2C.',
'#include <Wire.h>
#include <BH1750.h>

BH1750 lightMeter;

void setup() {
  Serial.begin(9600);
  Wire.begin();
  if (lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE)) {
    Serial.println("BH1750 san sang!");
  } else {
    Serial.println("Loi khoi tao BH1750!");
    while (1) delay(1000);
  }
}

void loop() {
  float lux = lightMeter.readLightLevel();
  Serial.print("Lux: ");
  Serial.print(lux);

  if (lux < 10) Serial.println(" - Toi");
  else if (lux < 50) Serial.println(" - Am u");
  else if (lux < 200) Serial.println(" - Binh thuong");
  else if (lux < 500) Serial.println(" - Sang");
  else Serial.println(" - Rat sang!");

  delay(1000);
}',
'UNO', 'BEGINNER',
'Arduino UNO, BH1750 sensor, 4 day jumper',
'1. Noi BH1750: VCC->5V, GND->GND, SDA->A4, SCL->A5
2. Upload code, mo Serial Monitor 9600 baud',
'APPROVED', 15);

-- ═══ PROJECT 6: Servo SG90 ═══
INSERT INTO projects (id, user_id, title, slug, description, code, board_type, difficulty, hardware_requirements, usage_guide, status, upvotes)
VALUES ('p6', 'u5', 'Dieu khien Servo SG90 quay 180 do',
'dieu-khien-servo-sg90',
'Servo SG90 quay tu 0 den 180 do roi quay lai.',
'#include <Servo.h>

Servo myServo;

void setup() {
  Serial.begin(9600);
  myServo.attach(9);
  myServo.write(0);
  delay(500);
}

void loop() {
  for (int pos = 0; pos <= 180; pos += 5) {
    myServo.write(pos);
    delay(30);
  }
  delay(500);
  for (int pos = 180; pos >= 0; pos -= 5) {
    myServo.write(pos);
    delay(30);
  }
  delay(500);
}',
'UNO', 'BEGINNER',
'Arduino UNO, Servo SG90, day jumper',
'1. Noi Servo: Signal->Pin9, VCC(5V), GND
2. Upload code, servo se quay tu 0 den 180 roi quay lai',
'APPROVED', 12);

-- ═══ PROJECT 7: ESP8266 Web LED ═══
INSERT INTO projects (id, user_id, title, slug, description, code, board_type, difficulty, hardware_requirements, usage_guide, status, upvotes)
VALUES ('p7', 'u4', 'Dieu khien LED qua WiFi ESP8266',
'dieu-khien-led-qua-wifi-esp8266',
'Dieu khien 2 LED tu trinh duyet web qua WiFi voi ESP8266 NodeMCU.',
'#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

const char* ssid = "TEN_WIFI";
const char* password = "MAT_KHAU";

#define LED1 5
#define LED2 4

ESP8266WebServer server(80);

String getHTML() {
  String html = "<!DOCTYPE html><html><head>";
  html += "<meta name='viewport' content='width=device-width,initial-scale=1'>";
  html += "<title>LED Control</title>";
  html += "<style>body{font-family:Arial;text-align:center;background:#1a1a2e;color:white;padding:20px;}";
  html += "h1{color:#00979D;}button{padding:15px 30px;margin:10px;font-size:18px;border:none;border-radius:8px;cursor:pointer;}";
  html += ".on{background:#00979D;color:white;}.off{background:#e74c3c;color:white;}</style></head><body>";
  html += "<h1>ArduinoHub LED Control</h1>";
  html += "<p>LED1 (D1)</p>";
  html += "<a href='/led1/on'><button class='on'>BAT</button></a>";
  html += "<a href='/led1/off'><button class='off'>TAT</button></a>";
  html += "<p>LED2 (D2)</p>";
  html += "<a href='/led2/on'><button class='on'>BAT</button></a>";
  html += "<a href='/led2/off'><button class='off'>TAT</button></a>";
  html += "</body></html>";
  return html;
}

void handleRoot() { server.send(200, "text/html", getHTML()); }
void handleLed1On()  { digitalWrite(LED1, HIGH); server.sendHeader("Location", "/"); server.send(302); }
void handleLed1Off() { digitalWrite(LED1, LOW);  server.sendHeader("Location", "/"); server.send(302); }
void handleLed2On()  { digitalWrite(LED2, HIGH); server.sendHeader("Location", "/"); server.send(302); }
void handleLed2Off() { digitalWrite(LED2, LOW);  server.sendHeader("Location", "/"); server.send(302); }

void setup() {
  Serial.begin(115200);
  pinMode(LED1, OUTPUT);
  pinMode(LED2, OUTPUT);
  WiFi.begin(ssid, password);
  Serial.print("Dang ket noi WiFi");
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.print("\nMo truy cap: http://");
  Serial.println(WiFi.localIP());
  server.on("/", handleRoot);
  server.on("/led1/on", handleLed1On);
  server.on("/led1/off", handleLed1Off);
  server.on("/led2/on", handleLed2On);
  server.on("/led2/off", handleLed2Off);
  server.begin();
}

void loop() {
  server.handleClient();
}',
'ESP8266', 'INTERMEDIATE',
'NodeMCU ESP8266, 2 LED, 2 dien tro 220 ohm',
'1. Noi LED: Anode -> D1 va D2 qua dien tro 220 ohm, Cathode -> GND
2. Thay TEN_WIFI va MAT_KHAU
3. Upload code, xem IP tren Serial Monitor
4. Mo trinh duyet, nhap IP vao',
'APPROVED', 22);

-- ═══ PROJECT 8: HC-SR04 ═══
INSERT INTO projects (id, user_id, title, slug, description, code, board_type, difficulty, hardware_requirements, usage_guide, status, upvotes)
VALUES ('p8', 'u3', 'Do khoang cach HC-SR04',
'do-khoang-cach-hc-sr04',
'Do khoang cach bang cam bien sieu am HC-SR04.',
'#define TRIG 9
#define ECHO 10

void setup() {
  Serial.begin(9600);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  Serial.println("HC-SR04 Distance Meter");
}

float measureCM() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long duration = pulseIn(ECHO, HIGH, 30000);
  if (duration == 0) return -1;
  return duration * 0.034 / 2.0;
}

void loop() {
  float cm = measureCM();
  if (cm < 0) {
    Serial.println("Khong nhan duoc tin hieu!");
  } else {
    Serial.print("Khoang cach: ");
    Serial.print(cm, 1);
    Serial.print(" cm | ");
    Serial.print(cm / 2.54, 1);
    Serial.println(" inch");
  }
  delay(500);
}',
'UNO', 'BEGINNER',
'Arduino UNO, HC-SR04, 2 day jumper',
'1. Noi HC-SR04: Trig->Pin9, Echo->Pin10, VCC->5V, GND->GND
2. Upload code, mo Serial Monitor 9600 baud',
'APPROVED', 20);

-- ═══ PROJECT 9: EEPROM ═══
INSERT INTO projects (id, user_id, title, slug, description, code, board_type, difficulty, hardware_requirements, usage_guide, status, upvotes)
VALUES ('p9', 'u5', 'Luu so lan nhan nut vao EEPROM',
'luu-so-lan-nhan-nut-eeprom',
'Dem so lan nhan nut bam, luu vao EEPROM de giu nguyen khi tat nguon.',
'#include <EEPROM.h>

#define BTN_PIN 2
#define LED_PIN 13

int pressCount = 0;
bool lastBtnState = HIGH;
unsigned long lastDebounce = 0;

void setup() {
  Serial.begin(9600);
  pinMode(BTN_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
  pressCount = EEPROM.read(0);
  if (pressCount == 255) pressCount = 0;
  Serial.print("So lan nhan truoc do: ");
  Serial.println(pressCount);
}

void loop() {
  bool reading = digitalRead(BTN_PIN);
  if (reading != lastBtnState) lastDebounce = millis();
  if ((millis() - lastDebounce) > 50) {
    if (reading == LOW && lastBtnState == HIGH) {
      pressCount++;
      EEPROM.update(0, pressCount);
      digitalWrite(LED_PIN, HIGH);
      delay(100);
      digitalWrite(LED_PIN, LOW);
      Serial.print("Lan nhan thu: ");
      Serial.println(pressCount);
    }
  }
  lastBtnState = reading;
}',
'UNO', 'BEGINNER',
'Arduino UNO, nut bam, LED, dien tro 220 ohm',
'1. Noi nut bam: mot chan -> Pin2, chan kia -> GND
2. Noi LED: Pin13 -> dien tro 220 ohm -> LED -> GND
3. Upload code, nhan nut de dem',
'APPROVED', 10);

-- ═══ PROJECT 10: Tuoi cay tu dong ═══
INSERT INTO projects (id, user_id, title, slug, description, code, board_type, difficulty, hardware_requirements, usage_guide, status, upvotes)
VALUES ('p10', 'u1', 'He thong tuoi cay tu dong relay',
'he-thong-tuoi-cay-tu-dung-relay',
'Tuoi cay tu dong dua tren do am dat, relay bat bom nuoc.',
'#define SOIL_PIN A0
#define RELAY_PIN 7
#define THRESHOLD 600

bool pumpState = false;

void setup() {
  Serial.begin(9600);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);
  Serial.println("=== Tuoi Cay Tu Dong ===");
}

void loop() {
  int moisture = analogRead(SOIL_PIN);
  Serial.print("Do am dat: ");
  Serial.print(moisture);
  Serial.print(" | Bom: ");
  Serial.println(pumpState ? "BAT" : "TAT");

  if (moisture < THRESHOLD && !pumpState) {
    digitalWrite(RELAY_PIN, HIGH);
    pumpState = true;
    Serial.println(">>> Bat dau tuoi!");
  } else if (moisture >= THRESHOLD && pumpState) {
    digitalWrite(RELAY_PIN, LOW);
    pumpState = false;
    Serial.println(">>> Dung tuoi!");
  }
  delay(2000);
}',
'UNO', 'BEGINNER',
'Arduino UNO, relay module, cam bien do am dat, bom nuoc mini 5V',
'1. Noi relay: IN->Pin7, VCC->5V, GND->GND
2. Noi bom nuoc qua relay
3. Noi cam bien do am: A0->A0
4. Upload code, theo doi Serial',
'APPROVED', 16);

-- ═══ TAGS ═══
INSERT INTO tags (id, name, category)
VALUES
('t1', 'DHT11', 'SENSOR'), ('t2', 'LCD I2C', 'DISPLAY'), ('t3', 'I2C', 'COMMUNICATION'),
('t4', 'LED RGB', 'LED'), ('t5', 'WiFi', 'COMMUNICATION'), ('t6', 'ESP32', 'OTHER'),
('t7', 'ThingSpeak', 'IOT'), ('t8', 'Cam bien', 'SENSOR'), ('t9', 'HC-SR04', 'SENSOR'),
('t10', 'Servo', 'MOTOR'), ('t11', 'Relay', 'POWER'), ('t12', 'ESP8266', 'OTHER'),
('t13', 'PWM', 'OTHER'), ('t14', 'EEPROM', 'OTHER'), ('t15', 'NTC', 'SENSOR'),
('t16', 'BH1750', 'SENSOR'), ('t17', 'Web Server', 'IOT'), ('t18', 'Robot', 'MOTOR'),
('t19', 'Bom nuoc', 'MOTOR'), ('t20', 'NodeMCU', 'OTHER');

INSERT INTO project_tags (project_id, tag_id)
VALUES
('p1','t1'),('p1','t2'),('p1','t3'),('p1','t8'),
('p2','t9'),('p2','t18'),('p2','t4'),
('p3','t15'),('p3','t6'),('p3','t7'),
('p4','t4'),('p4','t13'),
('p5','t16'),('p5','t3'),
('p6','t10'),
('p7','t5'),('p7','t12'),('p7','t17'),('p7','t20'),
('p8','t9'),('p8','t8'),
('p9','t14'),
('p10','t11'),('p10','t19'),('p10','t8');

-- ═══ ERRORS ═══
INSERT INTO project_errors (project_id, error_message, cause, fix, code_snippet, upvotes)
VALUES
('p1', 'NaN values from DHT sensor', 'Day noi long hoac thieu dien tro pull-up', 'Kiem tra day DATA, them dien tro 10K tu DATA len VCC.', 'dht.begin();\ndelay(2000);', 8),
('p1', 'LiquidCrystal_I2C no display', 'Dia chi I2C sai', 'Chay I2C Scanner: File -> Examples -> Wire -> i2c_scanner', NULL, 5),
('p2', 'Robot khong chay khi coc nguon 7.4V', 'L298N khong du dong dien', 'Thao jumper 5V tren L298N khi dung nguon ngoai.', NULL, 6),
('p3', 'WiFi.begin stuck', 'SSID hoac password sai, router 5GHz', 'ESP32 chi ho tro 2.4GHz. Kiem tra lai.', NULL, 7),
('p7', 'Khong khoi tao WebServer', 'Thieu thu vien ESP8266WebServer', 'Board Manager -> Cai ESP8266 by ESP8266 Community.', NULL, 4),
('p9', 'EEPROM bi loi sau nhieu lan ghi', 'EEPROM chi co 100,000 vong ghi', 'Dung EEPROM.update() thay vi write.', 'EEPROM.update(0, pressCount);', 3),
('p10', 'Relay khong tat', 'Cam bien dat bi loi', 'Kiem tra chan A0, do gia tri analog tren Serial.', NULL, 4);

-- ═══ COMMENTS ═══
INSERT INTO comments (project_id, user_id, content, created_at)
VALUES
('p1', 'u2', 'Thanh cong! LCD hien thi dung du lieu.', '2024-02-01'),
('p1', 'u3', 'Gap loi NaN, them delay(2000) la het.', '2024-02-03'),
('p2', 'u1', 'Robot chay on dinh, rat hay!', '2024-02-05'),
('p3', 'u5', 'Gui du lieu ThingSpeak thanh cong!', '2024-02-08'),
('p7', 'u1', 'Web interface dep!', '2024-02-10'),
('p8', 'u2', 'Sensor do chinh xac den 1cm.', '2024-02-12'),
('p10', 'u3', 'He thong hoat dong tot!', '2024-02-15');

-- ═══ VERSIONS ═══
INSERT INTO project_versions (project_id, code, changelog, created_at)
VALUES
('p1', 'v1', 'Phien ban dau tien', '2024-01-15'),
('p1', 'v2', 'Them Serial debug va xu ly loi', '2024-01-20'),
('p2', 'v1', 'Robot 2 banh co ban', '2024-01-18'),
('p7', 'v1', 'Dieu khien LED qua WiFi', '2024-02-01'),
('p7', 'v2', 'Bo sung giao dien web dep hon', '2024-02-05');

-- ============================================
-- DONE! 
-- DANG NHAP:
--   arduino_vn@gmail.com / password123 (Admin)
--   maker_hcm@gmail.com / password123 (User)
--   esp32_dev@gmail.com / password123 (Moderator)
-- ============================================
