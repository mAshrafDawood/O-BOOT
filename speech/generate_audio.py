#!/usr/bin/env python3

from elevenlabs import set_api_key, save, generate, Voice, VoiceSettings
import sys
import os

def print_usage():
    print("USAGE: generate.py INPUT_FILE OUTPUT_FILE [API_KEY]")
    sys.exit(1)

if len(sys.argv) < 2:
    print("ERROR: No input file provided")
    print_usage()

if len(sys.argv) < 3:
    print("ERROR: No output file provided")
    print_usage()

if len(sys.argv) < 4:
    elevenlabs_api_key = os.getenv("ELEVENLABS_API_KEY")
else:
    elevenlabs_api_key = sys.argv[3]

if not elevenlabs_api_key:
    print("ERROR: No API key provided")
    print_usage()

set_api_key(elevenlabs_api_key)

input_file = sys.argv[1]
output_file = sys.argv[2]

with open(input_file, "r", encoding="utf-8") as f:
    input_text = f.read()


audio = generate(
    text=input_text,
    voice=Voice(
        voice_id="ipTIeZxLDCu8TKssiYoG",
        settings=VoiceSettings(
            stability=0.35,
            similarity_boost=1,
            style=0.13,
            use_speaker_boost=True
        )
    ),
    model="eleven_multilingual_v2"
)

save(audio, output_file)
