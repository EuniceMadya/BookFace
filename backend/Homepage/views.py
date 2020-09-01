# from django.shortcuts import render
# from django.http import HttpResponse
# from django.core import serializers
""" Views corresponding to the urls for sending the request back to front end"""
from datetime import datetime
import json

from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count, Subquery, OuterRef
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone
import jwt
from Homepage.backends import JWTAuthentication, CheckPermissions
from Homepage.models import *
from Homepage.serializer import *

from .decryption import decrypt_request_pwd


# Create your views here.
# view for REGISTER function
# @INPUT: Request should have body that includes "username", "email" and "password" in a JSON format
# @OUTPUT: Specified fields in RegistrationSerializer (except password), in a JSON format
class RegistrationAPIView(APIView):
    """ Registration view """
    permission_classes = (AllowAny,)
    serializer_class = RegistrationSerializer

    def post(self, request):
        """ Reply 200 status code if registration succeeded """
        password = request.data['password']
        request.data['password'] = decrypt_request_pwd(password)
        serializer = RegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)


# view for LOGIN function
# @INPUT: Body should include "email" and "password" in a JSON format
# @OUTPUT: id, profile_pic and token in a JSON format
class LoginAPIView(APIView):
    """ Log in view"""
    permission_classes = (AllowAny,)
    serializer_class = LoginSerializer

    def post(self, request):
        """ Reply 200 status code if log in succeeded """
        password = request.data['password']
        if password is not None:
            request.data['password'] = decrypt_request_pwd(password)

        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)


        return Response(serializer.data, status=status.HTTP_200_OK)


