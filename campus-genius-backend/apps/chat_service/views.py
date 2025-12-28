import google.generativeai as genai
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.conf import settings
from django.utils import timezone
from .utils import get_db
import os

class ChatView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """
        Handle chat interaction:
        1. Receive user message
        2. Store user message in MongoDB
        3. Call Gemini AI
        4. Store AI response in MongoDB
        5. Return response
        """
        try:
            message = request.data.get('message')
            if not message:
                return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)

            user = request.user
            db = get_db()
            chat_logs = db.chat_logs

            # 1. Store User Message
            if db is not None:
                chat_entry = {
                    'user_id': user.id,
                    'email': user.email,
                    'role': 'user',
                    'message': message,
                    'timestamp': timezone.now()
                }
                chat_logs = db.chat_logs
                chat_logs.insert_one(chat_entry)
            else:
                 print("DEBUG: MongoDB unavailable, skipping chat log storage.")

            # 2. Call Gemini (with Fallback)
            api_key = getattr(settings, 'GEMINI_API_KEY', os.getenv('GEMINI_API_KEY'))
            if not api_key:
                return Response({'error': 'AI configuration missing'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            genai.configure(api_key=api_key)
            
            # List of models to try in order of preference
            models_to_try = [
                'gemini-1.5-flash', 
                'gemini-pro', 
                'gemini-1.0-pro', 
                'gemini-1.5-pro'
            ]
            ai_text = "I'm sorry, I am currently overloaded."
            
            success = False
            last_error = None

            # Attempt 1: Hardcoded models
            for model_name in models_to_try:
                try:
                    print(f"DEBUG: Trying model {model_name}")
                    model = genai.GenerativeModel(model_name)
                    chat_session = model.start_chat(history=[])
                    response = chat_session.send_message(message)
                    ai_text = response.text
                    success = True
                    break # Success!
                except Exception as e:
                    print(f"DEBUG: Failed with {model_name}: {e}")
                    last_error = e
            
            # Attempt 2: Dynamic Discovery if Hardcoded failed
            if not success:
                print("DEBUG: Hardcoded models failed. Attempting dynamic discovery...")
                try:
                    for m in genai.list_models():
                        if 'generateContent' in m.supported_generation_methods:
                            print(f"DEBUG: Discovered available model: {m.name}")
                            model = genai.GenerativeModel(m.name)
                            chat_session = model.start_chat(history=[])
                            response = chat_session.send_message(message)
                            ai_text = response.text
                            success = True
                            break
                except Exception as e:
                    print(f"DEBUG: Dynamic discovery failed: {e}")
                    last_error = e

            if not success:
                 raise last_error or Exception("All models (including dynamic discovery) failed")

            # 3. Store AI Response
            if db is not None:
                ai_entry = {
                    'user_id': user.id,
                    'email': user.email,
                    'role': 'ai',
                    'message': ai_text,
                    'timestamp': timezone.now()
                }
                chat_logs.insert_one(ai_entry)

            return Response({
                'reply': ai_text,
                'status': 'success'
            })

        except Exception as e:
            print(f"DEBUG: ChatView Error: {e}")
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get(self, request):
        """
        Retrieve chat history for the user.
        """
        try:
            db = get_db()
            if db is None:
                return Response([])
            
            chat_logs = db.chat_logs
            
            # Fetch last 50 messages for this user, sorted by timestamp
            cursor = chat_logs.find({'user_id': request.user.id}).sort('timestamp', 1).limit(50)
            
            history = []
            for doc in cursor:
                history.append({
                    'role': doc['role'],
                    'message': doc['message'],
                    'timestamp': doc['timestamp']
                })
                
            return Response(history)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
