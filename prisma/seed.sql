-- ============================================
-- ArduinoHub - Seed Data (10 projects thật)
-- Chạy trong: Supabase Dashboard → SQL Editor
-- ============================================

-- Xóa dữ liệu cũ
TRUNCATE TABLE project_tags, comments, project_errors, project_versions, upvotes, user_badges, reports, projects, tags, badges, accounts, sessions, "users" CASCADE;

-- ═══ USERS ═══
-- password123 cho tất cả
INSERT INTO "users" ("id", "username", "email", "passwordHash", "reputation", "role", "isBanned")
VALUES
  ('u1', 'arduino_vn', 'arduino_vn@gmail.com', '$2b$12$2g632oWKqYY7cTSEUat4OOhHI/ztmG/qOrLqYOrI2od.PT47.xHFy', 120, 'ADMIN', false),
  ('u2', 'maker_hcm', 'maker_hcm@gmail.com', '$2b$12$2g632oWKqYY7cTSEUat4OOhHI/ztmG/qOrLqYOrI2od.PT47.xHFy', 85, 'USER', false),
  ('u3', 'esp32_dev', 'esp32_dev@gmail.com', '$2b$12$2g632oWKqYY7cTSEUat4OOhHI/ztmG/qOrLqYOrI2od.PT47.xHFy', 200, 'MODERATOR', false),
  ('u4', 'iot_hanoi', 'iot_hanoi@gmail.com', '$2b$12$2g632oWKqYY7cTSEUat4OOhHI/ztmG/qOrLqYOrI2od.PT47.xHFy', 150, 'USER', false),
  ('u5', 'robot_fan', 'robot_fan@gmail.com', '$2b$12$2g632oWKqYY7cTSEUat4OOhHI/ztmG/qOrLqYOrI2od.PT47.xHFy', 75, 'USER', false),
  ('u6', 'ddos_kid_69', 'spam@evil.com', NULL, 0, 'USER', true);

-- ═══ PROJECTS ═══