class BookClubAPIViewSet(viewsets.ViewSet):
    """ Set of book club functionality related viewes """
    permission_classes = (IsAuthenticated,)

    # view to GET user book clubs
    # @INPUT: token in authorization header, POST request with user_id as 'id'
    # @OUTPUT: List of joined book clubs of the given user id
    def get_user_bookclub(self, request):
        """ Get the user's joined clubs if token is valid"""
        id = request.data.get('id', {})
        book_clubs = BookClub.objects.filter(Members=id)
        serializer = BookClubListSerializer(book_clubs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # @INPUT: BookClub_ID
    # @OUTPUT: BookClub_ID, profile_pic, Name and Open
    def get_single_bookclub(self, request):
        """ Get info for the given book club id if token is valid"""
        id = request.data.get('BookClub_ID', {})
        book_club = BookClub.objects.get(pk=id)
        serializer = BookClubSearchSerializer(book_club)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # @INPUT: Name, Profile_Pic, Tags as a JSON array, User_ID
    # @OUTPUT: BookClub_ID, Profile_Pic, Name of new book club, 201_CREATED
    def create_bookclub(self, request):
        """ create a new book club if the token is valid"""
        Name = request.data.get('Name', {})
        Profile_Pic = request.data.get('Profile_Pic', {})
        Tags = request.data.get('Tags', {})
        Owner = User.objects.get(pk=request.data.get('User_ID', {}))

        New_club = BookClub(Name=Name, Profile_Pic=Profile_Pic)
        New_club.save()
        New_club = BookClub.objects.get(pk=New_club.BookClub_ID)
        for tag in Tags:
            tag_obj, created = Tag.objects.get_or_create(Name=tag)
            New_club.Tags.add(tag_obj)
        new_member = Administrator(User=Owner, BookClub=New_club, isAdmin=True)
        new_member.save()

        serializer = BookClubListSerializer(New_club)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # @INPUT: BookClub_ID, User_ID
    # @OUTPUT: User_ID, BookClub_ID and isAdmin status of new user, 201_CREATED
    def join_bookclub(self, request):
        """ join a book club if the token is valid"""
        bookclub = BookClub.objects.get(pk=request.data.get('BookClub_ID', {}))
        user = User.objects.get(pk=request.data.get('User_ID', {}))

        if not bookclub.Open:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        if Administrator.objects.filter(BookClub=bookclub, User=user).count() != 0:
            return Response(status=status.HTTP_409_CONFLICT)
        else:
            new_member = Administrator(User=user, BookClub=bookclub, isAdmin=False)
            new_member.save()
            new_member = Administrator.objects.get(
                User=new_member.User, BookClub=new_member.BookClub)

            serializer = MemberSerializer(new_member)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

    # @INPUT: BookClub_ID, User_ID
    # @OUTPUT: 200_OK is has permission, 401_UNAUTHORIZED otherwise
    def delete_bookclub(self, request):
        """ delete book club if the token is valid and user is admin"""
        bookclub = BookClub.objects.get(pk=request.data.get('BookClub_ID', {}))
        user = User.objects.get(pk=request.data.get('User_ID', {}))

        if CheckPermissions(user).hasPerm('Club Delete', bookclub):
            deleted = bookclub.delete()
            return Response(status=status.HTTP_200_OK)

        return Response(status=status.HTTP_401_UNAUTHORIZED)

    # @INPUT: BookClub_ID, User_ID
    # @OUTPUT: 200_OK is user has permission, 401_UNAUTHORIZED otherwise
    def leave_bookclub(self, request):
        """ leave the book club if the token is valid"""
        bookclub = BookClub.objects.get(pk=request.data.get('BookClub_ID', {}))
        user = User.objects.get(pk=request.data.get('User_ID', {}))

        token = request.headers.get('Authorization').split()[1]
        token_user = User.objects.get(
            pk=jwt.decode(token, settings.SECRET_KEY, algorithms='HS256')['id'])

        if CheckPermissions(user).hasPerm('Set User', token_user):
            if Administrator.objects.filter(BookClub=bookclub, User=user).count() < 1:
                return Response(status=status.HTTP_400_BAD_REQUEST)
            to_delete = Administrator.objects.get(BookClub=bookclub, User=user)
            to_delete.delete()
            return Response(status=status.HTTP_200_OK)

        return Response(status=status.HTTP_401_UNAUTHORIZED)


# ViewSet for DISCUSSION functions
class DiscussionAPIViewSet(viewsets.ViewSet):
    """ Set of discussion functionality related views """
    permission_classes = (IsAuthenticated,)

    # @INPUT: token in auth header, POST request with "BookClub_ID" in the body
    # @OUTPUT: List of discussions the book clubs has, ordered from newest to oldest,
    # plus the title of the discussion and the username and profile_pic of the user that created the thread
    def list_discussions(self, request):
        """ list discussions for the given book club if the token is valid """
        id = request.data.get('BookClub_ID', {})
        discussion_query = Discussion.objects.filter(BookClub_ID=id).order_by('-Time')
        serializer = DiscussionSerializer(discussion_query, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def get_disussion_information(self, request):
        """ get information for one discussion if the token is valid"""
        id = request.data.get('Discussion_ID', {})
        discussion = Discussion.objects.get(pk=id)
        serializer = DiscussionSerializer(discussion)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # @INPUT: token in auth header, POST request with "Discussion_ID" in the body
    # @OUTPUT: List of threads of the given discussion ordered from oldest to newest,
    # plus the title of the discussion and the username and profile_pic of the user that created the thread
    def list_threads(self, request):
        """ list threads for the discussion if the token is valid"""
        id = request.data.get('Discussion_ID', {})
        threads = Thread.objects.filter(Discussion_ID=id).order_by('Time')
        discussion = Discussion.objects.get(pk=id)
        serializer = ThreadSerializer(threads, many=True)
        query = {
            'Title': discussion.Title,
            'Threads': serializer.data
        }
        return Response(query, status=status.HTTP_200_OK)

    # @INPUT: Title, BookClub_ID, User_ID, Content
    # @OUTPUT Title, Time, Discussion_ID and User_ID which is its own object with username and profile_pic of new
    # discussion, 201_CREATED
    def create_discussion(self, request):
        """ Create discussion if the token is valid and user is in the club"""
        title = request.data.get('Title', {})
        bookclub = BookClub.objects.get(pk=request.data.get('BookClub_ID', {}))
        author = User.objects.get(pk=request.data.get('User_ID', {}))
        content = request.data.get('Content', {})
        time = datetime.now()

        new_discussion = Discussion(
            Title=title, Time=time, User_ID=author, BookClub_ID=bookclub)
        new_discussion.save()
        new_discussion = Discussion.objects.get(pk=new_discussion.Discussion_ID)

        first_thread = Thread(
            Content=content, Time=time, User_ID=author, Discussion_ID=new_discussion)
        first_thread.save()

        serializer = DiscussionSerializer(new_discussion)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # @INPUT: Discussion_ID, User_ID, Content
    # @OUTPUT: Thread_ID, Content, Time and User_ID of created thread, 201_CREATED
    def post_reply(self, request):
        """post reply to a discussion if the token is valid and user is in the club"""
        discussion = Discussion.objects.get(pk=request.data.get('Discussion_ID', {}))
        user = User.objects.get(pk=request.data.get('User_ID', {}))
        content = request.data.get('Content', {})
        time = datetime.now()

        setattr(discussion, "Time", time)
        discussion.save()

        new_thread = Thread(Content=content, Time=time, User_ID=user, Discussion_ID=discussion)
        new_thread.save()
        new_thread = Thread.objects.get(pk=new_thread.Thread_ID)

        serializer = ThreadSerializer(new_thread)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # @INPUT: Discussion_ID, User_ID
    # @OUTPUT: 200_OK is user has permission, 401_UNAUTHORIZED otherwise
    def delete_discussion(self, request):
        """delete the discussion if the token is valid and user is the author of the discussion or an admin """
        discussion = Discussion.objects.get(pk=request.data.get('Discussion_ID', {}))
        user = User.objects.get(pk=request.data.get('User_ID', {}))

        if CheckPermissions(user).hasPerm('Discussion Delete', discussion):
            deleted = discussion.delete()
            return Response(status=status.HTTP_200_OK)

        return Response(status=status.HTTP_401_UNAUTHORIZED)

    # @INPUT: Thread_ID, User_ID
    # @OUTPUT: 200_OK if user has permission, 401_UNAUTHORIZED otherwise
    def delete_thread(self, request):
        """delete the reply if the token is valid and user is the author of the thread or an admin """
        thread = Thread.objects.get(pk=request.data.get('Thread_ID', {}))
        user = User.objects.get(pk=request.data.get('User_ID', {}))

        if CheckPermissions(user).hasPerm('Thread Delete', thread):
            deleted = thread.delete()
            return Response(status=status.HTTP_200_OK)

        return Response(status=status.HTTP_401_UNAUTHORIZED)

    # @INPUT: Thread_ID, User_ID, Content
    # @OUTPUT: Thread_ID, User_ID (JSON object with username and profile_pic), (new)Content, Time of editted thread,
    # 200_OK
    def edit_thread(self, request):
        """edit the thread if the token is valid and user is the author of the thread or an admin """
        thread = Thread.objects.get(pk=request.data.get('Thread_ID', {}))
        user = User.objects.get(pk=request.data.get('User_ID', {}))
        new_content = request.data.get('Content')

        if CheckPermissions(user).hasPerm('Thread Delete', thread):
            setattr(thread, "Content", new_content)
            thread.save()
            serializer = ThreadSerializer(thread)
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(status=status.HTTP_401_UNAUTHORIZED)


# ViewSet for POLL functions
class PollAPIViewSet(viewsets.ViewSet):
    """ The set of views for Poll functionality """
    permission_classes = (IsAuthenticated,)

    # @INPUT: token in auth header, POST request with "BookClub_ID"
    # @OUTPUT: List of CURRENT polls given in Poll_ID, Title and End_Time
    def list_current_polls(self, request):
        """ list the ongoing polls of the club if the token is valid"""
        id = request.data.get('BookClub_ID', {})
        current_polls = Poll.objects.filter(BookClub_ID=id, End_Time__gt=datetime.now())
        serializer = PollSerializer(current_polls, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # @INPUT: token in auth header, POST request with "BookClub_ID"
    # @OUTPUT: List of PAST polls given in Poll_ID, Title and End_Time
    def list_past_polls(self, request):
        """ list polls in the past if the token is valid"""
        id = request.data.get('BookClub_ID', {})
        past_polls = Poll.objects.filter(BookClub_ID=id, End_Time__lte=datetime.now())
        serializer = PollSerializer(past_polls, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # @INPUT: token in auth header, POST request with "BookClub_ID" and "User_ID"
    # @OUTPUT: Returns the poll info of the selected poll, in an array of Choices of the Poll,
    # each choice has fields Title, Choice_ID, vote_count (total number of votes on this choice) and
    # user_vote (indicates whether user has a vote on this choice,
    # 0 means False and NON-ZERO means True
    def get_poll_info(self, request):
        """get a single poll's information if the token is valid"""
        poll_id = request.data.get('Poll_ID', {})
        user_id = request.data.get('User_ID', {})
        user_vote = Vote.objects.filter(User_ID=user_id)
        poll_info = Choice.objects.filter(
            Poll_ID=poll_id).annotate(vote_count=Count('vote')) \
            .annotate(user_vote=Count(
            Subquery( user_vote.filter(
                User_ID=user_id, Choice_ID=OuterRef('Choice_ID')).only('Vote_ID'))))
        serializer = PollInfoSerializer(poll_info, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # @INPUT: Time in the format of "DD-MM-YYYY HH:MM:SS", Title, User_ID, BookClub_ID and Choices as JSON array
    # @OUTPUT: Poll_ID, Title, and End_Time of created poll, status 201_CREATED
    def create_poll(self, request):
        """create a poll if the token is valid and user is an admin"""
        bookclub = BookClub.objects.get(pk=request.data.get('BookClub_ID', {}))
        user = User.objects.get(pk=request.data.get('User_ID', {}))

        if CheckPermissions(user).hasPerm('Create', bookclub):
            time = datetime.strptime(request.data.get('Time', {}), "%d-%m-%Y %H:%M:%S")
            title = request.data.get('Title', {})
            choices = request.data.get('Choices', {})

            new_poll = Poll(End_Time=time, Title=title, BookClub_ID=bookclub)
            new_poll.save()
            new_poll = Poll.objects.get(pk=new_poll.Poll_ID)

            for choice in choices:
                new_choice = Choice(Description=choice, Poll_ID=new_poll)
                new_choice.save()

            serializer = PollSerializer(new_poll)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        else:
            return Response(status=status.HTTP_401_UNAUTHORIZED)

    # @INPUT: Choice_ID, User_ID, Poll_ID
    # @OUTPUT: Returns poll info of the poll that was just voted on, status 201_CREATED
    # User CANNOT vote on the same choice twice, status 409_CONFLICT
    def vote_poll(self, request):
        """vote poll if the token is valid"""
        choice = Choice.objects.get(pk=request.data.get('Choice_ID', {}))
        user = User.objects.get(pk=request.data.get('User_ID', {}))
        poll = Poll.objects.get(pk=request.data.get('Poll_ID', {}))

        if Vote.objects.filter(Choice_ID=choice, User_ID=user).count() == 0:
            new_vote = Vote(Choice_ID=choice, User_ID=user)
            new_vote.save()

            user_vote = Vote.objects.filter(User_ID=user)
            poll_info = Choice.objects.filter(Poll_ID=poll).annotate(vote_count=Count('vote')) \
                .annotate(user_vote=Count(
                Subquery(user_vote.filter(
                    User_ID=user, Choice_ID=OuterRef('Choice_ID')).only('Vote_ID'))))
            serializer = PollInfoSerializer(poll_info, many=True)

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(status=status.HTTP_409_CONFLICT)

    # @INPUT: Poll_ID, User_ID
    # @OUTPUT: 200_OK if has permission, 401_UNAUTHORIZED otherwise
    def delete_poll(self, request):
        """ delete a poll if the token is valid and user is an admin"""
        poll = Poll.objects.get(pk=request.data.get('Poll_ID', {}))
        user = User.objects.get(pk=request.data.get('User_ID', {}))

        if CheckPermissions(user).hasPerm('Admin Delete', poll):
            poll.delete()
            return Response(status=status.HTTP_200_OK)

        return Response(status=status.HTTP_401_UNAUTHORIZED)

    # @INPUT: Poll_ID, User_ID
    # @OUTPUT: 200_OK is user has permission, 401_UNAUTHORIZED otherwise
    def delete_vote(self, request):
        """ cancel all of a user's votes for the given poll if the token is valid and user id sent matches the token"""
        poll = Poll.objects.get(pk=request.data.get('Poll_ID', {}))
        user = User.objects.get(pk=request.data.get('User_ID', {}))

        if poll.End_Time < datetime.date(datetime.now()):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        token = request.headers.get('Authorization').split()[1]
        token_user = User.objects.get(
            pk=jwt.decode(token, settings.SECRET_KEY, algorithms='HS256')['id'])

        if CheckPermissions(user).hasPerm('Set User', token_user):
            choices = Choice.objects.filter(Poll_ID=poll)
            for choice in choices:
                if Vote.objects.filter(Choice_ID=choice, User_ID=user).count() == 1:
                    to_delete = Vote.objects.get(Choice_ID=choice, User_ID=user)
                    to_delete.delete()

            return Response(status=status.HTTP_200_OK)

        return Response(status=status.HTTP_401_UNAUTHORIZED)


# ViewSet for MEETING functions
class MeetingAPIViewSet(viewsets.ViewSet):
    """ The set of views for the meeting functionality """
    permission_classes = (IsAuthenticated,)

    # @INPUT: token in auth header, POST request with "BookClub_ID" and "User_ID"
    # @OUTPUT: List of FUTURE meetings given in Location, Time, Book (has its Name and Image) and
    # user_attendance (0 means False, Non-zero (it probably is 1) means True)
    def list_future_meetings(self, request):
        """ list future meetings if token is valid """
        bookclub_id = request.data.get('BookClub_ID', {})
        user_id = request.data.get('User_ID', {})
        meetings = Meeting.objects.filter(BookClub_ID=bookclub_id, Time__gt=datetime.now()) \
            .annotate(user_attendance=Count(Subquery(
            Attendance.objects.filter(
                User_ID=user_id, Meeting_ID=OuterRef('Meeting_ID')).only('Attendance_ID'))))
        serializer = MeetingSerializer(meetings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # @INPUT: token in auth header, POST request with "BookClub_ID" and "User_ID"
    # @OUTPUT: List of PAST meetings given in Location, Time, Book (has its Name and Image) and
    # user_attendance (0 means False, Non-zero (it probably is 1) means True)
    def list_past_meetings(self, request):
        """ list past meetings if the token is valid """
        bookclub_id = request.data.get('BookClub_ID', {})
        user_id = request.data.get('User_ID', {})
        meetings = Meeting.objects.filter(BookClub_ID=bookclub_id, Time__lte=datetime.now()) \
            .annotate(user_attendance=Count(Subquery(
            Attendance.objects.filter(
                User_ID=user_id, Meeting_ID=OuterRef('Meeting_ID')).only('Attendance_ID'))))
        serializer = MeetingSerializer(meetings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # @INPUT: BookClub_ID, User_ID
    # @OUTPUT: Location, Title, Time and user_attendance (0 if not attending and 1 otherwise), 201_CREATED
    # 401_UNAUTHORIZED if user is not an admin
    def create_meeting(self, request):
        """ create meeting if the token is valid and user has admin permission"""
        bookclub = BookClub.objects.get(pk=request.data.get('BookClub_ID', {}))
        user = User.objects.get(pk=request.data.get('User_ID', {}))

        if CheckPermissions(user).hasPerm('Create', bookclub):
            time = datetime.strptime(request.data.get('Time', {}), '%d-%m-%Y %H:%M')
            location = request.data.get('Location', {})
            # book = Book.objects.get(pk=request.data.get('Book_ID', {}))
            title = request.data.get('Title', {})

            new_meeting = Meeting(Location=location, Title=title, Time=time, BookClub_ID=bookclub)
            new_meeting.save()
            new_meeting = Meeting.objects.filter(pk=new_meeting.pk) \
                .annotate(user_attendance=Count(
                Subquery(
                    Attendance.objects.filter(
                        User_ID=user, Meeting_ID=OuterRef('Meeting_ID')).only('Attendance_ID'))))

            serializer = MeetingSerializer(new_meeting.first())
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(status=status.HTTP_401_UNAUTHORIZED)

    # @INPUT: Meeting_ID, User_ID
    # @OUTPUT: Same as create_meeting
    # 409_CONFLICT if user is already marked as attending
    def attend_meeting(self, request):
        """ attend a meeting if the token is valid """
        meeting = Meeting.objects.get(pk=request.data.get('Meeting_ID', {}))
        user = User.objects.get(pk=request.data.get('User_ID', {}))

        if Attendance.objects.filter(Meeting_ID=meeting, User_ID=user).count() == 0:
            new_attendance = Attendance(User_ID=user, Meeting_ID=meeting)
            new_attendance.save()

            updated_meeting = Meeting.objects.filter(pk=meeting.pk).annotate(user_attendance=Count(
                Subquery(Attendance.objects.filter(
                    User_ID=user, Meeting_ID=OuterRef('Meeting_ID')).only('Attendance_ID'))))

            serializer = MeetingSerializer(updated_meeting.first())
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(status=status.HTTP_409_CONFLICT)

    """This is the deleted view for searching for a Book object based on Name. 
    The Book object concept is currently unimplemented due to time constraints"""
    # def search_book(self, request):
    #     query = request.data.get('Title', {})
    #
    #     search_result = Book.objects.filter(Title__icontains=query)
    #     serializer = BookSearchSerializer(search_result, many=True)
    #     return Response(serializer.data, status=status.HTTP_200_OK)

    # @INPUT: Meeting_ID, User_ID
    # @OUTPUT: 200_OK if user has permission, 401_UNAUTHORIZED otherwise
    def delete_meeting(self, request):
        """ delete a meeting if the token is valid and the user is admin of the club"""
        meeting = Meeting.objects.get(pk=request.data.get('Meeting_ID', {}))
        user = User.objects.get(pk=request.data.get('User_ID', {}))

        if CheckPermissions(user).hasPerm('Admin Delete', meeting):
            meeting.delete()
            return Response(status=status.HTTP_200_OK)

        return Response(status=status.HTTP_401_UNAUTHORIZED)

    # @INPUT: User_ID, Meeting_ID
    # @OUTPUT: 200_OK if user has permission and 401_UNAUTHORIZED otherwise
    def delete_attendance(self, request):
        """ cancel attendence if the token is valid and user provided matches the token"""
        user = User.objects.get(pk=request.data.get('User_ID', {}))
        meeting = Meeting.objects.get(pk=request.data.get('Meeting_ID', {}))

        if meeting.Time < timezone.now():
            return Response(status=status.HTTP_400_BAD_REQUEST)

        token = request.headers.get('Authorization').split()[1]
        token_user = User.objects.get(
            pk=jwt.decode(token, settings.SECRET_KEY, algorithms='HS256')['id'])

        if CheckPermissions(user).hasPerm('Set User', token_user):
            if Attendance.objects.filter(Meeting_ID=meeting, User_ID=user).count() == 1:
                to_delete = Attendance.objects.get(Meeting_ID=meeting, User_ID=user)
                to_delete.delete()
                return Response(status=status.HTTP_200_OK)

            return Response(status=status.HTTP_400_BAD_REQUEST)

        return Response(status=status.HTTP_401_UNAUTHORIZED)


# ViewSet for SEARCH function
class SearchAPIView(APIView):
    """ search book clubs view"""
    permission_classes = (IsAuthenticated,)

    # @INPUT: Tags as a JSON array
    # @OUTPUT: Book Clubs in the intersection of all existing tags, 200_OK
    def post(self, request):
        """ list book clubs with given tags"""
        tags = request.data.get('Tags', {})
        result = BookClub.objects.none()
        for tag in tags:
            try:
                find_tag = Tag.objects.get(Name=tag)
            except ObjectDoesNotExist:
                find_tag = None

            if find_tag is not None:
                tag_result = BookClub.objects.filter(Tags=find_tag.pk)
                if result.count() == 0:
                    result = result.union(tag_result)
                else:
                    result = result.intersection(tag_result)

        serializer = BookClubSearchSerializer(result, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class SettingsAPIViewSet(viewsets.ViewSet):
    """ admin setting of club view"""
    permission_classes = (IsAuthenticated,)

    # @INPUT: Param_to_change, New_value, User_ID, BookClub_ID
    # @OUTPUT: Updated book club's name, profile_pic, bookclub_id and open, 200_OK
    # Only "Name", "Logo" or "Open" are accepted in Param_to_change, 400_BAD_REQUEST if other params are provided
    # 401_UNAUTHORIZED is user does not have permission
    def Club_Setting(self, request):
        """ change club info if the token is valid and user is the admin"""
        param_to_change = request.data.get('Param_to_change', {})
        new_value = request.data.get('New_value', {})
        user = User.objects.get(pk=request.data.get('User_ID', {}))
        bookclub = BookClub.objects.get(pk=request.data.get('BookClub_ID', {}))

        if CheckPermissions(user).hasPerm('Set Club', bookclub):
            if param_to_change == 'Name':
                setattr(bookclub, "Name", new_value)

            elif param_to_change == 'Logo':
                setattr(bookclub, "Profile_Pic", new_value)

            elif param_to_change == 'Open':
                setattr(bookclub, "Open", new_value)

            else:
                return Response(status=status.HTTP_400_BAD_REQUEST)

            bookclub.save()
            serializer = BookClubSearchSerializer(bookclub)
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(status=status.HTTP_401_UNAUTHORIZED)

    # @INPUT: Param_to_change, New_value, User_ID
    # @OUTPUT: Updated user's username, email and profile_pic, 200_OK
    # Only "Profile_pic", "Username", "Password" or "Email" are accepted in Param_to_change,
    # 400_BAD_REQUEST if other params are provided
    # 401_UNAUTHORIZED is user does not have permission
    def User_Setting(self, request):
        """ change user info if the token is valid and user provide matches the token """
        param_to_change = request.data.get('Param_to_change', {})
        new_value = request.data.get('New_value', {})
        user = User.objects.get(pk=request.data.get('User_ID'))

        token = request.headers.get('Authorization').split()[1]
        token_user = User.objects.get(
            pk=jwt.decode(token, settings.SECRET_KEY, algorithms='HS256')['id'])

        if CheckPermissions(user).hasPerm('Set User', token_user):
            if param_to_change == 'Profile_pic':
                setattr(user, "profile_pic", new_value)

            elif param_to_change == 'Username':
                setattr(user, "username", new_value)

            elif param_to_change == 'Email':
                setattr(user, 'email', new_value)

            elif param_to_change == 'Password':
                new_value = decrypt_request_pwd(new_value)
                user.set_password(new_value)

            else:
                return Response(status=status.HTTP_400_BAD_REQUEST)

            user.save()
            serializer = UserSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(status=status.HTTP_401_UNAUTHORIZED)


class AdminCheckAPIView(APIView):
    """ check admin view"""

    permission_classes = (IsAuthenticated, )

    # @INPUT: User_ID, BookClub_ID
    # @OUTPUT: isAdmin (boolean), 200_OK
    def post(self, request):
        """ check if the user is admin"""
        user = User.objects.get(pk=request.data.get('User_ID', {}))
        bookclub = BookClub.objects.get(pk=request.data.get('BookClub_ID', {}))

        if user.is_superuser:
            is_admin = {
                'isAdmin': True
            }
            return Response(is_admin, status=status.HTTP_200_OK)

        is_admin = {
            'isAdmin': Administrator.objects.get(User=user, BookClub=bookclub).isAdmin
        }

        return Response(is_admin, status=status.HTTP_200_OK)

class UsersAPIView(APIView):
    """user view"""
    permission_classes = (IsAuthenticated, )

    # @INPUT: User_ID
    # @OUTPUT: username, profile_pic, email and user_ID
    def post(self, request):
        """authenticate user and get info"""
        user = User.objects.get(pk=request.data.get('User_ID', {}))
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
