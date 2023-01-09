import random 
import sys

def generate():
    return random.randint(0, 9)

print(generate())

print('First param:'+sys.argv[1])
print('Second param:'+sys.argv[2])