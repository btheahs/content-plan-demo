'''
import os
import csv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, validator
from fastapi.middleware.cors import CORSMiddleware
from modal import Stub, Image, asgi_app, Secret
from openai import OpenAI
from dotenv import load_dotenv
from typing import List, Optional
from datetime import datetime
import numpy as np
import scikit-learn as sklearn
from sklearn.metrics.pairwise import cosine_similarity

load_dotenv()

stub = Stub("content-plan-app")
image = Image.debian_slim().pip_install("fastapi", "openai", "pydantic", "python-dotenv", "numpy", "scikit-learn")

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
web_app = FastAPI()

# CORS middleware setup
web_app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", 'https://btheahs--content-plan-app-fastapi-app-dev.modal.run'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class Task(BaseModel):
    id: Optional[int]
    name: str
    estimate: str
    assignee: str
    priority: str
    est_revenue: float

class TaskDetails(BaseModel):
    id: int
    name: str
    description: str
    status: str
    revenue: float
    headlineSuggestions: str
    bodyCopySuggestions: str

class ContentPlan(BaseModel):
    id: Optional[int] = None
    tags: str
    time_frame: str
    priority: str
    description: str
    start_date: datetime
    deadline_date: datetime
    project_name: str

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

    @validator('start_date', 'deadline_date', pre=True)
    def parse_datetime(cls, value):
        if isinstance(value, str):
            return datetime.fromisoformat(value)
        return value

# Vector database (simple implementation)
class VectorDB:
    def __init__(self):
        self.embeddings = []
        self.texts = []

    def add(self, embedding, text):
        self.embeddings.append(embedding)
        self.texts.append(text)

    def search(self, query_embedding, top_k=5):
        similarities = cosine_similarity([query_embedding], self.embeddings)[0]
        top_indices = np.argsort(similarities)[-top_k:][::-1]
        return [self.texts[i] for i in top_indices]

vector_db = VectorDB()

def read_csv(file_path):
    data = []
    try:
        with open(file_path, newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                data.append(row)
    except FileNotFoundError:
        print(f"File not found: {file_path}")
    return data

def process_and_embed_data():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    products = read_csv( 'product_data_cleaned.csv')
    metrics = read_csv('SMS.csv')

    for product in products:
        text = f"Product: {product['name']}, Description: {product['description']}, Price: ${product['price']}"
        embedding = get_embedding(text)
        vector_db.add(embedding, text)

    for metric in metrics:
        text = f"Metric: {metric['metric_name']}, Value: {metric['value']}, Date: {metric['date']}"
        embedding = get_embedding(text)
        vector_db.add(embedding, text)

def get_embedding(text):
    response = client.embeddings.create(input=text, model="text-embedding-ada-002")
    return response.data[0].embedding

def get_relevant_context(query, top_k=5):
    query_embedding = get_embedding(query)
    return vector_db.search(query_embedding, top_k)

def generate_content_plan(plan_details):
    try:
        formatted_details = plan_details.dict()
        formatted_details['start_date'] = plan_details.start_date.strftime('%Y-%m-%d')
        formatted_details['deadline_date'] = plan_details.deadline_date.strftime('%Y-%m-%d')

        query = f"{plan_details.tags} {plan_details.description}"
        relevant_context = get_relevant_context(query)
        context_text = "\n".join(relevant_context)

        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert content planner. take into account the tags and key metrics and create a content plan described by the user. Use the provided context to create a detailed content plan that consists tasks separated by semicolons. Each task should have a name, time estimate, assignee, priority, status (e.g. in progress), estimated revenue (don't include commas and add a space after the number), separated by commas. Include nothing else, not even the task categories. just the text."},
                {"role": "user", "content": 
                    f"""Content Plan Details: {formatted_details}"""
                    
                   
                }
            ]
        )
        print("response is,   ", response)
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error in generating content plan: {str(e)}")
        raise HTTPException(status_code=503, detail="Content generation service unavailable")

@web_app.post("/campaign")
async def handle_campaign(item: ContentPlan):
    campaign_text = generate_content_plan(item)
    return {"campaign_text": campaign_text}

@web_app.get("/content-plan")
async def get_content_plan(item: TaskDetails):
    try:
        # Here you would typically fetch the content plan from a database
        # For this example, we'll generate a placeholder response
        return {
            "id": item.id,
            "name": item.name,
            "description": item.description,
            "status": item.status,
            "tasks": [
                Task(id=1, name="Sample Task", estimate="2h", assignee="John Doe", priority="High", est_revenue=1000.0)
            ]
        }
    except Exception as e:
        print(f"Error fetching content plan: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching content plan")

@web_app.get("/task-details/{task_id}")
async def get_task_details(task_id: int):
    try:
        # Placeholder for task fetching logic
        task = {"id": task_id, "name": f"Task {task_id}", "description": "Sample task"}
        
        prompt = f"Generate a headline and body copy for an email about: {task['name']}"
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a creative copywriter."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=150
        )
        
        content = response.choices[0].message.content
        headline, body_copy = content.split('\n\n', 1) if '\n\n' in content else (content, "")

        return TaskDetails(
            id=task['id'],
            name=task['name'],
            description=task['description'],
            status="In Progress",
            revenue=1000,  # Placeholder value
            headlineSuggestions=headline,
            bodyCopySuggestions=body_copy
        )
    except Exception as e:
        print(f"Error generating task details: {str(e)}")
        raise HTTPException(status_code=500, detail="Error generating task details")

@stub.function(image=image, secrets=[Secret.from_name("my-openai-secret")])
@asgi_app()
def fastapi_app():
    process_and_embed_data()  # Process and embed data on startup
    return web_app

if __name__ == "__main__":
    stub.deploy("content-plan-app")
'''

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, validator
from fastapi.middleware.cors import CORSMiddleware
import modal
from modal import App, Image, asgi_app, Secret
from openai import OpenAI
import os
import csv
from dotenv import load_dotenv
from typing import List, Optional
from datetime import datetime
script_directory = os.path.dirname(os.path.abspath(__file__))
import codecs
load_dotenv(os.path.join(script_directory,'.env.local'))
from typing import List, Dict
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
print("Current working directory:", os.getcwd())
print("hello am here")


