import openai, os, sys
from pathlib import Path


def print_usage():
    print("USAGE: generate_audio.py INPUT_FILE OUTPUT_FILE API_KEY")
    sys.exit(1)

if len(sys.argv) < 2:
    print("ERROR: No input file provided")
    print_usage()

if len(sys.argv) < 3:
    print("ERROR: No output file provided")
    print_usage()

if len(sys.argv) < 4:
    elevenlabs_api_key = os.getenv("OPENAI_API_KEY")
else:
    elevenlabs_api_key = sys.argv[3]

if not elevenlabs_api_key:
    print("ERROR: No API key provided")
    print_usage()

input_file = sys.argv[1]
output_file = sys.argv[2]

client = openai.OpenAI()

# Call OpenAI Whisper API to transcribe the audio file
# (Replace this with actual Whisper API call)
response = client.audio.transcriptions.create(
    model='whisper-1',
    file=Path(input_file)
)

with open(output_file, 'r', encoding='utf-8') as f:
    f.write(response)
print(response)
