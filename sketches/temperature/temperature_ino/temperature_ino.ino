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


double GetTemperature(int pin, double divider, double vIn)
{
   double voltage = ReadVoltage(pin, vIn);
   double resistance = GetResistance(divider, vIn, voltage);

   double A = -0.0000866368; 
   double B = 0.000288304;
   double C = -.0000000587677;
   
   double lnR = log(resistance);
   double tempC =  (1.0 / (A + (B * lnR) + (C * (lnR * lnR * lnR))) - 273.15);

   double tempF = (tempC *  9.0) / 5.0 + 32.0;
  
   return tempF;
 }
 
 double ReadVoltage(int pin, double vIn)
 {
   int sum = 0;
   
   for (int i = 0; i < 5; i++)
   {
      sum += analogRead(pin);   
   }
   
   double avgOut = sum / 5.0;
   
   return (avgOut / 1023.0) * vIn;  
 }

double GetResistance(double divider, double vIn, double voltage)
{
  return divider * ((vIn / voltage) - 1);
}

void loop()
{
   double temperature = GetTemperature(A1, 100500.0, 4.85);
   
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
