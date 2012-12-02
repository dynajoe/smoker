int miPin = 4;
int scPin = 2;
int csPin = 7;
void setup()
{
  pinMode(miPin, INPUT);
  pinMode(scPin, OUTPUT);
  pinMode(csPin, OUTPUT);
  Serial.begin(9600);
  digitalWrite(csPin, HIGH); 
} 
void loop()
{
  digitalWrite(csPin, LOW);
  delay(10);
  digitalWrite(scPin, LOW);
  delay(10);
  int value = digitalRead(miPin);
  delay(10);
  digitalWrite(scPin, HIGH);
  delay(10);
  digitalWrite(scPin, LOW);
  delay(10);
  int value2 = digitalRead(miPin);
  delay(10);
  digitalWrite(scPin, HIGH);
  
  value = value * 256 + value2;
  value = value / 8;

  digitalWrite(csPin, HIGH);
  
  Serial.println(value * .25);
  
  delay(1000);
}

byte spiread(void) { 
  int i;
  byte d = 0;

  for (i=7; i>=0; i--)
  {
    digitalWrite(scPin, LOW);
    delay(1);
    if (digitalRead(miPin)) {
      //set the bit to 0 no matter what
      d |= (1 << i);
    }

    digitalWrite(scPin, HIGH);
    delay(1);
  }

  return d;
}