client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))
web_app = FastAPI()
app = App("content-plan-app")

web_app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000",  'https://btheahs--content-plan-app-fastapi-app-dev.modal.run'],  # Update this with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

image = (
    Image.debian_slim()
    .pip_install(
        "fastapi",
        "openai",
        "pydantic",
        "python-dotenv",
        "scikit-learn"
    )
    #.copy_local_dir("src", "/root/src") 
    .copy_local_dir("data", "/root/src/data")
)

class Task(BaseModel):
    id: Optional[int]
    tags: str
    estimate: str
    assignee: str
    priority: str
    est_revenue: float
class TaskDetails(BaseModel):
    id: int
    name: str
    description: str
    status: str
    revenue: float
    headlineSuggestions: str
    bodyCopySuggestions: str

class ContentPlan(BaseModel):
    id: Optional[int] = None
    tags: str
    key_metrics: str
    priority: str
    description: str
    start_date: datetime
    deadline_date: datetime
    project_name: str

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

    @validator('start_date', 'deadline_date', pre=True)
    def parse_datetime(cls, value):
        if isinstance(value, str):
            return datetime.fromisoformat(value)
        return value
   # owner: str
    #assignees: List[str]
   # priority: str
    #deadline: date
    #tasks: List[Task]
content_plans = []
def process_csv(file_path):
    results = []
    with open(file_path, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            results.append(row)
    return results

def create_additional_context():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    #data_dir = os.path.join(script_dir, 'data')
    
    #products_path = os.path.join(data_dir, 'product_data_cleaned.csv')
    #emails_path = 'src/product_data_cleaned.csv'
    
    metrics_path = 'data/SMS.csv'

    #products = process_csv(products_path)
   #emails = process_csv(emails_path)
    metrics = process_csv(metrics_path)

    #sample_products = products #'; '.join([f"{p['name']}: {p['description']} (Price: ${p['price']})" for p in products[:5]])
    #email_templates = emails #'; '.join([f"{e['subject']}: {e['snippet']}" for e in emails[:3]])
    performance_metrics = metrics #'; '.join([f"{m['metric_name']}: {m['value']} (Date: {m['date']})" for m in metrics[:5]])

    return {
        #"sample_products": sample_products,
        #"email_templates": emails,
        "performance_metrics": performance_metrics
    }

def generate_content_plan(plan_details): #additional_context
    try:
        #additional_context=create_additional_context()
        formatted_details = plan_details.dict()
        formatted_details['start_date'] = plan_details.start_date.strftime('%Y-%m-%d')
        formatted_details['deadline_date'] = plan_details.deadline_date.strftime('%Y-%m-%d')
        formatted_details['description'] = "generate a content plan with 2 emails, one Tuesday for new handbags arrivals in evergreen, one Saturday about new apparel arrivals. Also generate two sms message tasks, one Wednesday about new arrivals in evergreen and one Friday about new apparel. Also generate one paid social task about new evergreen and one organic social task about Clare’s picks."

        print(formatted_details)
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert content planner. take into account the tags and key metrics and create a content plan described by the user. Use the provided context to create a detailed content plan that consists tasks separated by semicolons. Each task should have a name, time estimate, assignee, priority, status (e.g. in progress), estimated revenue (don't include commas and add a space after the number), separated by commas. Include nothing else, not even the task categories. just the text. "},
                {"role": "user", "content": 
                    f"""Here is the input for the content you are createing: {formatted_details}.
                    As an example, here are previous tasks. Take into account the revenue and styles please:
                    
                    July Week 4: Tuesday 7/23 Email, 2 hours, Meg B, Medium,  $16776.21; 
                    July Week 4: Tuesday 7/23 Email, 1 hour, Matt S, Low, $6,071.06;
                    August Week 4: Tuesday 8/20 Email, 1 d, Sarah H, High, $14,986.50
                    August Week 4: Thursday 8/22 SMS - Evergreen Back in Stock, Jodie P, High, $43,683.25





                    """
                }

            ]
        )
        print("HERE WE ARE ok? ",response.choices[0].message.content)
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error in generating content plan: {str(e)}")
        raise HTTPException(status_code=503, detail="OpenAI service unavailable")