-- 1. DHT11 + LCD
INSERT INTO "projects" ("id", "userId", "title", "slug", "description", "code", "boardType", "difficulty", "hardwareRequirements", "usageGuide", "status", "upvotes")
VALUES ('p1', 'u1', 'Cảm biến nhiệt độ DHT11 hiển thị LCD 16x2',
'cam-bien-nhiet-do-dht11-hien-thi-lcd',
'Đọc nhiệt độ và độ ẩm từ DHT11, hiển thị lên màn hình LCD 16x2 qua I2C.',
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

-- 2. Robot obstacle avoidance
INSERT INTO "projects" ("id", "userId", "title", "slug", "description", "code", "boardType", "difficulty", "hardwareRequirements", "usageGuide", "status", "upvotes")
VALUES ('p2', 'u2', 'Robot tranh chap truong - HC-SR04 + L298N',
'robot-tranh-chuong-ngai-vat-hc-sr04',
'Robot 2 banh tu dong tranh chuong ngai vat bang cam bienSieU am, dieu khien dong co DC qua L298N.',
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

void goBackward() {
  digitalWrite(MOTOR_L_F, LOW);
  analogWrite(MOTOR_L_B, SPEED);
  digitalWrite(MOTOR_R_F, LOW);
  analogWrite(MOTOR_R_B, SPEED);
}

void turnRight() {
  analogWrite(MOTOR_L_F, SPEED);
  digitalWrite(MOTOR_L_B, LOW);
  digitalWrite(MOTOR_R_F, LOW);
  analogWrite(MOTOR_R_B, SPEED);
}

void turnLeft() {
  digitalWrite(MOTOR_L_F, LOW);
  analogWrite(MOTOR_L_B, SPEED);
  analogWrite(MOTOR_R_F, SPEED);
  digitalWrite(MOTOR_R_B, LOW);
}

void stopMotors() {
  digitalWrite(MOTOR_L_F, LOW);
  digitalWrite(MOTOR_L_B, LOW);
  digitalWrite(MOTOR_R_F, LOW);
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
  Serial.println("Robot ready!");
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
'Arduino UNO, 2 dong co DC, L298N driver, HC-SR04, nguon 7.4V, breadboard',
'1. Noi dong co qua L298N: OUT1/OUT2 -> dong co trai, OUT3/OUT4 -> dong co phai
2. Noi HC-SR04: Trig->Pin9, Echo->Pin10, VCC->5V, GND->GND
3. Noi L298N: IN1->Pin5, IN2->Pin6, IN3->Pin3, IN4->Pin11
4. Cap nguon 7.4V vao L298N, cam USB de debug
5. Upload code, thu nguoc chuong ngai vat',
'APPROVED', 31);

-- 3. ESP32 ThingSpeak
INSERT INTO "projects" ("id", "userId", "title", "slug", "description", "code", "boardType", "difficulty", "hardwareRequirements", "usageGuide", "status", "upvotes")
VALUES ('p3', 'u3', 'ESP32 gui nhiet do len ThingSpeak moi 15 giay',
'esp32-gui-nhiet-do-thingspeak',
'ESP32 doc NTC thermistor, tinh nhiet do theo Steinhart-Hart, gui len ThingSpeak cloud.',
'#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "TEN_WIFI_CUA_BAN";
const char* password = "MAT_KHAU_WIFI";
const char* apiKey = "THING_SPEAK_WRITE_API_KEY";

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
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
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

    if (httpCode > 0) {
      Serial.print("Temp: ");
      Serial.print(temp, 2);
      Serial.print(" C | HTTP: ");
      Serial.println(httpCode);
    } else {
      Serial.println("HTTP error!");
    }
    http.end();
  }
  delay(15000);
}',
'ESP32', 'INTERMEDIATE',
'ESP32 DevKit V1, NTC Thermistor 10K, dien tro 10K, day jumper, tai khoan ThingSpeak free',
'1. Tao tai khoan ThingSpeak (thingspeak.com)
2. Tao Channel moi voi 1 field
3. Copy Write API Key vao code thay "THING_SPEAK_WRITE_API_KEY"
4. Thay TEN_WIFI_CUA_BAN va MAT_KHAU_WIFI
5. Noi NTC: 3.3V -> NTC -> Pin34 va DienTro 10K -> GND
6. Upload, mo Serial Monitor 115200 baud',
'APPROVED', 28);

-- 4. LED RGB voi PWM
INSERT INTO "projects" ("id", "userId", "title", "slug", "description", "code", "boardType", "difficulty", "hardwareRequirements", "usageGuide", "status", "upvotes")
VALUES ('p4', 'u4', 'Dieu khien LED RGB 7 mau bang PWM',
'dieu-khien-led-rgb-7-mau-pwm',
'Dieu kien mau sac LED RGB qua 3 chan PWM, tu dong doi mau moi 1 giay. Co che do dem mau.',
#define RED_PIN 9
#define GREEN_PIN 10
#define BLUE_PIN 11

int colors[][3] = {
  {255, 0, 0},     // Do
  {0, 255, 0},     // Xanh la
  {0, 0, 255},     // Xanh duong
  {255, 255, 0},   // Vang
  {255, 0, 255},   // Tim
  {0, 255, 255},   // Cyan
  {255, 255, 255}  // Trang
};

const char* colorNames[] = {
  "DO", "XANH LA", "XANH DUONG", "VANG", "TIM", "CYAN", "TRANG"
};

int colorIndex = 0;

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
  setColor(colors[colorIndex][0], colors[colorIndex][1], colors[colorIndex][2]);
  Serial.print("Mau: ");
  Serial.println(colorNames[colorIndex]);

  colorIndex = (colorIndex + 1) % 7;
  delay(1000);
}',
'UNO', 'BEGINNER',
'Arduino UNO, LED RGB common cathode, 3 dien tro 220 ohm, breadboard',
'1. Noi LED RGB: Red->Pin9, Green->Pin10, Blue->Pin11 qua dien tro 220 ohm
2. Noi GND chung xuong GND Arduino
3. Upload code, LED se tu dong doi mau moi giay
4. Mo Serial Monitor de xem ten mau hien tai',
'APPROVED', 18);

