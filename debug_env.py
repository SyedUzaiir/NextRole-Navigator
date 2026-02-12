from dotenv import load_dotenv
import os

load_dotenv('.env.local')
uri = os.getenv('MONGODB_URI')
with open('uri.txt', 'w') as f:
    f.write(uri)
print("URI written to uri.txt")
