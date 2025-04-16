import os
import sys

# Add the project root directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set the DJANGO_SETTINGS_MODULE environment variable
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'comcol_backend.settings')

import django
# Initialize Django
django.setup()

from comcol_backend.models import Computer
import requests
from bs4 import BeautifulSoup

def get_computer_name_and_url(computer_id):
    try:
        computer = Computer.objects.get(id=computer_id)
        return computer.name, computer.url
    except Computer.DoesNotExist:
        return None, None

def fetch_and_dump_content(url):
    response = requests.get(url)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, 'html.parser')
    # print( soup.get_text() )
    # print( "XXXX" )
    print('\n'.join([line.strip() for line in soup.get_text().splitlines() if line.strip()]))

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python gather.py <computer_id>")
        sys.exit(1)

    computer_id = int(sys.argv[1])
    name, url = get_computer_name_and_url(computer_id)

    if not url:
        print(f"No URL found for computer with ID {computer_id}")
        sys.exit(1)

    print(f"I am looking for information on a computer called :'{name}'")
    print( "Please extract the year at which the computer was released.")

    print( f"Here is the text dump of the wikipedia page about {name}:")
    print( "-----------------------------------")
    fetch_and_dump_content(url)
    print( "-----------------------------------")
    print( """
Remember, I want:
Please extract the year at which the computer was released. (YEAR=)
Please extract the maker/brand of the computer. (BRAND=)
Please extract the CPU/processor used in the computer. (CPU=)
Please extract the frequency of the CPU of the computer (MHz=)
Please extract the range of number of units made/sold (Units=)
Skip lines for info you don't have/are not sure.
Only use information from the provided text.
All output must be in the form of: XXX=""")