-- 5. Cam bien anh sang BH1750
INSERT INTO "projects" ("id", "userId", "title", "slug", "description", "code", "boardType", "difficulty", "hardwareRequirements", "usageGuide", "status", "upvotes")
VALUES ('p5', 'u1', 'Doc cuong do anh sang BH1750 hien thi Serial',
'doc-cuong-do-anh-sang-bh1750',
'Doc gia tri cuong do anh sang tu sensor BH1750 qua I2C, hien thi tren Serial Monitor voi don vi lux.',
#include <Wire.h>
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
  Serial.println("Lux\t\tTrang thai");
  Serial.println("---\t\t----------");
}

void loop() {
  float lux = lightMeter.readLightLevel();

  Serial.print(lux);
  Serial.print("\t\t");

  if (lux < 10) {
    Serial.println("Toi");
  } else if (lux < 50) {
    Serial.println("Am u");
  } else if (lux < 200) {
    Serial.println("Binh thuong");
  } else if (lux < 500) {
    Serial.println("Sang");
  } else {
    Serial.println("Rat sang!");
  }

  delay(1000);
}',
'UNO', 'BEGINNER',
'Arduino UNO, BH1750 sensor, 4 day jumper',
'1. Noi BH1750: VCC->5V, GND->GND, SDA->A4, SCL->A5
2. Upload code
3. Mo Serial Monitor 9600 baud
4. Thay doi muc sang bang cach che/bat sang sensor',
'APPROVED', 15);

-- 6. Dieu khien servo tu Servo
INSERT INTO "projects" ("id", "userId", "title", "slug", "description", "code", "boardType", "difficulty", "hardwareRequirements", "usageGuide", "status", "upvotes")
VALUES ('p6', 'u5', 'Dieu khien Servo SG90 quay 180 do',
'dieu-khien-servo-sg90-quay-180-do',
'Servo SG90 quay tu 0 den 180 do roi quay lai, dung Servo library co san.',
#include <Servo.h>

Servo myServo;
int pos = 0;

void setup() {
  Serial.begin(9600);
  myServo.attach(9);
  myServo.write(0);
  delay(500);
  Serial.println("Servo ready!");
}

void loop() {
  for (pos = 0; pos <= 180; pos += 5) {
    myServo.write(pos);
    Serial.print("Goc: ");
    Serial.println(pos);
    delay(30);
  }
  delay(500);

  for (pos = 180; pos >= 0; pos -= 5) {
    myServo.write(pos);
    Serial.print("Goc: ");
    Serial.println(pos);
    delay(30);
  }
  delay(500);
}',
'UNO', 'BEGINNER',
'Arduino UNO, Servo SG90, day jumper',
'1. Noi Servo: Signal (cam do)->Pin9, VCC(5V), GND
2. Neu servo rung khi khoi dong, them nguon rieng 5V
3. Upload code, servo se quay tu 0 den 180 roi quay lai',
'APPROVED', 12);

