import time
import boto3
import json
import requests
from requests_toolbelt.multipart import decoder
import base64
import os
import hashlib
from datetime import datetime


def lambda_handler(event, context):
    try:
        ssm = boto3.client('ssm')
        polly = boto3.client('polly')

        # cloudName = 'ds2sfekgu'

        timestamp = int(time.time())
        # print(f'timestamp: {timestamp}')

        # Retrieve the Cloudinary API key and secret from Parameter Store
        cloudApiKey = ssm.get_parameter(
            Name='/cloudinary/api_key', WithDecryption=True)['Parameter']['Value']
        cloudApiSecret = ssm.get_parameter(
            Name='/cloudinary/api_secret', WithDecryption=True)['Parameter']['Value']
        api_key_GPT = ssm.get_parameter(
            Name='/chatgpt/api_key', WithDecryption=True)['Parameter']['Value']

        # Parse the request body
        if event["isBase64Encoded"]:
            body = base64.b64decode(event['body'])
        else:
            body = event['body']

        # Get the image file from the request
        multipart_data = decoder.MultipartDecoder(
            body, event['headers']['content-type'])
        binary_data = [part.content for part in multipart_data.parts]
        imageKey = "obituary.png"
        imageFile = os.path.join("/tmp", imageKey)
        with open(imageFile, "wb") as f:
            f.write(binary_data[2])

        text = chatgpt(binary_data[3].decode(), binary_data[4].decode(
        ), binary_data[5].decode(), api_key_GPT)
        # text = "Hell is my world"

        # Polly -> text to speech
        response = polly.synthesize_speech(
            Text=text, VoiceId='Joanna', OutputFormat='mp3')
        audio_binary = response['AudioStream'].read()

        audioKey = "obituary.mp3"
        audioFile = os.path.join("/tmp", audioKey)
        with open(audioFile, "wb") as f:
            f.write(audio_binary)

        # Cloudinary Image upload
        resCloudJSON = cloudinaryUpload(
            cloudApiKey, timestamp, cloudApiSecret, imageFile, "image")

        image_url = resCloudJSON['secure_url']
        image_url = image_url.replace(
            "image/upload", "image/upload/e_art:zorro")

        resCloudJSON = cloudinaryUpload(
            cloudApiKey, timestamp, cloudApiSecret, audioFile, "video")

        audio_url = resCloudJSON['secure_url']
        # print(audio_url)

        # Save the obituary record to DynamoDB
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table('obituary-30139727')
        item = {
            'uuid': binary_data[0].decode(),
            'timeCreated': str(int(datetime.utcnow().timestamp())),
            'audio': audio_url,
            'image': image_url,
            'name': binary_data[3].decode(),
            'born': binary_data[4].decode(),
            'death': binary_data[5].decode(),
            'text': text,
            'key': binary_data[0].decode(),
        }
        table.put_item(Item=item)

        # Return the response

    except Exception as e:
        # Return error if any exception occurs
        return {
            'statusCode': 500,
            'body': json.dumps({
                "message": str(e)
            })
        }
    return {
        'statusCode': 200,
        'body': json.dumps({
            "message": "Worked",
            "data": item
        })
    }


def chatgpt(name, born, death, key):
    # Define the API endpoint URL
    url = 'https://api.openai.com/v1/completions'

    # Define the API key
    api_key = key

    # Define the headers for the API call
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}',
    }
    prompt = f"write an obituary about a fictional character named {name} who was born on {born} and died on {death}."
    # Define the data for the API call
    data = {
        'model': "text-curie-001",
        'prompt': prompt,
        'max_tokens': 600,
    }

    # Make the API call using the requests library
    response = requests.post(url, headers=headers, data=json.dumps(data))

    # Parse the JSON response
    # print("ChatGPT")
    # print(response.json())
    obituary = response.json()['choices'][0]['text'].strip()

    # Return the obituary as a string
    return obituary


def create_signature(body, api_secret):
    exclude = ["api_key", "resource_type", "cloud_name"]
    sorted_body = sort_dictionary(body, exclude)
    query_string = create_query_string(sorted_body)
    query_string_ap = f'{query_string}{api_secret}'
    hashed = hashlib.sha1(query_string_ap.encode())
    signature = hashed.hexdigest()
    return signature


def sort_dictionary(dictionary, exclude):
    return {k: v for k, v in sorted(dictionary.items(), key=lambda item: item[0]) if k not in exclude}


def create_query_string(body):
    query_string = ""
    for i, (k, v) in enumerate(body.items()):
        query_string = f'{k}={v}' if i == 0 else f'{query_string}&{k}={v}'

    return query_string


def upload_image(cloudApiKey, timestamp, cloudApiSecret, file_name):
    cloudName = 'ds2sfekgu'
    bodyImage = {
        "api_key": cloudApiKey,
        "timestamp": timestamp,
        "eager": "e_art:zorro,e_grayscale"
    }
    bodyImage["signature"] = create_signature(bodyImage, cloudApiSecret)

    fileImage = {
        "file": open(file_name, "rb")
    }
    imageUploadUrl = f"https://api.cloudinary.com/v1_1/{cloudName}/image/upload/"
    resCloud = requests.post(
        imageUploadUrl, files=fileImage, data=bodyImage)
    return resCloud.json()


def cloudinaryUpload(cloudApiKey, timestamp, cloudApiSecret, fileName, uploadType):
    cloudName = 'ds2sfekgu'
    body = {
        "api_key": cloudApiKey,
        "timestamp": timestamp
    }
    # if (uploadType == "image"):
    #     body["eager"] = "e_art:zorro"

    body["signature"] = create_signature(body, cloudApiSecret)

    fileImage = {
        "file": open(fileName, "rb")
    }
    imageUploadUrl = f"https://api.cloudinary.com/v1_1/{cloudName}/{uploadType}/upload/"
    resCloud = requests.post(
        imageUploadUrl, files=fileImage, data=body)
    return resCloud.json()
