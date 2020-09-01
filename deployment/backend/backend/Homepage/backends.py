""" This is for handling general HTTP requests using JWT"""
import jwt
from django.http import HttpRequest
from django.conf import settings
from rest_framework import authentication, exceptions
from Homepage.models import *


class JWTAuthentication(authentication.BaseAuthentication):
    """ JWT authentication class """
    def authenticate(self, request):
        """ authenticate the token """
        request.user = None

        authentication_header_prefix = 'Token'

        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return None

        auth_header_split = auth_header.split()

        # Does not contain token cause length is too short
        if len(auth_header_split) == 1:
            return None

        # Header too long
        elif len(auth_header_split) > 2:
            return None

        prefix = auth_header_split[0]
        token = auth_header_split[1]

        # wrong header prefix, i.e. not 'token'
        if prefix.lower() != authentication_header_prefix.lower():
            return None

        # pass token to authenticate
        return self._authenticate_credentials(request, token)

    def _authenticate_credentials(self, request, token):
        """ authenticate with corresponding token and hash """
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms='HS256')
        except:
            msg = 'Could not authenticate. Token invalid.'
            raise exceptions.AuthenticationFailed(msg)

        try:
            user = User.objects.get(pk=payload['id'])
        except:
            msg = 'No user matched with this token.'
            raise exceptions.AuthenticationFailed(msg)

        return (user, token)


class CheckPermissions:
    """ check user permission """
    def __init__(self, User):
        """ init of the class """
        self.user = User

    def hasPerm(self, op, obj=None):
        """ check if the user is admin """
        if self.user is None:
            return False

        if self.user.is_superuser:
            return True

        if op == 'Create':
            if obj is None:
                return False

            return Administrator.objects.get(User=self.user, BookClub=obj).isAdmin

        if op == 'Admin Delete':
            if obj is None:
                return False

            return Administrator.objects.get(User=self.user, BookClub=obj.BookClub_ID).isAdmin

        if op == 'Thread Delete':
            if obj is None:
                return False

            if self.user == obj.User_ID:
                return True
            elif Administrator.objects.get(
                User=self.user, BookClub=obj.Discussion_ID.BookClub_ID).isAdmin:
                return True

        if op == 'Discussion Delete':
            if obj is None:
                return False

            if self.user == obj.User_ID:
                return True
            elif Administrator.objects.get(User=self.user, BookClub=obj.BookClub_ID).isAdmin:
                return True

        if op == 'Club Delete':
            if obj is None:
                return False

            return Administrator.objects.get(User=self.user, BookClub=obj).isAdmin

        if op == 'Set User':
            if obj is None:
                return False

            return self.user == obj

        if op == 'Set Club':
            if obj is None:
                return False

            return Administrator.objects.get(User=self.user, BookClub=obj).isAdmin

        return False