-- 7. NodeMCU dieu khien LED tu Wifi
INSERT INTO "projects" ("id", "userId", "title", "slug", "description", "code", "boardType", "difficulty", "hardwareRequirements", "usageGuide", "status", "upvotes")
VALUES ('p7', 'u4', 'Dieu khien LED qua WiFi voi ESP8266 NodeMCU',
'dieu-khien-led-qua-wifi-esp8266',
'Dieu khien 2 LED tu trinh duyet web qua WiFi. Mo truy cap IP de bat/tat LED.',
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

const char* ssid = "TEN_WIFI";
const char* password = "MAT_KHAU";

#define LED1 5   // D1
#define LED2 4   // D2

ESP8266WebServer server(80);

bool led1State = false;
bool led2State = false;

String getHTML() {
  String html = "<!DOCTYPE html><html><head>";
  html += "<meta name='viewport' content='width=device-width, initial-scale=1'>";
  html += "<title>ESP8266 LED Control</title>";
  html += "<style>body{font-family:Arial;text-align:center;background:#1a1a2e;color:white;padding:20px;}";
  html += "h1{color:#00979D;}button{padding:15px 30px;margin:10px;font-size:18px;border:none;border-radius:8px;cursor:pointer;}";
  html += ".on{background:#00979D;color:white;}.off{background:#e74c3c;color:white;}</style></head><body>";
  html += "<h1>ArduinoHub LED Control</h1>";
  html += "<h2>LED 1 (D1)</h2>";
  html += led1State
    ? "<p style='color:#2ecc71;font-size:24px;'>DANG BAT</p><a href='/led1/off'><button class='off'>TAT</button></a>"
    : "<p style='color:#e74c3c;font-size:24px;'>DANG TAT</p><a href='/led1/on'><button class='on'>BAT</button></a>";
  html += "<h2>LED 2 (D2)</h2>";
  html += led2State
    ? "<p style='color:#2ecc71;font-size:24px;'>DANG BAT</p><a href='/led2/off'><button class='off'>TAT</button></a>"
    : "<p style='color:#e74c3c;font-size:24px;'>DANG TAT</p><a href='/led2/on'><button class='on'>BAT</button></a>";
  html += "</body></html>";
  return html;
}

void handleRoot() { server.send(200, "text/html", getHTML()); }
void handleLed1On()  { led1State = true;  digitalWrite(LED1, HIGH); server.sendHeader("Location", "/"); server.send(302); }
void handleLed1Off() { led1State = false; digitalWrite(LED1, LOW);  server.sendHeader("Location", "/"); server.send(302); }
void handleLed2On()  { led2State = true;  digitalWrite(LED2, HIGH); server.sendHeader("Location", "/"); server.send(302); }
void handleLed2Off() { led2State = false; digitalWrite(LED2, LOW);  server.sendHeader("Location", "/"); server.send(302); }

void setup() {
  Serial.begin(115200);
  pinMode(LED1, OUTPUT);
  pinMode(LED2, OUTPUT);

  WiFi.begin(ssid, password);
  Serial.print("Dang ket noi WiFi");
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\nWiFi connected!");
  Serial.print("Mo truy cap: http://");
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
'NodeMCU ESP8266, 2 LED, 2 dien tro 220 ohm, breadboard',
'1. Noi LED: Anode -> D1 va D2 qua dien tro 220 ohm, Cathode -> GND
2. Thay TEN_WIFI va MAT_KHAU
3. Upload code, xem IP tren Serial Monitor
4. Mo trinh duyet, nhap IP vao thanh dia chi
5. Bam nut BAT/TAT de dieu khien LED',
'APPROVED', 22);

-- 8. Cam bien khoang cach HC-SR04
INSERT INTO "projects" ("id", "userId", "title", "slug", "description", "code", "boardType", "difficulty", "hardwareRequirements", "usageGuide", "status", "upvotes")
VALUES ('p8', 'u3', 'Do khoang cach bang HC-SR04 hien thi Serial',
'do-khoang-cach-hc-sr04',
'Do khoang cach chinh xac bang cam bien sieu am HC-SR04, hien thi tren Serial voi cm va inch.',
#define TRIG 9
#define ECHO 10

void setup() {
  Serial.begin(9600);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  Serial.println("=== HC-SR04 Distance Meter ===");
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
    float inch = cm / 2.54;
    Serial.print("Khoang cach: ");
    Serial.print(cm, 1);
    Serial.print(" cm | ");
    Serial.print(inch, 1);
    Serial.println(" inch");
  }
  delay(500);
}',
'UNO', 'BEGINNER',
'Arduino UNO, HC-SR04, 2 day jumper',
'1. Noi HC-SR04: Trig->Pin9, Echo->Pin10, VCC->5V, GND->GND
2. Upload code, mo Serial Monitor 9600 baud
3. Dat chuong ngai vat truoc sensor, xem khoang cach thay doi',
'APPROVED', 20);

