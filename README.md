## PLEASE NOTE: This project requires the call of ChatGPT AI for the randomly created obituaries... which costs money the longer it runs, therefore it is no longer possible to create new obituaries as ive shut down the AI aspect in order to conserve money
# Obituary maker

Created a full stack application with React and AWS that generates obituaries for people (fictional or otherwise). Using [ChatGPT](https://openai.com/blog/chatgpt) to generate an obituary, [Amazon Polly](https://aws.amazon.com/polly/) to turn the obituary into speech, and [Cloudinary](https://cloudinary.com/) to store the speech and a picture of the deceased (may they rest in peace).

Contributions: 
Aly Mohamed
Findlay Brown

## Architecture Overview

<br/>
<p align="center">
  <img src="https://res.cloudinary.com/mkf/image/upload/v1680411648/last-show_dvjjez.svg" alt="the-last-show-architecture" width="800"/>
</p>
<br/>


## :page_with_curl: Notes

- All resources created on AWS with Terraform. Put all your configuration in the [`main.tf`](infra/main.tf) file
- AWS DynamoDB for the database
- [Lambda Function URLs](https://masoudkarimif.github.io/posts/aws-lambda-function-url/) to connect your backend to the frontend
- Lambda functions for this project:

  - `get-obituaries-<>`: to retrieve all the obituaries. Function URL only allows `GET` requests
  - `create-obituary-<>`: to create a new obituary. The function reads all the data (including the picture) from the body of the request. Function URL only allows `POST` requests
  - `generate-obituary` that uses ChatGPT
  - `read-obituary` that uses Amazon Polly
  - `store-files` that uses Cloudinary to store both the picture and speech
  - `save-item` that uses DynamoDB to store a new item
    
