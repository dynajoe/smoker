void setup()
{  
   Serial.begin(9600);  
   pinMode(A4, INPUT);
}

void loop()
{
   Serial.println(GetTemperature(A4, 145800.0, 5.0, 225228.0, 295.7, 3961.07));
   
   delay(100);
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