-- 9. EEPROM luu tru du lieu
INSERT INTO "projects" ("id", "userId", "title", "slug", "description", "code", "boardType", "difficulty", "hardwareRequirements", "usageGuide", "status", "upvotes")
VALUES ('p9', 'u5', 'Luu so lan nhan nut vao EEPROM',
'luu-so-lan-nhan-nut-eeprom',
'Dem so lan nhan nut bam, luu vao EEPROM de giu nguyen khi tat nguon. Hien thi so dem tren Serial.',
#include <EEPROM.h>

#define BTN_PIN 2
#define LED_PIN 13

int pressCount = 0;
bool lastBtnState = HIGH;
unsigned long lastDebounce = 0;
const unsigned long DEBOUNCE_DELAY = 50;

void setup() {
  Serial.begin(9600);
  pinMode(BTN_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);

  pressCount = EEPROM.read(0);
  if (pressCount == 255) pressCount = 0;

  Serial.print("So lan nhan nut truoc do: ");
  Serial.println(pressCount);
  Serial.println("Nhan nut de dem...");
}

void loop() {
  bool reading = digitalRead(BTN_PIN);

  if (reading != lastBtnState) {
    lastDebounce = millis();
  }

  if ((millis() - lastDebounce) > DEBOUNCE_DELAY) {
    if (reading == LOW && lastBtnState == HIGH) {
      pressCount++;
      EEPROM.write(0, pressCount);
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
'Arduino UNO, nut bam, LED, dien tro 220 ohm, breadboard',
'1. Noi nut bam: mot chan -> Pin2, chan kia -> GND
2. Noi LED: Pin13 -> dien tro 220 ohm -> LED -> GND
3. Upload code, nhan nut bam
4. Tat nguon va bat lai, so dem van giu nguyen!',
'APPROVED', 10);

-- 10. Thiet bi tuoi cay tu dong
INSERT INTO "projects" ("id", "userId", "title", "slug", "description", "code", "boardType", "difficulty", "hardwareRequirements", "usageGuide", "status", "upvotes")
VALUES ('p10', 'u1', 'He thong tuoi cay tu dong voi relay',
'he-thong-tuoi-cay-tu-dung-relay',
'Tuoi cay tu dong dua tren do am dat. Khi do am thap, relay bat bom nuoc. Co che do debug Serial.',
#define SOIL_MOISTURE_PIN A0
#define RELAY_PIN 7
#define THRESHOLD 600

bool pumpState = false;

int readSoilMoisture() {
  int raw = analogRead(SOIL_MOISTURE_PIN);
  return raw;
}

void setup() {
  Serial.begin(9600);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);
  Serial.println("=== Tuoi Cay Tu Dong ===");
  Serial.println("Do am dat > 600: KHONG can tuoi");
  Serial.println("Do am dat < 600: CAN tuoi");
  Serial.println("---");
}

void loop() {
  int moisture = readSoilMoisture();

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
'Arduino UNO, relay module 1 chuong, cam bien do am dat, bom nuoc mini 5V, day jumper',
'1. Noi relay: IN -> Pin7, VCC -> 5V, GND -> GND
2. Noi bom nuoc qua relay (COM va NO)
3. Noi cam bien do am dat: VCC->5V, GND->GND, A0->A0
4. Cam dat vao sensor, dat trong dat
5. Upload code, theo doi Serial Monitor',
'APPROVED', 16);

-- ═══ TAGS ═══
INSERT INTO "tags" ("id", "name", "category")
VALUES
('t1', 'DHT11', 'SENSOR'), ('t2', 'LCD I2C', 'DISPLAY'), ('t3', 'I2C', 'COMMUNICATION'),
('t4', 'LED RGB', 'LED'), ('t5', 'WiFi', 'COMMUNICATION'), ('t6', 'ESP32', 'OTHER'),
('t7', 'ThingSpeak', 'IOT'), ('t8', 'Cảm biến', 'SENSOR'), ('t9', 'HC-SR04', 'SENSOR'),
('t10', 'Servo', 'MOTOR'), ('t11', 'Relay', 'POWER'), ('t12', 'ESP8266', 'OTHER'),
('t13', 'PWM', 'OTHER'), ('t14', 'EEPROM', 'OTHER'), ('t15', 'NTC', 'SENSOR'),
('t16', 'BH1750', 'SENSOR'), ('t17', 'Web Server', 'IOT'), ('t18', 'Robot', 'MOTOR'),
('t19', 'Bom nuoc', 'MOTOR'), ('t20', 'NodeMCU', 'OTHER');

-- ═══ PROJECT_TAGS ═══
INSERT INTO "project_tags" ("projectId", "tagId")
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
INSERT INTO "project_errors" ("projectId", "errorMessage", "cause", "fix", "codeSnippet", "upvotes")
VALUES
('p1', 'NaN values from DHT sensor', 'DHT11 khong doc duoc — day noi long hoac thieu dien tro pull-up 10K tren DATA pin', 'Kiem tra day DATA, them dien tro 10K tu DATA len VCC. Dung isnan() nhu trong code mau.', 'dht.begin();\ndelay(2000); // Cho DHT warm-up', 8),
('p1', 'LiquidCrystal_I2C no display', 'Dia chi I2C sai — 0x27 hoac 0x3F tuy module', 'Chay I2C Scanner: File -> Examples -> Wire -> i2c_scanner', NULL, 5),
('p2', 'Robot khong chay khi coc nguon 7.4V', 'L298N khong du dong dien hoac jumper 5V khong thao', 'Thao jumper 5V tren L298N khi dung nguon ngoai. Dam bao nguon >= 7V.', NULL, 6),
('p3', 'WiFi.begin stuck o infinite loop', 'SSID hoac password sai, router 5GHz', 'ESP32 chi ho tro 2.4GHz. Kiem tra lai SSID va password.', NULL, 7),
('p7', 'NodeMCU khong khoi tao WebServer', 'Thieu thu vien ESP8266WebServer hoac sai dinh tuyen', 'Vao Arduino IDE -> Board Manager -> Cai ESP8266 by ESP8266 Community.', NULL, 4),
('p9', 'EEPROM.write bi loi sau nhieu lan ghi', 'EEPROM chi co 100,000 vong ghi', 'Dung EEPROM.update() thay vi write de chi ghi khi gia tri thay doi.', 'EEPROM.update(0, pressCount); // Chi ghi khi khac', 3),
('p10', 'Relay khong tat khi do am dat cao', 'Cam bien dat bi loi hoac truyen sai gia tri analog', 'Kiem tra chan A0, dam bao cam bien du am. Do gia tri analog tren Serial de debug.', NULL, 4);

-- ═══ COMMENTS ═══
INSERT INTO "comments" ("projectId", "userId", "content", "createdAt")
VALUES
('p1', 'u2', 'Lam theo huong dan thanh cong! Cam on ban nhieu. LCD hien thi dung du lieu.', '2024-02-01'),
('p1', 'u3', 'Minh gap loi NaN, them delay(2000) sau dht.begin() la het. Thanks!', '2024-02-03'),
('p2', 'u1', 'Robot chay on dinh, nhung luc quay bi rung. Co cach khac phuc khong?', '2024-02-05'),
('p2', 'u4', 'Thu giam toc khi quay, delay(400) -> delay(300). Minh da thu va on dinh hon.', '2024-02-06'),
('p3', 'u5', 'Cau hinh ThingSpeak rat chi tiet. Minh da gui du lieu thanh cong!', '2024-02-08'),
('p7', 'u1', 'Web interface dep! Minh them che do tu dong bat tat theo gio duoc khong?', '2024-02-10'),
('p8', 'u2', 'Sensor do chinh xac den 1cm. Rat hay!', '2024-02-12'),
('p10', 'u3', 'He thong hoat dong tot, cay khong con bi kho nua. Thank you!', '2024-02-15');

-- ═══ VERSIONS ═══
INSERT INTO "project_versions" ("projectId", "code", "changelog", "createdAt")
VALUES
('p1', 'v1 code', 'Phien ban dau tien', '2024-01-15'),
('p1', 'v2 code', 'Them Serial print debug va xu ly loi isnan', '2024-01-20'),
('p2', 'v1 code', 'Robot 2 banh co ban', '2024-01-18'),
('p2', 'v2 code', 'Them che do ngu va quay khi gap chuong ngai vat', '2024-01-25'),
('p3', 'v1 code', 'Gui du lieu ThingSpeak co ban', '2024-01-20'),
('p7', 'v1 code', 'Dieu khien 2 LED qua WiFi', '2024-02-01'),
('p7', 'v2 code', 'Bo sung giao dien web dep hon voi CSS dark theme', '2024-02-05');
