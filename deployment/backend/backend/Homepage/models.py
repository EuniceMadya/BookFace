"""This is creating the data models for the data that the system will store"""

import time
import json
import jwt

from django.db import models
from django.conf import settings
from django.contrib.auth.models import (
    AbstractBaseUser, BaseUserManager, PermissionsMixin
)


# Customize UserManager class so we can set login fields as email+password
class UserManager(BaseUserManager):
    """User manager here"""

    def create_user(self, username, email, password=None):
        """Create normal user with given username, email and password"""
        if username is None:
            raise TypeError('Username required for registration.')
        if email is None:
            raise TypeError('Email required for registration.')
        if password is None:
            raise TypeError('Password required for registration.')

        user = self.model(username=username, email=self.normalize_email(email))
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, username, password, email):
        """Create admin user with given username, email and password"""
        user = self.create_user(username, email, password)
        user.is_superuser = True
        user.is_staff = True
        user.save()

        return user


# Create your models here.

# Users of the website
# Customized from the default django user to include a 'token' field,
# and to use email instead of username on authentication
class User(AbstractBaseUser, PermissionsMixin):
    """User model"""
    username = models.CharField(db_index=True, max_length=255, unique=True)
    email = models.EmailField(db_index=True, unique=True)
    profile_pic = models.TextField(default=
                "https://cdn.business2community.com/wp-content/uploads/2017/08/blank-profile-picture-973460_640.png",
                max_length=100000000)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'password']

    objects = UserManager()

    def __str__(self):
        """Changes how a user is shown in admin site to user id + name """
        return str(self.pk) + " " + self.username

    def pic(self):
        """returns user's profile_pic"""
        return self.profile_pic

    def token(self):
        """Return token"""
        return self._generate_jwt_token()

    def _generate_jwt_token(self):
        """Generate token with designated time and user's id, token is encrypted with HS256"""
        date_time = int(time.time() + 86400)

        token = jwt.encode({
            'id': self.pk,
            'exp': date_time
        }, settings.SECRET_KEY, algorithm='HS256')

        return token.decode('utf-8')


# The group of tables for the SEARCH function
class Tag(models.Model):
    """Tag model for book clubs"""
    Tag_ID = models.AutoField(primary_key=True)
    Name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        """Changes the way Tags are shown in the admin site to tag name """
        return self.Name


# Book Clubs of the website
class BookClub(models.Model):
    """Book club model"""
    BookClub_ID = models.AutoField(primary_key=True)
    Name = models.CharField(max_length=50, unique=True)
    Profile_Pic = models.TextField(max_length=100000000)
    Members = models.ManyToManyField(User, through='Administrator')
    Tags = models.ManyToManyField(Tag)
    Open = models.BooleanField(default=True)

    def __str__(self):
        """Changes the way BookClubs are shown in the admin site to book club id + name """
        return str(self.BookClub_ID) + " " + self.Name


# Administrators for each book club
class Administrator(models.Model):
    """Admin for the designated book club"""
    User = models.ForeignKey(User, on_delete=models.CASCADE)
    BookClub = models.ForeignKey(BookClub, on_delete=models.CASCADE)
    isAdmin = models.BooleanField()

    def __str__(self):
        """Changes the way Administrator objects are shown in the admin site to
        "User: <User_ID> Book club: <BookClub_ID>"""

        return "User: " + str(self.User.pk) + ' ' + 'Book club: ' + str(self.BookClub.pk)


# The group of tables for the POLL function
class Poll(models.Model):
    """Poll model for the book club """

    Poll_ID = models.AutoField(primary_key=True)
    End_Time = models.DateField()
    Title = models.CharField(max_length=100, default="No title")
    BookClub_ID = models.ForeignKey(BookClub, on_delete=models.CASCADE, default=-1)

    def __str__(self):
        """Changes the way Poll objects are shown in admin site to poll id """
        return str(self.Poll_ID)


class Choice(models.Model):
    """Choice model, for what choices each poll has"""
    Choice_ID = models.AutoField(primary_key=True)
    Description = models.CharField(max_length=100)
    Poll_ID = models.ForeignKey(Poll, on_delete=models.CASCADE, default=-1)

    def __str__(self):
        """Changes the way Choice objects are shown in admin site to choice id """
        return str(self.Choice_ID)


class Vote(models.Model):
    """Vote model, specifying what user voted for which choice"""
    Vote_ID = models.AutoField(primary_key=True)
    User_ID = models.ForeignKey(User, on_delete=models.CASCADE)
    Choice_ID = models.ForeignKey(Choice, on_delete=models.CASCADE, default=-1)

    def __str__(self):
        """Changes the way Vote objects are shown in admin site to vote id """
        return str(self.Vote_ID)


"""Unimplemented model for the Book object concept for meetings"""
# The group of tables for the MEETING function
# class Book(models.Model):
#     Book_ID = models.AutoField(primary_key=True)
#     Title = models.CharField(max_length=1000)
#
#     def __str__(self):
#         return str(self.Book_ID) + " " + self.Title


class Meeting(models.Model):
    """Meeting model of a book club"""
    Meeting_ID = models.AutoField(primary_key=True)
    Location = models.CharField(max_length=250)
    Time = models.DateTimeField()
    # Book = models.ForeignKey(Book, on_delete=models.CASCADE)
    Title = models.CharField(max_length=500, default="No title")
    BookClub_ID = models.ForeignKey(BookClub, on_delete=models.CASCADE, default=-1)

    def __str__(self):
        """Changes the way Meeting objects are shown in admin site to meeting ID"""
        return str(self.Meeting_ID)


class Attendance(models.Model):
    """Attendance of the meeting"""
    Attendance_ID = models.AutoField(primary_key=True)
    User_ID = models.ForeignKey(User, on_delete=models.CASCADE)
    Meeting_ID = models.ForeignKey(Meeting, on_delete=models.CASCADE, default=-1)

    def __str__(self):
        """Changes the way Attendance objects are shown in admin site to Attendance_ID"""
        return str(self.Attendance_ID)


# # The group of tables for the DISCUSSION function
class Discussion(models.Model):
    """Discussion model of a book club"""
    Discussion_ID = models.AutoField(primary_key=True)
    Time = models.DateTimeField()
    Title = models.CharField(max_length=100)
    BookClub_ID = models.ForeignKey(BookClub, on_delete=models.CASCADE, default=-1)
    User_ID = models.ForeignKey(User, on_delete=models.CASCADE, default=-1)

    def __str__(self):
        """Changes the way Discussion objects are shown in admin site to discussion id + title"""
        return str(self.Discussion_ID) + " " + self.Title


class Thread(models.Model):
    """Thread model within each discussion"""
    Thread_ID = models.AutoField(primary_key=True)
    Content = models.TextField(max_length=10000)
    Time = models.DateTimeField()
    User_ID = models.ForeignKey(User, on_delete=models.CASCADE)
    Discussion_ID = models.ForeignKey(Discussion, on_delete=models.CASCADE, default=-1)

    def __str__(self):
        """Changes the way Thread objects are shown in admin site to thread id"""
        return str(self.Thread_ID)
