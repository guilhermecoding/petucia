#include <ArduinoJson.h>

#define pinoUmidadeSolo A0

StaticJsonDocument<128> doc;

void setup() {
  Serial.begin(9600);
}

void loop() {
  int valorUmidadeSolo = analogRead(pinoUmidadeSolo);

  doc.clear();
  doc["soil_moisture"] = valorUmidadeSolo;

  serializeJson(doc, Serial);
  Serial.println();

  delay(3000);
}
