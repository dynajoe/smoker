int relayPin = 11;
int thermoDO = 10;
int thermoCS = 8;
int thermoCLK = 9;
int led = 13;

boolean isOn = false;
int desiredTemp = 210;
int threshold = 5;
boolean automatic = true;

long readVcc() {
  // Read 1.1V reference against AVcc
  // set the reference to Vcc and the measurement to the internal 1.1V reference
  #if defined(__AVR_ATmega32U4__) || defined(__AVR_ATmega1280__) || defined(__AVR_ATmega2560__)
    ADMUX = _BV(REFS0) | _BV(MUX4) | _BV(MUX3) | _BV(MUX2) | _BV(MUX1);
  #elif defined (__AVR_ATtiny24__) || defined(__AVR_ATtiny44__) || defined(__AVR_ATtiny84__)
     ADMUX = _BV(MUX5) | _BV(MUX0) ;
  #else
    ADMUX = _BV(REFS0) | _BV(MUX3) | _BV(MUX2) | _BV(MUX1);
  #endif

  delay(2); // Wait for Vref to settle
  ADCSRA |= _BV(ADSC); // Start conversion
  while (bit_is_set(ADCSRA,ADSC)); // measuring

  uint8_t low  = ADCL; // must read ADCL first - it then locks ADCH
  uint8_t high = ADCH; // unlocks both

  long result = (high<<8) | low;

  result = 1125300L / result; // Calculate Vcc (in mV); 1125300 = 1.1*1023*1000
  return result; // Vcc in millivolts
}

void setup()
{
   Serial.begin(9600);

   delay(1000);

   pinMode(led, OUTPUT);
   pinMode(relayPin, OUTPUT);
   pinMode(thermoCS, OUTPUT);
   pinMode(thermoCLK, OUTPUT);
   pinMode(thermoDO, INPUT);

   digitalWrite(thermoCS, HIGH);
}

char* readToNewLine(int bufferSize, char* buffer) {
   char c;
   int read = 0;

   while ((c = Serial.read()) != '\n') {
     if (read < bufferSize) {
       buffer[read++] = (char) c;
     }
     // Throw everything else away
   }

   buffer[read] = '\0';
}

void processCommands()
{
   const int BufferSize = 20;

   if (Serial.available() > 0) {
      char command = Serial.read();

      char* data = (char*) malloc(BufferSize * sizeof(char));

      readToNewLine(BufferSize, data);

      if (command == 's') {
         desiredTemp = atoi(data);
      }
      else if (command == 't') {
         threshold = atoi(data);
      }
      else if (command == 'a') {
         automatic = true;
      }
      else if (command == 'm') {
         automatic = false;
      }
      else if (command == '+') {
         isOn = true;
      }
      else if (command == '-') {
         isOn = false;
      }

      free(data);
   }
}

int readBit() {
   digitalWrite(thermoCLK,HIGH);
   delay(1);
   int value = digitalRead(thermoDO);
   digitalWrite(thermoCLK,LOW);
   return value;
}

double getThermocoupleTemp()
{

   // Stop conversion and start a new
   digitalWrite(thermoCS,LOW);
   delay(1);
   digitalWrite(thermoCS,HIGH);

   // Wait for conversion (spec says 220ms but not exactly)
   delay(230);

   // Start reading data
   digitalWrite(thermoCS,LOW);

   // (Dummy Bit)
   readBit();

   // 12 bits of Precision (MSB first)
   int value = 0;
   for (int i = 11; i >= 0; i--) {
     value += readBit() << i;
   }

   // Error bit (Open Input?)
   int error_tc = readBit();

   // Extra two bits (Device ID and State)
   for (int i = 0; i < 2; i++) {
     readBit();
   }

   // All done
   digitalWrite(thermoCS, HIGH);

   // Convert C to F
   if (error_tc == 0) {
     return (value * 0.25) * 9.0/5.0 + 32.0;
   }

   return -255;
}

void blinkError() {
   digitalWrite(led, LOW);
   delay(50);
   digitalWrite(led, HIGH);
   delay(50);
   digitalWrite(led, LOW);
   delay(50);
   digitalWrite(led, HIGH);
}

void determineState(double smokerTemp) {

   //if the smokerTemp is too low and the burner is not on
   if (smokerTemp < desiredTemp)
   {
      isOn = true;
   }
   else if (smokerTemp < desiredTemp + threshold && smokerTemp > (desiredTemp + (threshold / 2.0)) && !isOn)
   {
      isOn = true;
   }
   else if (smokerTemp > desiredTemp + threshold)
   {
      isOn = false;
   }
}

void writeOutput(double smokerTemp) {
   Serial.print(automatic ? 'A' : 'M');
   Serial.print(',');
   Serial.print(smokerTemp);
   Serial.print(',');
   Serial.print(isOn ? "ON" : "OFF");
   Serial.print(',');
   Serial.print(millis() / 1000L);
   Serial.print(',');
   Serial.print(readVcc() / 1000.0);

   if (automatic) {
     Serial.print(',');
     Serial.print(desiredTemp);
     Serial.print(',');
     Serial.print(threshold);
   }

   Serial.println();
}

void loop()
{
   processCommands();

   double smokerTemp = getThermocoupleTemp();

   if (automatic) {
     determineState(smokerTemp);
   }

   digitalWrite(relayPin, isOn ? HIGH : LOW);

   if (smokerTemp == -255) {
      blinkError();
   } else {
      digitalWrite(led, isOn ? HIGH : LOW);
   }

   writeOutput(smokerTemp);
}