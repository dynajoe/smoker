#include "Arduino.h"
#include <Servo.h> 
#include <LiquidCrystal.h>

Servo powerServo;
float desiredTemp = 240;
float on = 30;
float off = 60.0;
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);
int lastChange = 0;
float state = off;

void setup()
{  
    Serial.begin(9600);  
    
    lcd.begin(16,2);
    lcd.clear();    
   
    //thermometer
    pinMode(A1, INPUT);
   
    powerServo.attach(14);
}


float GetTemperature(int pin, float divider, float vIn, float r0, float t0, float b)
{
   float voltage = ReadVoltage(pin, vIn);
   float resistance = GetResistance(divider, voltage);
  
   float lnR = log(resistance / r0);
   
   float tempC = (1.0 / ((1.0 / t0) + (lnR / b))) - 273.15;
   float tempF = (tempC *  9.0) / 5.0 + 32.0;
  
   return tempF;
 }
 
 float ReadVoltage(int pin, float vIn)
 {
   int sum = 0;
   
   for (int i = 0; i < 5; i++)
   {
      sum += analogRead(pin);   
   }
   
   float avgOut = sum / 5.0;
   
   return (avgOut / 1023.0) * vIn;  
 }

float GetResistance(float divider, float voltage)
{
  return divider * ((5.0 / voltage) - 1);
}

void loop()
{
   float temperature = GetTemperature(A1, 100500.0, 4.85, 225228.0, 295.7, 3961.07);
   
   Serial.println(temperature);
   unsigned long now = millis();
   
   unsigned long sinceLastChange = now - lastChange;
   boolean change = false;
   
   if (sinceLastChange > 5000) 
   {
     //if the temperature is too low and the burner is not on
     if (temperature < desiredTemp && state != on) 
     {
       powerServo.write(on);  
       state = on;
       change = true;
     }//If the temperature is greater than 5 over the desired temp turn the burner off
     else if (temperature > (desiredTemp + 5) && state == on)
     {
       powerServo.write(off);
       state = off;
       change = true;
     }  
     
     if (change) {
       lastChange = now;
     }
   }
  
   lcd.setCursor(0, 0);
   lcd.print(now / 1000L);
   lcd.print(" seconds");   
   lcd.setCursor(0, 1);
   lcd.print((int) temperature);
   lcd.print(state == on ? " on " : " off ");
   lcd.print(sinceLastChange / 1000L);
   lcd.print(" ago");
   
   delay(1000);
}
extern "C" void __cxa_pure_virtual() { while (1) ; }
#include <Arduino.h>

int main(void)
{
	init();

#if defined(USBCON)
	USBDevice.attach();
#endif
	
	setup();
    
	for (;;) {
		loop();
		if (serialEventRun) serialEventRun();
	}
        
	return 0;
}

