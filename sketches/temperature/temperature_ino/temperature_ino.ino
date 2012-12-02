int desiredTemp = 240;
boolean isOn = false;
int relayPin = 11;
int threshold = 5;

void setup()
{  
    Serial.begin(9600);  
    //thermometer
    pinMode(A1, INPUT);
    pinMode(relayPin, OUTPUT);
}

double GetTemperature(int pin, double divider, double vIn)
{
   double voltage = ReadVoltage(pin, vIn);
   double resistance = GetResistance(divider, vIn, voltage);

   double A = -0.487338; 
   double B = 0.0785121;
   double C = -.00029874;
   
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

   double temperature = GetTemperature(A1, 100000.0, 5.0);
   
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

