from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()

app = FastAPI(title="CampusGenius AI Services")

# Initialize Gemini
# model="gemini-pro" is a good default for text generation
llm = ChatGoogleGenerativeAI(model="gemini-pro", google_api_key=os.getenv("GEMINI_API_KEY"))

@app.get("/")
def read_root():
    return {"message": "Hello from CampusGenius AI Service (Powered by Gemini)"}

class TextInput(BaseModel):
    text: str
    max_length: Optional[int] = 200

class MeetingInput(BaseModel):
    transcript: str
    max_length: Optional[int] = 300

class QuizInput(BaseModel):
    content: str
    num_questions: Optional[int] = 5
    difficulty: Optional[str] = "medium"

class ChatInput(BaseModel):
    query: str
    context: Optional[str] = None

class VideoInput(BaseModel):
    transcript: str
    max_length: Optional[int] = 300

# Helper function to generate response
async def generate_response(prompt_text: str):
    try:
        response = llm.invoke(prompt_text)
        return response.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/summarize-text")
async def summarize_text(input: TextInput):
    prompt = f"Summarize the following text in {input.max_length} words or less: {input.text}"
    result = await generate_response(prompt)
    return {"summary": result}

@app.post("/ai/summarize-meeting")
async def summarize_meeting(input: MeetingInput):
    prompt = f"Summarize the following meeting transcript in {input.max_length} words or less, highlighting key points and action items: {input.transcript}"
    result = await generate_response(prompt)
    return {"summary": result}

@app.post("/ai/generate-quiz")
async def generate_quiz(input: QuizInput):
    prompt = f"Generate {input.num_questions} {input.difficulty} difficulty quiz questions based on the following content. Include multiple choice options and correct answers: {input.content}"
    result = await generate_response(prompt)
    return {"quiz": result}

@app.post("/ai/chatbot")
async def chatbot(input: ChatInput):
    context_str = f"Context: {input.context}\n\n" if input.context else ""
    prompt = f"{context_str}Question: {input.query}\n\nAnswer:"
    result = await generate_response(prompt)
    return {"response": result}

@app.post("/ai/summarize-video")
async def summarize_video(input: VideoInput):
    prompt = f"Summarize the following video transcript in {input.max_length} words or less, highlighting key points and main topics: {input.transcript}"
    result = await generate_response(prompt)
    return {"summary": result}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
