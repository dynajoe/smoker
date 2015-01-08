echo 19 > /sys/class/gpio/export

echo "in" > /sys/class/gpio/gpio19/direction

echo 1 > /sys/class/gpio/gpio19/value
