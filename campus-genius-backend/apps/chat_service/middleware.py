from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.conf import settings
import jwt
from urllib.parse import parse_qs

User = get_user_model()

@database_sync_to_async
def get_user(user_id):
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return AnonymousUser()

class JWTAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        # Dictionary headers
        headers = dict(scope['headers'])
        
        # Try to get token from Query String (?token=...)
        query_string = parse_qs(scope['query_string'].decode())
        token = query_string.get('token', [None])[0]

        # If not in query, try Authorization header (standard for some clients, hard for browsers)
        if not token and b'authorization' in headers:
            try:
                auth_header = headers[b'authorization'].decode().split()
                if len(auth_header) == 2 and auth_header[0].lower() == 'bearer':
                    token = auth_header[1]
            except:
                pass

        if token:
            print(f"DEBUG: JWT Middleware found token: {token[:15]}...")
            try:
                # Decode JWT
                signing_key = settings.SIMPLE_JWT.get('SIGNING_KEY', settings.SECRET_KEY)
                
                payload = jwt.decode(token, signing_key, algorithms=["HS256"])
                user_id = payload.get('user_id')
                
                if user_id:
                    scope['user'] = await get_user(user_id)
                    print(f"DEBUG: JWT Auth Success. User: {scope['user']}")
                else:
                    print("DEBUG: JWT Payload missing user_id")
                    scope['user'] = AnonymousUser()
            except jwt.ExpiredSignatureError:
                print("DEBUG: JWT Expired")
                scope['user'] = AnonymousUser()
            except jwt.DecodeError:
                print("DEBUG: JWT Decode Error")
                scope['user'] = AnonymousUser()
            except Exception as e:
                print(f"DEBUG: JWT Auth Error: {e}")
                scope['user'] = AnonymousUser()
        else:
            print("DEBUG: No token found in query or headers")
            scope['user'] = AnonymousUser()

        return await self.inner(scope, receive, send)
