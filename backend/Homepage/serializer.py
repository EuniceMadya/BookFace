# reference: https://thinkster.io/tutorials/django-json-api/authentication
""" Serializer here allows complex data such as querysets and model instances
    to be converted to native Python datatypes
    that can then be easily rendered into JSON. """

from django.contrib.auth import authenticate
from rest_framework import serializers
from Homepage.models import *
from datetime import datetime


class RegistrationSerializer(serializers.ModelSerializer):
    """For registration of a user """
    password = serializers.CharField(
        max_length=20,
        # min_length = ?
        write_only=True
    )

    # No token needed for registration
    token = serializers.CharField(max_length=255, read_only=True)

    class Meta:
        """Fields of user"""
        model = User
        # modify this to add/remove fields to be included in response
        fields = ['email', 'username', 'password', 'token', 'id']

    def create(self, validated_data):
        """Create a user with paramaters given"""
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.ModelSerializer):
    """For user login"""
    # write_only if you want the data to show in data
    email = serializers.EmailField(max_length=255, write_only=True)
    password = serializers.CharField(max_length=20, write_only=True)
    # read_only if you want data to show up in validated_data
    id = serializers.IntegerField(read_only=True)
    profile_pic = serializers.ImageField(read_only=True)
    token = serializers.CharField(max_length=255, read_only=True)

    class Meta:
        """Fields of user"""
        model = User
        # modify this to add/remove fields to be included in response
        fields = ['email', 'password', 'token', 'id', 'profile_pic']

    def validate(self, data):
        """Validate if the user credential is correct"""
        email = data.get('email', None)
        password = data.get('password', None)

        if email is None:
            raise serializers.ValidationError(
                'An email address is required to log in.'
            )

        if password is None:
            raise serializers.ValidationError(
                'A password is required to log in.'
            )

        user = authenticate(username=email, password=password)

        if user is None:
            raise serializers.ValidationError(
                'Log in failed. Please make sure that email or password are correctly entered.'
            )

        return {
            'id': user.id,
            'token': user.token,
            'profile_pic': user.profile_pic
        }


class BookClubListSerializer(serializers.ModelSerializer):
    """For book club queries"""

    class Meta:
        """Fields to include from BookClub model"""
        model = BookClub
        fields = ('BookClub_ID', 'Name', 'Profile_Pic')


class ThreadUserSerializer(serializers.ModelSerializer):
    """For thread user queries"""
    class Meta:
        """Fields to include from User model"""
        model = User
        fields = ('username', 'profile_pic')


class DiscussionSerializer(serializers.ModelSerializer):
    """For discussion queries"""
    User_ID = ThreadUserSerializer(read_only=True)

    class Meta:
        """Fields to include from Discussion model"""
        model = Discussion
        fields = ('Discussion_ID', 'Title', 'Time', 'User_ID')


class ThreadSerializer(serializers.ModelSerializer):
    """For threads queries"""
    User_ID = ThreadUserSerializer(read_only=True)

    class Meta:
        """Fields to include from Thread model"""
        model = Thread
        fields = ('Thread_ID', 'Content', 'Time', 'User_ID')


class PollSerializer(serializers.ModelSerializer):
    """For poll queries"""
    class Meta:
        """Fields to include from Poll model"""
        model = Poll
        fields = ('Poll_ID', 'End_Time', 'Title')


class PollInfoSerializer(serializers.ModelSerializer):
    """For poll information queries"""
    vote_count = serializers.IntegerField()
    user_vote = serializers.IntegerField()

    class Meta:
        """Fields to include from Choice model"""
        model = Choice
        fields = ('Choice_ID', 'Description', 'vote_count', 'user_vote')


"""Query for Book objects which are unimplemented"""
# class BookSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Book
#         fields = 'Title'


class MeetingSerializer(serializers.ModelSerializer):
    """For meeting queries"""
    # Book = BookSerializer(read_only=True)
    user_attendance = serializers.IntegerField()

    class Meta:
        """Fields to include from Meeting model"""
        model = Meeting
        fields = ('Meeting_ID', 'Title', 'Location', 'Time', 'user_attendance')


class BookClubSearchSerializer(serializers.ModelSerializer):
    """For searching book club queries queries"""
    class Meta:
        """Fields to include from BookClub model"""
        model = BookClub
        fields = ('Name', 'BookClub_ID', 'Profile_Pic', 'Open')


class MemberSerializer(serializers.ModelSerializer):
    """For book club admin queries"""
    class Meta:
        """Fields to include from Administrator model"""
        model = Administrator
        fields = ('BookClub', 'User', 'isAdmin')


"""Unimplemented queries of Book objects based on Title functionality"""
# class BookSearchSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Book
#         fields = ('Book_ID', 'Title')


class UserSerializer(serializers.ModelSerializer):
    """For single user query"""
    class Meta:
        """Fields to include from User model"""
        model = User
        fields = ('email', 'username', 'profile_pic')
