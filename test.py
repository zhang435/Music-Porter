import time
import sys
print "\x1b[2;34m word\x1b[0m"
for i in range(100):
    sys.stdout.write("\r")
    sys.stdout.write(str(i))
    sys.stdout.flush()
    time.sleep(1)