'''Additional context:
                    Sample Products: {additional_context['sample_products']}
                    Email Templates: {additional_context['email_templates']}
                    Performance Metrics: {additional_context['performance_metrics
'''



def get_task_details(task):
    # In a real application, you would fetch the task details from your database
    #fetch from props
    #task = find_task_by_id(task_id)  # Implement this function
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Generate headline and body copy suggestions using OpenAI
    prompt = f"Generate a headline and body copy for an email about: {task}"
    response = client.chat.completions.create(
        engine="gpt-4",
        prompt=prompt,
        max_tokens=150,
        n=1,
        stop=None,
        temperature=0.7,
    )
    
    suggestions = response.choices[0].text.strip().split('\n\n')
    headline = suggestions[0] if len(suggestions) > 0 else ""
    body_copy = suggestions[1] if len(suggestions) > 1 else ""

    return TaskDetails(
        id=task.id,
        name=task.name,
        description=task.description,
        status=task.status,
        revenue=task.revenue,
        headlineSuggestions=headline,
        bodyCopySuggestions=body_copy
    )

@web_app.post("/campaign")
async def handle_campaign(item: ContentPlan):
    # Convert string dates to datetime objects if necessary
    #if isinstance(item.start_date, str):
        #item.start_date = datetime.fromisoformat(item.start_date)
    #if isinstance(item.deadline_date, str):
        #item.deadline_date = datetime.fromisoformat(item.deadline_date)
    print("here is the prompt", item)
    campaign_text = generate_content_plan(item)
    
    # Parse the generated tasks
    #tasks = [Task(*task.split(',')) for task in campaign_text.split(';')]
    
    return {"id": "1", "campaign_text": campaign_text}
'''
@web_app.get("/content-plan/{plan_id}")
async def get_content_plan(plan_id: int):
    # Fetch the plan from your database or storage
    plan = fetch_plan_from_database(plan_id)  # Implement this function
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Generate or fetch the campaign text
    campaign_text = generate_content_plan(plan)
    
    return {"plan": plan, "campaign_text": campaign_text}
'''
@web_app.get("/content-plan")
async def get_content_plan():
    # This endpoint might need to be adjusted based on your specific requirements
    # For now, it returns a placeholder response
    return {"message": "Content plan retrieval not implemented"}
class ImageInfo(BaseModel):
    name: str
    url: str
    size: str
    tags: List[str]


def get_relevant_context(query: str, csv_directory: str = "data") -> str:
    script_dir = os.path.dirname(os.path.abspath(__file__))
    full_csv_directory = os.path.join(script_dir, csv_directory)
    if not os.path.exists(full_csv_directory):
        raise FileNotFoundError(f"CSV directory not found: {csv_directory}")

    # Get all CSV files in the directory
    csv_files = [f for f in os.listdir(full_csv_directory) if f.endswith('.csv')]
    
    if not csv_files:
        raise FileNotFoundError(f"No CSV files found in directory: {csv_directory}")

    all_data: List[Dict[str, str]] = []
    
    # Read all CSV files
    for file in csv_files:
        file_path = os.path.join(full_csv_directory, file)
        with open(file_path, 'r', newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            all_data.extend(list(reader))
    print('all_data',all_data)
    # Prepare data for TF-IDF
    documents = [' '.join(row.values()) for row in all_data]
    documents.append(query)
    print("query isssss: ", query)
    # Create TF-IDF matrix
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(documents)

    # Calculate cosine similarity
    cosine_similarities = cosine_similarity(tfidf_matrix[-1], tfidf_matrix[:-1]).flatten()

    # Get top 5 most relevant rows
    top_indices = cosine_similarities.argsort()[-5:][::-1]
    relevant_rows = [all_data[i] for i in top_indices]

    # Format relevant data as a string
    context = "\n".join([f"{k}: {v}" for row in relevant_rows for k, v in row.items()])
    print("made it hereeeeeeeeee")
    return context


@web_app.post("/chatbot")
async def chatbot_query(query: str):
    try:
        # Fetch relevant data from your CSVs
        context = get_relevant_context(query)
        print("context is", context)
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that can query and analyze data from the user's projects and tasks."},
                {"role": "user", "content": f"Context:\n{context}\n\nQuery: {query}"}
            ]
        )
        print("resposne issss: ")
        return {"response": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.function(mounts=[modal.Mount.from_local_dir("./src/data", remote_path="/root/src/data")], image=image, secrets=[Secret.from_name("my-openai-secret")])
@asgi_app()
def fastapi_app():
    return web_app

if __name__ == "__main__":
    app.deploy("webapp")
