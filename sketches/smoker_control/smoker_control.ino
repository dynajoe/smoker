#include "max6675.h"

int relayPin = 11;
int thermoDO = 10;
int thermoCS = 8;
int thermoCLK = 9;

boolean isOn = false;
int desiredTemp = 240;
int threshold = 5;
double voltageIn = 4.85;
int outsideTempPin = A0;
int delayMs = 2000;

MAX6675 thermocouple(thermoCLK, thermoCS, thermoDO);

void setup()
{  
	Serial.begin(57600);  
	
	delay(500);
	
	pinMode(relayPin, OUTPUT);
	pinMode(outsideTempPin, INPUT);
	pinMode(thermoCS, OUTPUT);
	pinMode(thermoCLK, OUTPUT); 
	pinMode(thermoDO, INPUT);

   digitalWrite(thermoCS, HIGH);
}

void processCommands()
{
	if (Serial.available() > 0) {

		delay(50);

		char command = Serial.read(); 

		if (command == 's' || command == 't'|| command == 'd') { 

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
			} else if (command == 'd') {
				delayMs = value;
			}
		}
	}
}

byte readSPI() 
{ 
  int i;
  byte d = 0;

  for (i = 7; i >= 0; i--)
  {
    digitalWrite(thermoCLK, LOW);
    delayMicroseconds(1000);
    
    if (digitalRead(thermoDO)) 
    {
      //set the bit to 0 no matter what
      d |= (1 << i);
    }

    digitalWrite(thermoCLK, HIGH);
    delayMicroseconds(1000);
  }

  return d;
}

double getThermocoupleTemp() 
{
  uint16_t v;

  digitalWrite(thermoCS, LOW);
  delayMicroseconds(1000);

  v = readSPI();
  v <<= 8;
  v |= readSPI();

  digitalWrite(thermoCS, HIGH);

  if (v & 0x4) {
    return NAN; 
  }

  v >>= 3;

  double tempC = v * 0.25;

  return tempC * (9.0 / 5.0) + 32;
}

double getVoltage(int pin, double vIn)
{
	return (analogRead(pin) / 1023.0) * vIn;  
}

double getResistance(double divider, double voltage)
{
  return divider * ((voltageIn / voltage) - 1);
}

double getOutsideTemp()
{	 
	double divider = 100700.0;
	double r0 = 50000.0;
	double t0 = 298.15;
	double b = 4300.0;
	double voltage = getVoltage(outsideTempPin, voltageIn);
	double resistance = getResistance(divider, voltage);
	double lnR = log(resistance / r0);
	double tempC = (1.0 / ((1.0 / t0) + (lnR / b))) - 273.15;
	double tempF = (tempC *  9.0) / 5.0 + 32.0;
	return tempF;
}

void loop()
{
	processCommands();
	
	double smokerTemp = getThermocoupleTemp();
   double outsideTemp = getOutsideTemp();

	unsigned long now = millis();
 
   //if the smokerTemp is too low and the burner is not on
   if (smokerTemp < desiredTemp) 
   {
		digitalWrite(relayPin, HIGH);
		isOn = true;
   } 
   //If the smoker temp is falling toward the desired temp 
   //and it's halfway between it and the threshold kick on the burner
   else if (smokerTemp < desiredTemp + threshold && smokerTemp > (desiredTemp + (threshold / 2.0)) && !isOn) {
		digitalWrite(relayPin, HIGH);
		isOn = true;
   }
   else if (smokerTemp > desiredTemp + threshold)
   {
		digitalWrite(relayPin, LOW);
		isOn = false;
   }
   
   Serial.print((int) smokerTemp);
   Serial.print(',');
   Serial.print((int) outsideTemp);
   Serial.print(',');
   Serial.print((int) isOn);
   Serial.print(',');
   Serial.print((int) desiredTemp);
   Serial.print(',');
   Serial.print((int) threshold);
   Serial.print(',');
   Serial.print(now / 1000L);	
   Serial.println();

   delay(delayMs);
}