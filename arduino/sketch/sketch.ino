int relayPin = 11;
int thermoDO = 10;
int thermoCS = 8;
int thermoCLK = 9;
int led = 13;
String serialInput = "";

boolean isOn = false;
int desiredTemp = 210;
int threshold = 5;
boolean automatic = true;
double lastReading = -256;
long lastReadingTime = 0;
double rateOfChange = 0.0;

void printFloat(float value, int places) {
  // this is used to cast digits
  int digit;
  float tens = 0.1;
  int tenscount = 0;
  int i;
  float tempfloat = value;

    // make sure we round properly. this could use pow from <math.h>, but doesn't seem worth the import
  // if this rounding step isn't here, the value  54.321 prints as 54.3209

  // calculate rounding term d:   0.5/pow(10,places)
  float d = 0.5;
  if (value < 0)
    d *= -1.0;
  // divide by ten for each decimal place
  for (i = 0; i < places; i++)
    d/= 10.0;
  // this small addition, combined with truncation will round our values properly
  tempfloat +=  d;

  // first get value tens to be the large power of ten less than value
  // tenscount isn't necessary but it would be useful if you wanted to know after this how many chars the number will take

  if (value < 0)
    tempfloat *= -1.0;
  while ((tens * 10.0) <= tempfloat) {
    tens *= 10.0;
    tenscount += 1;
  }


  // write out the negative if needed
  if (value < 0)
    Serial.print('-');

  if (tenscount == 0)
    Serial.print(0, DEC);

  for (i=0; i< tenscount; i++) {
    digit = (int) (tempfloat/tens);
    Serial.print(digit, DEC);
    tempfloat = tempfloat - ((float)digit * tens);
    tens /= 10.0;
  }

  // if no places after decimal, stop now and return
  if (places <= 0)
    return;

  // otherwise, write the point and continue on
  Serial.print('.');

  // now write out each decimal place by shifting digits one by one into the ones place and writing the truncated value
  for (i = 0; i < places; i++) {
    tempfloat *= 10.0;
    digit = (int) tempfloat;
    Serial.print(digit,DEC);
    // once written, subtract off that digit
    tempfloat = tempfloat - (float) digit;
  }
}


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

void setup() {
   Serial.begin(9600);

   delay(500);

   pinMode(led, OUTPUT);
   pinMode(relayPin, OUTPUT);
   pinMode(thermoCS, OUTPUT);
   pinMode(thermoCLK, OUTPUT);
   pinMode(thermoDO, INPUT);

   digitalWrite(thermoCS, HIGH);
}

void doCommand(String data) {
   char command = data.charAt(0);

   if (command == 's' && data.length() > 1) {
     desiredTemp = data.substring(1).toInt();
   }
   else if (command == 't' && data.length() > 1) {
     threshold = data.substring(1).toInt();
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
}

void processCommands() {
   while (Serial.available()) {
      char character = Serial.read();
      if (character == '\n') {
         serialInput.trim();
         doCommand(serialInput);
         serialInput = "";
      }
      else {
         serialInput.concat(character);
      }
   }
}

boolean readBit() {
   digitalWrite(thermoCLK,HIGH);
   delay(1);
   boolean value = digitalRead(thermoDO);
   digitalWrite(thermoCLK,LOW);

   return value;
}

double getThermocoupleTemp() {
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

void determineState(double temp) {
   // change per second
   rateOfChange = 1000.0 * (temp - lastReading) / (1.0 * (millis() - lastReadingTime));

   if (temp < desiredTemp) {
      isOn = true;
   }
   else if (temp > desiredTemp + threshold) {
      isOn = false;
   }

   lastReading = temp;
   lastReadingTime = millis();
}

void writeOutput(double smokerTemp) {
   Serial.print(automatic ? 'A' : 'M'); //0
   Serial.print(',');
   Serial.print(smokerTemp); //1
   Serial.print(',');
   printFloat(rateOfChange, 3); //2
   Serial.print(',');
   Serial.print(isOn ? "on" : "off"); //3
   Serial.print(',');
   Serial.print(millis() / 1000L); //4
   Serial.print(',');
   Serial.print(readVcc() / 1000.0); //5

   if (automatic) {
     Serial.print(',');
     Serial.print(desiredTemp);
     Serial.print(',');
     Serial.print(threshold);
   }

   Serial.println();
}

void loop() {
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


