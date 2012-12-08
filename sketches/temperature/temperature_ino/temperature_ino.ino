#include "max6675.h"

int desiredTemp = 240;
boolean isOn = false;
int relayPin = 11;
int threshold = 5;
int thermoDO = 10;
int thermoCS = 8;
int thermoCLK = 9;

MAX6675 thermocouple(thermoCLK, thermoCS, thermoDO);

void setup()
{  
    Serial.begin(57600);  
    delay(500);
    pinMode(relayPin, OUTPUT);
}

void loop()
{
   if (Serial.available() > 0) {
     
     delay(5);
     
     char command = Serial.read(); 
     
     if (command == 's' || command == 't') { 
      
       int bytes = Serial.available();
       char input[bytes + 1];
       
       for (int i = 0; i < bytes; i++) {
         input[i] = Serial.read();
       }
       input[bytes] = '\0';
       
       int value = atoi(input);
       
       if (command == 's') {
         desiredTemp = value;
       } else if (command == 't') {
         threshold = value;
       }
     }
   }

   double temperature = thermocouple.readFarenheit();
   
  unsigned long now = millis();
 
   //if the temperature is too low and the burner is not on
   if (temperature < desiredTemp) 
   {
     digitalWrite(relayPin, HIGH);
     isOn = true;
   }
   else if (temperature > desiredTemp + threshold)
   {
     digitalWrite(relayPin, LOW);
     isOn = false;
   }
   
   Serial.print("Temp: ");
   Serial.println((int) temperature);
   
   Serial.print("Target: ");
   Serial.println(desiredTemp);
  
   Serial.print("Thresh: ");
   Serial.println(threshold);
   
   Serial.print("State: ");
   Serial.println(isOn);
   
   Serial.print("Time: ");
   Serial.println(now / 1000L);
   
   Serial.println("====");
   
   delay(2000);
}

