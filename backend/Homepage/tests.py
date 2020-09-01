""" Test modules for Django backend """
from django.test import TestCase, Client
import json
from rest_framework import status
from django.urls import reverse
from Homepage.models import User, BookClub, Meeting, Poll, Discussion, Thread, Choice
from Homepage.serializer import UserSerializer, BookClubSearchSerializer, BookClubListSerializer, PollSerializer, DiscussionSerializer, ThreadSerializer, MeetingSerializer
from Homepage.decryption import encrypt_test_pwd
from rest_framework.test import RequestsClient
from django.db.models import Q
import datetime

client = Client() # for login / register
Client = RequestsClient() # for auth'd queries

class UserTest(TestCase):
    """ Test module for a single user object """
    userId = 0

    # make and save a single user
    def setUp(self):
        user = User.objects.create(
            username='Jaycar', email='test@example.com', profile_pic='a test path', is_staff=False)
        user.save()
        self.userId = user.id
        token = 'Token '+ user.token()
        Client.headers.update({'Authorization': token})

    # sanity check; should be able to select and verify attribute of a user
    def test_get_user_basic(self):
        user = User.objects.get(username='Jaycar')
        self.assertEqual(user.pic(), 'a test path')

    # use user token to auth our API calls
    def test_get_user(self):
        user = User.objects.get(username='Jaycar')
        serializer = UserSerializer(user)
        response = Client.post('http://testserver/Homepage/get_user', json={'User_ID': self.userId})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(serializer.data, json.loads(response.content))

    # we need to pass valid tokens
    def test_cant_use_bad_token(self):
        Client.headers.update({'Authorization': 'Token wekjfh'})
        response = Client.post('http://testserver/Homepage/get_user', json={'User_ID': self.userId})
        self.assertEqual(response.status_code, 403)

        Client.headers.update({'Authorization': 'tken wekjfh'})
        response = Client.post('http://testserver/Homepage/get_user', json={'User_ID': self.userId})
        self.assertEqual(response.status_code, 403)

    # don't let us call API endpoints without the token
    def test_cant_get_user_no_auth(self):
        # get API response
        response = client.get('/Homepage/get_user', content_type='application/json', data={'User_ID':self.userId})
        # shouldn't give a reposnse as there is no token (403 forbidden)
        self.assertEqual(response.status_code, 403)

    def test_user_can_change_pic(self): 
        data = {'User_ID': self.userId, 'Param_to_change': 'Profile_pic', 'New_value': 'a new path'}
        response = Client.post('http://testserver/Homepage/set_user', json=data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(json.loads(response.content)['profile_pic'], 'a new path')

    def test_user_can_change_username(self): 
        data = {'User_ID': self.userId, 'Param_to_change': 'Username', 'New_value': 'a new name'}
        response = Client.post('http://testserver/Homepage/set_user', json=data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(json.loads(response.content)['username'], 'a new name')
    
    def test_user_can_change_password(self): 
        data = {'User_ID': self.userId, 'Param_to_change': 'Password', 'New_value': encrypt_test_pwd('da2&jS')}
        response = Client.post('http://testserver/Homepage/set_user', json=data)
        self.assertEqual(response.status_code, 200)

    def test_user_can_change_email(self): 
        data = {'User_ID': self.userId, 'Param_to_change': 'Email', 'New_value': 'fresh@new.com'}
        response = Client.post('http://testserver/Homepage/set_user', json=data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(json.loads(response.content)['email'], 'fresh@new.com')

    def test_user_cant_change_invalid(self):
        data = {'User_ID': self.userId, 'Param_to_change': 'this value Does Not Exist', 'New_value': 'what does it mean'}
        response = Client.post('http://testserver/Homepage/set_user', json=data)
        self.assertEqual(response.status_code, 400) # 400 bad request

class BookClubCreateTest(TestCase):
    """ Test module for creating a bookclub """

    # make and save a single user
    def setUp(self):
        user = User.objects.create(
            username='Jaycar', email='test@example.com', profile_pic='a test path', is_staff=False)
        user.save()
        Client.headers.update({'Authorization': 'Token '+ user.token()})

    # a user should be able to create a book club
    def test_create_club(self):
        user = User.objects.get(username='Jaycar')
        data = {'User_ID': user.id, 'Tags': ["Sydney", "Horror", "Climate Action"], 
        		'Name': 'A new club!', 'Profile_Pic': 'path'}
        response = Client.post('http://testserver/Homepage/create_book_club', json=data)

        # expected status: 201_CREATED
        self.assertEqual(response.status_code, 201)

class RegisterTest(TestCase):
    """ Test module for registering """

    # can register a user
    def test_register(self):

        data = {'username': 'new_user', 'email': 'new@example.com', 'password': encrypt_test_pwd('password')}
        response = client.post('/Homepage/register', content_type='application/json', data=data)

        # expected status: 201_CREATED
        self.assertEqual(response.status_code, 201)
        self.assertEqual(json.loads(response.content)['username'], 'new_user')
        self.assertEqual(json.loads(response.content)['email'], 'new@example.com')        

    # can't register without all the needed fields
    def test_register_expections(self):
        data = {'username': '','email': 'new@example.com', 'password': encrypt_test_pwd('password')}
        response = client.post('/Homepage/register', content_type='application/json', data=data)
        # expected status: 400 bad request
        self.assertEqual(response.status_code, 400)

        data = {'username': 'new_user','email': '', 'password': encrypt_test_pwd('password')}
        response = client.post('/Homepage/register', content_type='application/json', data=data)
        # expected status: 400 bad request
        self.assertEqual(response.status_code, 400)

        data = {'username': 'new_user','email': 'new@example.com', 'password': encrypt_test_pwd('')}
        response = client.post('/Homepage/register', content_type='application/json', data=data)
        # expected status: 400 bad request
        self.assertEqual(response.status_code, 400)

    def test_can_login_after_register(self):
        self.test_register()

        data = {'email': 'new@example.com', 'password': encrypt_test_pwd('password')}
        response = client.post('/Homepage/login', content_type='application/json', data=data)

        # expected status: 200_OK
        self.assertEqual(response.status_code, 200)

class BookClubAdminTest(TestCase):
    """ Test module for admin/creator of a bookclub
            with 1 user, 1 bookclub  """
    userId = 0
    bookId = 0

    # make and save a single user who creates a club
    def setUp(self):
        user = User.objects.create(
            username='Jaycar', email='test@example.com', profile_pic='a test path', is_staff=False)
        user.save()
        Client.headers.update({'Authorization': 'Token '+ user.token()})

        data = {'User_ID': user.id, 'Tags': ["Sydney", "Horror", "Climate Action"], 
        		'Name': 'A new club!', 'Profile_Pic': 'path'}
        response = Client.post('http://testserver/Homepage/create_book_club', json=data)
        self.assertEqual(response.status_code, 201)

        book = BookClub.objects.get(Name='A new club!')
        self.userId = user.id
        self.bookId = book.BookClub_ID

    # the user who made the book club should be admin
    def test_creator_is_admin(self):
        data = {'User_ID': self.userId, 'BookClub_ID': self.bookId}
        response = Client.post('http://testserver/Homepage/is_admin', json=data)

        # expected status: 200
        self.assertEqual(response.status_code, 200)
        self.assertEqual(json.loads(response.content), {'isAdmin':True})

    # the admin can delete the bookclub
    def test_creator_can_delete(self):
        data = {'User_ID': self.userId, 'BookClub_ID': self.bookId}
        response = Client.post('http://testserver/Homepage/delete_book_club', json=data)

        # expected status: 200
        self.assertEqual(response.status_code, 200)

        # the club is deleted, so an error will be raised trying to retrieve it
        with self.assertRaises(BookClub.DoesNotExist):
            book = BookClub.objects.get(Name='A new club!')

    def test_can_get_correct_details(self):
        data = {'BookClub_ID': self.bookId}
        response = Client.post('http://testserver/Homepage/get_single_bookclub', json=data)
        
        self.assertEqual(response.status_code, 200) # expected status: 200
        self.assertEqual(json.loads(response.content)['Name'], 'A new club!')
        self.assertEqual(json.loads(response.content)['Profile_Pic'], 'path')
        self.assertEqual(json.loads(response.content)['Open'], True) # should be open by default

    def test_creator_can_change_logo(self):
        data = {'BookClub_ID': self.bookId, 'User_ID': self.userId, 'Param_to_change' : 'Logo', 'New_value': 'new_path'}
        response = Client.post('http://testserver/Homepage/set_club', json=data)
        
        self.assertEqual(response.status_code, 200) # expected status: 200
        self.assertEqual(json.loads(response.content)['Name'], 'A new club!')
        self.assertEqual(json.loads(response.content)['Profile_Pic'], 'new_path') #only the logo should be updated
        self.assertEqual(json.loads(response.content)['Open'], True) 

    def test_creator_can_change_name(self):
        data = {'BookClub_ID': self.bookId, 'User_ID': self.userId, 'Param_to_change' : 'Name', 'New_value': 'a better name'}
        response = Client.post('http://testserver/Homepage/set_club', json=data)
        
        self.assertEqual(response.status_code, 200) # expected status: 200
        self.assertEqual(json.loads(response.content)['Name'], 'a better name') # only name updated
        self.assertEqual(json.loads(response.content)['Profile_Pic'], 'path') 
        self.assertEqual(json.loads(response.content)['Open'], True) 

    def test_creator_can_toggle_open(self):
        data = {'BookClub_ID': self.bookId, 'User_ID': self.userId, 'Param_to_change' : 'Open', 'New_value': False}
        response = Client.post('http://testserver/Homepage/set_club', json=data)
        
        self.assertEqual(response.status_code, 200) # expected status: 200
        self.assertEqual(json.loads(response.content)['Name'], 'A new club!') 
        self.assertEqual(json.loads(response.content)['Profile_Pic'], 'path') 
        self.assertEqual(json.loads(response.content)['Open'], False) # now closed for new members

    def test_creator_cant_change_invalid(self):
        data = {'BookClub_ID': self.bookId, 'User_ID': self.userId, 'Param_to_change' : 'kjsefh', 'New_value': 'what does this even mean'}
        response = Client.post('http://testserver/Homepage/set_club', json=data)
        
        self.assertEqual(response.status_code, 400) # expected status: 400 bad request
  
    def test_creator_can_create_poll(self):
        data = {'BookClub_ID': self.bookId, 'User_ID': self.userId, 'Time' : '02-02-2019 00:00:00', 'Title': 'Can I ask a question?', 'Choices': ['yes', 'no']}
        response = Client.post('http://testserver/Homepage/create_poll', json=data)
        
        self.assertEqual(response.status_code, 201) # expected status: 201_CREATED

        poll = Poll.objects.get(Title='Can I ask a question?')
        serializer = PollSerializer(poll)
        self.assertEqual(json.loads(response.content), serializer.data)

        # note: we use get past meetings, so this test will always work
        response = Client.post('http://testserver/Homepage/get_past_polls', json=data) 

        self.assertEqual(response.status_code, 200) # expected status: 200
        self.assertEqual(json.loads(response.content)[0]['Title'], 'Can I ask a question?') 

    def test_creator_can_create_meeting(self):
        data = {'BookClub_ID': self.bookId, 'User_ID': self.userId, 'Time' : '03-01-2019 00:00', 'Title': 'Garden Party', 'Location': 'TBA'}
        response = Client.post('http://testserver/Homepage/create_meeting', json=data)

        self.assertEqual(response.status_code, 201) # expected status: 201_CREATED
        self.assertEqual(json.loads(response.content)['Title'], 'Garden Party') 

        # note: we use get past meetings, so this test will always work
        response = Client.post('http://testserver/Homepage/get_past_meetings', json=data) 

        self.assertEqual(response.status_code, 200) # expected status: 200
        self.assertEqual(json.loads(response.content)[0]['Title'], 'Garden Party') 

    def test_creator_can_delete_meeting(self):

        self.test_creator_can_create_meeting() # let's re-use this meeting

        meeting = Meeting.objects.get(Title='Garden Party')
        meetingId = meeting.Meeting_ID

        data = {'Meeting_ID': meetingId, 'User_ID': self.userId}

        response = Client.post('http://testserver/Homepage/delete_meeting', json=data) 
        self.assertEqual(response.status_code, 200) # expected status: 200
        
        # the meeting is deleted, so an error will be raised trying to retrieve it
        with self.assertRaises(Meeting.DoesNotExist):
            meeting = Meeting.objects.get(Title='Garden Party')

    def test_creator_can_delete_poll(self):

        self.test_creator_can_create_poll() # let's re-use this poll

        poll = Poll.objects.get(Title='Can I ask a question?')
        pollId = poll.Poll_ID

        data = {'Poll_ID': pollId, 'User_ID': self.userId}

        response = Client.post('http://testserver/Homepage/delete_poll', json=data) 
        self.assertEqual(response.status_code, 200) # expected status: 200
        
        # the poll is deleted, so an error will be raised trying to retrieve it
        with self.assertRaises(Poll.DoesNotExist):
            polls = Poll.objects.get(Title='Can I ask a question?')

    def test_creator_can_leave_club(self):
        data = {'User_ID': self.userId, 'BookClub_ID': self.bookId}
        response = Client.post('http://testserver/Homepage/leave_club', json=data)
        
        self.assertEqual(response.status_code, 200) # this is allowed

class UserJoinClubTest(TestCase):
    """ Test module for a normal user looking at a bookclub
            with 3 users, 1 bookclub  """
    
    userId = 0 # id of a user who is not admin
    bookId = 0
    adminId = 0
    hacker = None # this user will try to cause trouble

    # make and save a single user who creates a club
    def setUp(self):
        creator = User.objects.create(
            username='ADMIN', email='admin@example.com', profile_pic='a admin path', is_staff=False)
        creator.save()

        data = {'User_ID': creator.id, 'Tags': ["Sydney", "Horror", "Climate Action"], 
                'Name': 'A new club!', 'Profile_Pic': 'path'}
        
        Client.headers.update({'Authorization': 'Token '+ creator.token()})
        response = Client.post('http://testserver/Homepage/create_book_club', json=data)
        self.assertEqual(response.status_code, 201)

        user = User.objects.create(
            username='Jaycar', email='test@example.com', profile_pic='a test path', is_staff=False)
        user.save()
        Client.headers.update({'Authorization': 'Token '+ user.token()})

        book = BookClub.objects.get(Name='A new club!')
        self.userId = user.id
        self.bookId = book.BookClub_ID
        self.adminId = creator.id

        hacker = User.objects.create(
            username='evil', email='bad@example.com', profile_pic='a sneaky path', is_staff=False)
        hacker.save()
        self.hacker = hacker

    # a user can join the bookclub 
    def test_user_can_join_club(self):
        data = {'User_ID': self.userId, 'BookClub_ID': self.bookId}
        response = Client.post('http://testserver/Homepage/join_book_club', json=data)

        # expected status: 201_CREATED
        self.assertEqual(response.status_code, 201)

    def test_user_can_not_join_twice(self):
        self.test_user_can_join_club()

        data = {'User_ID': self.userId, 'BookClub_ID': self.bookId}
        response = Client.post('http://testserver/Homepage/join_book_club', json=data)
        
        # expected status: HTTP_409_CONFLICT
        self.assertEqual(response.status_code, 409)

    def test_user_can_leave_club(self):
        self.test_user_can_join_club()

        data = {'User_ID': self.userId, 'BookClub_ID': self.bookId}
        response = Client.post('http://testserver/Homepage/leave_club', json=data)
        
        self.assertEqual(response.status_code, 200) # 200_OK

    def test_user_can_not_join_closed_club(self):
        # "log in" as admin and close the club
        creator = User.objects.get(username='ADMIN')
        Client.headers.update({'Authorization': 'Token '+ creator.token()})
        data = {'BookClub_ID': self.bookId, 'User_ID': self.adminId, 'Param_to_change' : 'Open', 'New_value': False}
        response = Client.post('http://testserver/Homepage/set_club', json=data)
        self.assertEqual(response.status_code, 200) # expected status: 200
        self.assertEqual(json.loads(response.content)['Open'], False) # now closed for new members
        
        # "log in" as a normal user
        user = User.objects.get(username='Jaycar')
        Client.headers.update({'Authorization': 'Token '+ user.token()})

        data = {'User_ID': self.userId, 'BookClub_ID': self.bookId}
        response = Client.post('http://testserver/Homepage/join_book_club', json=data)
        
        # expected status: 400
        self.assertEqual(response.status_code, 400)

    def test_new_user_is_not_admin(self):
        self.test_user_can_join_club()

        data = {'User_ID': self.userId, 'BookClub_ID': self.bookId}
        response = Client.post('http://testserver/Homepage/is_admin', json=data)

        # expected status: 200
        self.assertEqual(response.status_code, 200)
        self.assertEqual(json.loads(response.content), {'isAdmin': False})

    def test_new_user_can_not_delete_club(self):
        self.test_user_can_join_club()

        data = {'User_ID': self.userId, 'BookClub_ID': self.bookId}
        response = Client.post('http://testserver/Homepage/delete_book_club', json=data)

        # expected status: 401_UNAUTHORIZED
        self.assertEqual(response.status_code, 401)

    # any user can view the book club
    def test_user_can_get_correct_details(self):
        data = {'BookClub_ID': self.bookId}
        response = Client.post('http://testserver/Homepage/get_single_bookclub', json=data)
        
        self.assertEqual(response.status_code, 200) # expected status: 200

        book = BookClub.objects.get(Name='A new club!')
        serializer =  BookClubSearchSerializer(book)
        self.assertEqual(json.loads(response.content), serializer.data)

    # any user can search for the book club
    def test_can_search_for_bookclub(self):
        book = BookClub.objects.get(Name='A new club!')
        serializer =  BookClubSearchSerializer(book)

        data = {'Tags': ['Climate Action']}
        response = Client.post('http://testserver/Homepage/search_book_clubs', json=data)
        self.assertEqual(response.status_code, 200) # expected status: 200
        self.assertEqual(json.loads(response.content)[0], serializer.data)

        data = {'Tags': ['Sydney']}
        response = Client.post('http://testserver/Homepage/search_book_clubs', json=data)
        self.assertEqual(response.status_code, 200) # expected status: 200
        self.assertEqual(json.loads(response.content)[0], serializer.data)

        data = {'Tags': ['Sydney', 'Horror']}
        response = Client.post('http://testserver/Homepage/search_book_clubs', json=data)
        self.assertEqual(response.status_code, 200) # expected status: 200
        self.assertEqual(json.loads(response.content)[0], serializer.data)

        data = {'Tags': ['DNE']}
        response = Client.post('http://testserver/Homepage/search_book_clubs', json=data)
        self.assertEqual(response.status_code, 200) # expected status: 200

    def test_user_can_see_joined_clubs(self):
        self.test_user_can_join_club()
        book = BookClub.objects.filter(Name='A new club!')
        serializer = BookClubListSerializer(book, many=True)

        data = {'id': self.userId}
        response = Client.post('http://testserver/Homepage/get_book_clubs', json=data)
        self.assertEqual(response.status_code, 200) # expected status: 200
        self.assertEqual(json.loads(response.content), serializer.data)

    def test_user_can_not_modify_club(self):
        self.test_user_can_join_club()

        data = {'BookClub_ID': self.bookId, 'User_ID': self.userId, 'Param_to_change' : 'Open', 'New_value': False}
        response = Client.post('http://testserver/Homepage/set_club', json=data)
        
        self.assertEqual(response.status_code, 401) # unauthorised

    def test_user_cant_kick_others_out_of_club(self):
        self.test_user_can_join_club()

        Client.headers.update({'Authorization': 'Token '+ self.hacker.token()})

        data = {'User_ID': self.userId, 'BookClub_ID': self.bookId}
        response = Client.post('http://testserver/Homepage/leave_club', json=data)
        
        self.assertEqual(response.status_code, 401) # unauthorised

class BookClubDiscussionTest(TestCase):
    """ Test module for bookclub discussions
            with 2 users, 1 bookclub  """
    
    userId = 0 # id of a user who is not admin, but part of the club
    bookId = 0
    adminId = 0

    # make a club, a user who joins that club
    def setUp(self):
        creator = User.objects.create(
            username='ADMIN', email='admin@example.com', profile_pic='a admin path', is_staff=False)
        creator.save()

        data = {'User_ID': creator.id, 'Tags': ["Sydney", "Horror", "Climate Action"], 
                'Name': 'A new club!', 'Profile_Pic': 'path'}
        
        Client.headers.update({'Authorization': 'Token '+ creator.token()})
        response = Client.post('http://testserver/Homepage/create_book_club', json=data)
        self.assertEqual(response.status_code, 201)

        user = User.objects.create(
            username='Jaycar', email='test@example.com', profile_pic='a test path', is_staff=False)
        user.save()
        Client.headers.update({'Authorization': 'Token '+ user.token()})

        book = BookClub.objects.get(Name='A new club!')
        self.userId = user.id
        self.bookId = book.BookClub_ID
        self.adminId = creator.id

        # User joins the club:
        data = {'User_ID': self.userId, 'BookClub_ID': self.bookId}
        response = Client.post('http://testserver/Homepage/join_book_club', json=data)
        self.assertEqual(response.status_code, 201)

    def test_joined_user_can_post_discussion(self):
        data = {'BookClub_ID': self.bookId, 'User_ID' : self.userId, 'Title': 'Chapter 3 thoughts', 'Content': '[SPOILERS]'}
        response = Client.post('http://testserver/Homepage/post_discussion', json=data)
        
        self.assertEqual(response.status_code, 201) # expected status: 201_CREATED

        discussion = Discussion.objects.get(Title = 'Chapter 3 thoughts')
        serializer = DiscussionSerializer(discussion)
        self.assertEqual(json.loads(response.content), serializer.data)

    def test_joined_user_can_reply_discussion(self):
        self.test_joined_user_can_post_discussion()

        discussion = Discussion.objects.get(Title = 'Chapter 3 thoughts')
        discussionId = discussion.Discussion_ID

        data = {'Discussion_ID': discussionId, 'User_ID' : self.userId, 'Content': 'Oi! no spoilerss!'}
        response = Client.post('http://testserver/Homepage/post_reply', json=data)
        
        self.assertEqual(response.status_code, 201) # expected status: 201_CREATED
        self.assertEqual(json.loads(response.content)['Content'], 'Oi! no spoilerss!')

    def test_author_can_delete_discussion(self):
        self.test_joined_user_can_post_discussion()

        discussion = Discussion.objects.get(Title = 'Chapter 3 thoughts')
        discussionId = discussion.Discussion_ID

        data = {'Discussion_ID': discussionId, 'User_ID' : self.userId}
        response = Client.post('http://testserver/Homepage/delete_discussion', json=data)
        
        self.assertEqual(response.status_code, 200) # expected status: 200_OK

        # the discussion is deleted, so an error will be raised trying to retrieve it
        with self.assertRaises(Discussion.DoesNotExist):
            thread = Discussion.objects.get(Title = 'Chapter 3 thoughts')

    def test_author_can_delete_reply(self):
        self.test_joined_user_can_reply_discussion()

        thread = Thread.objects.get(Content = 'Oi! no spoilerss!')
        threadId = thread.Thread_ID

        data = {'Thread_ID': threadId, 'User_ID' : self.userId}
        response = Client.post('http://testserver/Homepage/delete_thread', json=data)
        
        self.assertEqual(response.status_code, 200) # expected status: 200_OK

        # the thread is deleted, so an error will be raised trying to retrieve it
        with self.assertRaises(Thread.DoesNotExist):
            thread = Thread.objects.get(Content = 'Oi! no spoilerss!')

    def test_author_can_edit_reply(self):
        self.test_joined_user_can_reply_discussion()

        thread = Thread.objects.get(Content = 'Oi! no spoilerss!')
        threadId = thread.Thread_ID

        data = {'Thread_ID': threadId, 'User_ID' : self.userId, 'Content' : 'Oi! no spoilers! [edit: typo]'}
        response = Client.post('http://testserver/Homepage/edit_thread', json=data)
        
        self.assertEqual(response.status_code, 200) # expected status: 200_OK
        self.assertEqual(json.loads(response.content)['Content'], 'Oi! no spoilers! [edit: typo]')

    def test_admin_can_post_discussion(self):
        # "log in" as admin and post something
        creator = User.objects.get(username='ADMIN')
        Client.headers.update({'Authorization': 'Token '+ creator.token()})

        data = {'BookClub_ID': self.bookId, 'User_ID' : self.adminId, 'Title': 'A quick update', 'Content': 'just some admin updates...'}
        response = Client.post('http://testserver/Homepage/post_discussion', json=data)
    
        self.assertEqual(response.status_code, 201) # expected status: 201_CREATED

        discussion = Discussion.objects.get(Title = 'A quick update')
        serializer = DiscussionSerializer(discussion)
        self.assertEqual(json.loads(response.content), serializer.data)

        # "log in" as a normal user again (for rest of the tests)
        user = User.objects.get(username='Jaycar')
        Client.headers.update({'Authorization': 'Token '+ user.token()})

    def test_user_cant_delete_non_author_post(self):
        self.test_admin_can_post_discussion()

        discussion = Discussion.objects.get(Title = 'A quick update')
        discussionId = discussion.Discussion_ID

        data = {'Discussion_ID': discussionId, 'User_ID' : self.userId}
        response = Client.post('http://testserver/Homepage/delete_discussion', json=data)
        
        self.assertEqual(response.status_code, 401) # expected status: HTTP_401_UNAUTHORIZED

    def test_user_can_see_posts(self):
        self.test_admin_can_post_discussion()

        discussion = Discussion.objects.filter(Title = 'A quick update')
        serializer = DiscussionSerializer(discussion, many=True)

        data = {'BookClub_ID': self.bookId}
        response = Client.post('http://testserver/Homepage/get_discussions', json=data)
        self.assertEqual(response.status_code, 200) # expected status: 200_OK
        self.assertEqual(json.loads(response.content), serializer.data)
    
    def test_user_can_get_info(self):
        self.test_admin_can_post_discussion()

        discussion = Discussion.objects.get(Title = 'A quick update')
        discussionId = discussion.Discussion_ID

        data = {'Discussion_ID': discussionId}
        response = Client.post('http://testserver/Homepage/get_disussion_information', json=data)
        self.assertEqual(response.status_code, 200) # expected status: 200_OK
        self.assertEqual(json.loads(response.content)['User_ID']['username'], 'ADMIN')

    def test_user_can_get_threads(self):
        self.test_author_can_edit_reply()

        thread = Thread.objects.filter(Q(Content = 'Oi! no spoilers! [edit: typo]') | Q(Content='[SPOILERS]'))
        serializer = ThreadSerializer(thread, many=True)
        discussion = Discussion.objects.get(Title = 'Chapter 3 thoughts')
        discussionId = discussion.Discussion_ID

        data = {'Discussion_ID': discussionId}
        response = Client.post('http://testserver/Homepage/get_discussion_threads', json=data)
        self.assertEqual(response.status_code, 200) # expected status: 200_OK
        print(json.loads(response.content)['Threads'])

    def test_admin_can_post_a_reply(self):
        self.test_joined_user_can_post_discussion()

        # "log in" as admin and post something
        creator = User.objects.get(username='ADMIN')
        Client.headers.update({'Authorization': 'Token '+ creator.token()})

        discussion = Discussion.objects.get(Title = 'Chapter 3 thoughts')
        discussionId = discussion.Discussion_ID

        data = {'Discussion_ID': discussionId, 'User_ID' : self.adminId, 'Content': 'The is an warning from your admin, no spoilers pls'}
        response = Client.post('http://testserver/Homepage/post_reply', json=data)
    
        self.assertEqual(response.status_code, 201) # expected status: 201_CREATED

        # "log in" as a normal user again (for rest of the tests)
        user = User.objects.get(username='Jaycar')
        Client.headers.update({'Authorization': 'Token '+ user.token()})
        self.assertEqual(json.loads(response.content)['Content'], 'The is an warning from your admin, no spoilers pls')

    def test_author_can_not_delete_others_reply(self):
        self.test_admin_can_post_a_reply()

        thread = Thread.objects.get(Content = 'The is an warning from your admin, no spoilers pls')
        threadId = thread.Thread_ID

        data = {'Thread_ID': threadId, 'User_ID' : self.userId}
        response = Client.post('http://testserver/Homepage/delete_thread', json=data)
        
        self.assertEqual(response.status_code, 401) # unauthorised

    def test_author_can_not_edit_others_reply(self):
        self.test_admin_can_post_a_reply()

        thread = Thread.objects.get(Content = 'The is an warning from your admin, no spoilers pls')
        threadId = thread.Thread_ID

        data = {'Thread_ID': threadId, 'User_ID' : self.userId, 'Content' : 'Oi! no spoilers! [edit: typo]'}
        response = Client.post('http://testserver/Homepage/edit_thread', json=data)
        
        self.assertEqual(response.status_code, 401) # unauthorised

class BookClubMeetingTest(TestCase):
    """ Test module meetings in a bookclub
            with 3 users, 1 bookclub  """
    
    userId = 0 # id of a user who is not admin
    bookId = 0
    adminId = 0
    hacker = None # this user will try to cause trouble

    # make and save a single user who creates a club
    def setUp(self):
        creator = User.objects.create(
            username='ADMIN', email='admin@example.com', profile_pic='a admin path', is_staff=False)
        creator.save()

        data = {'User_ID': creator.id, 'Tags': ["Sydney", "Horror", "Climate Action"], 
                'Name': 'A new club!', 'Profile_Pic': 'path'}
        
        Client.headers.update({'Authorization': 'Token '+ creator.token()})
        response = Client.post('http://testserver/Homepage/create_book_club', json=data)
        self.assertEqual(response.status_code, 201)

        book = BookClub.objects.get(Name='A new club!')
        self.bookId = book.BookClub_ID
        self.adminId = creator.id

        # make a meeting that's a while ago
        data = {'BookClub_ID': self.bookId, 'User_ID': creator.id, 'Time' : '03-11-2019 00:00', 'Title': 'A long, long time ago...', 'Location': 'a galaxy far, far away'}
        response = Client.post('http://testserver/Homepage/create_meeting', json=data)
        self.assertEqual(response.status_code, 201) # expected status: 201_CREATED

        # make a meeting that's tomorrow
        data = {'BookClub_ID': self.bookId, 'User_ID': creator.id, 'Time' : (datetime.date.today() + datetime.timedelta(days=1)).strftime('%d-%m-%Y %H:%M'), 'Title': 'Garden Party', 'Location': 'TBA'}
        response = Client.post('http://testserver/Homepage/create_meeting', json=data)
        self.assertEqual(response.status_code, 201) # expected status: 201_CREATED

        user = User.objects.create(
            username='Jaycar', email='test@example.com', profile_pic='a test path', is_staff=False)
        user.save()
        Client.headers.update({'Authorization': 'Token '+ user.token()})
        self.userId = user.id
        
        # the user joins the club
        data = {'User_ID': self.userId, 'BookClub_ID': self.bookId}
        response = Client.post('http://testserver/Homepage/join_book_club', json=data)
        self.assertEqual(response.status_code, 201)

        hacker = User.objects.create(
            username='evil', email='bad@example.com', profile_pic='a sneaky path', is_staff=False)
        hacker.save()
        self.hacker = hacker

    def test_user_can_attend_meeting(self):
        meeting = Meeting.objects.get(Title='Garden Party')
        meetingId = meeting.Meeting_ID

        data = {'Meeting_ID': meetingId, 'User_ID': self.userId}
        response = Client.post('http://testserver/Homepage/attend_meeting', json=data)

        self.assertEqual(response.status_code, 201)
        self.assertEqual(json.loads(response.content)['Title'], 'Garden Party')

        meeting = Meeting.objects.get(Title='A long, long time ago...')
        meetingId = meeting.Meeting_ID

        data = {'Meeting_ID': meetingId, 'User_ID': self.userId}
        response = Client.post('http://testserver/Homepage/attend_meeting', json=data)

        self.assertEqual(response.status_code, 201)
        self.assertEqual(json.loads(response.content)['Title'], 'A long, long time ago...')

    def test_user_cant_attend_meeting_twice(self):
        self.test_user_can_attend_meeting()

        meeting = Meeting.objects.get(Title='Garden Party')
        meetingId = meeting.Meeting_ID

        data = {'Meeting_ID': meetingId, 'User_ID': self.userId}
        response = Client.post('http://testserver/Homepage/attend_meeting', json=data)

        self.assertEqual(response.status_code, 409) # 409_CONFLICT

    def test_user_cant_create_meeting(self):
        data = {'BookClub_ID': self.bookId, 'User_ID': self.userId, 'Time' : '03-11-2019 00:00', 'Title': 'My Own Meet-up', 'Location': 'a place without admins'}
        response = Client.post('http://testserver/Homepage/create_meeting', json=data)

        self.assertEqual(response.status_code, 401)

    def test_user_cant_delete_meeting(self):
        meeting = Meeting.objects.get(Title='Garden Party')
        meetingId = meeting.Meeting_ID

        data = {'Meeting_ID': meetingId, 'User_ID': self.userId}
        response = Client.post('http://testserver/Homepage/delete_meeting', json=data) 

        self.assertEqual(response.status_code, 401)

    def test_user_cannt_delete_old_meeting_attendance(self):
        self.test_user_can_attend_meeting()

        meeting = Meeting.objects.get(Title='A long, long time ago...')
        meetingId = meeting.Meeting_ID

        data = {'Meeting_ID': meetingId, 'User_ID': self.userId}
        response = Client.post('http://testserver/Homepage/unattend_meeting', json=data) 

        self.assertEqual(response.status_code, 400) # they can unattend a past meeting

    def test_user_cant_delete_attendance_if_didnt_attend(self):
        meeting = Meeting.objects.get(Title='Garden Party')
        meetingId = meeting.Meeting_ID

        data = {'Meeting_ID': meetingId, 'User_ID': self.userId}
        response = Client.post('http://testserver/Homepage/unattend_meeting', json=data) 

        self.assertEqual(response.status_code, 400) # bad request

    def test_user_can_delete_valid_attendance(self):
        self.test_user_can_attend_meeting()

        meeting = Meeting.objects.get(Title='Garden Party')
        meetingId = meeting.Meeting_ID

        data = {'Meeting_ID': meetingId, 'User_ID': self.userId}
        response = Client.post('http://testserver/Homepage/unattend_meeting', json=data) 

        self.assertEqual(response.status_code, 200) # 200_OK

    def test_user_cannt_delete_others_attendance(self):
        self.test_user_can_attend_meeting()
        Client.headers.update({'Authorization': 'Token '+ self.hacker.token()})

        meeting = Meeting.objects.get(Title='Garden Party')
        meetingId = meeting.Meeting_ID

        data = {'Meeting_ID': meetingId, 'User_ID': self.userId}
        response = Client.post('http://testserver/Homepage/unattend_meeting', json=data) 

        self.assertEqual(response.status_code, 401) # unauth
    
    def test_can_see_future_meetings(self):

        data = {'BookClub_ID': self.bookId, 'User_ID': self.userId}
        response = Client.post('http://testserver/Homepage/get_future_meetings', json=data) 

        self.assertEqual(response.status_code, 200) # 200_OK
        self.assertEqual(json.loads(response.content)[0]['Title'], 'Garden Party')
        self.assertEqual(json.loads(response.content)[0]['user_attendance'], 0)

    def test_can_see_future_meetings_attending(self):
        self.test_user_can_attend_meeting()

        data = {'BookClub_ID': self.bookId, 'User_ID': self.userId}
        response = Client.post('http://testserver/Homepage/get_future_meetings', json=data) 

        self.assertEqual(response.status_code, 200) # 200_OK
        self.assertEqual(json.loads(response.content)[0]['Title'], 'Garden Party')
        self.assertEqual(json.loads(response.content)[0]['user_attendance'], 1)

class BookClubPollTest(TestCase):
    """ Test module for polls in a bookclub
            with 3 users, 1 bookclub  """
    
    userId = 0 # id of a user who is not admin
    bookId = 0
    adminId = 0
    hacker = None # this user will try to cause trouble

    # make and save a single user who creates a club
    def setUp(self):
        creator = User.objects.create(
            username='ADMIN', email='admin@example.com', profile_pic='a admin path', is_staff=False)
        creator.save()

        data = {'User_ID': creator.id, 'Tags': ["Sydney", "Horror", "Climate Action"], 
                'Name': 'A new club!', 'Profile_Pic': 'path'}
        
        Client.headers.update({'Authorization': 'Token '+ creator.token()})
        response = Client.post('http://testserver/Homepage/create_book_club', json=data)
        self.assertEqual(response.status_code, 201)

        book = BookClub.objects.get(Name='A new club!')
        self.bookId = book.BookClub_ID
        self.adminId = creator.id

        # make a poll that's open until next week
        data = {'BookClub_ID': self.bookId, 'User_ID': self.adminId, 'Time' :  (datetime.date.today() + datetime.timedelta(days=7)).strftime('%d-%m-%Y %H:%M:%S'), 'Title': 'Can I ask a question?', 'Choices': ['yes', 'no']}
        response = Client.post('http://testserver/Homepage/create_poll', json=data)  
        self.assertEqual(response.status_code, 201) # expected status: 201_CREATED

        user = User.objects.create(
            username='Jaycar', email='test@example.com', profile_pic='a test path', is_staff=False)
        user.save()
        Client.headers.update({'Authorization': 'Token '+ user.token()})
        self.userId = user.id
        
        # the user joins the club
        data = {'User_ID': self.userId, 'BookClub_ID': self.bookId}
        response = Client.post('http://testserver/Homepage/join_book_club', json=data)
        self.assertEqual(response.status_code, 201)

        hacker = User.objects.create(
            username='evil', email='bad@example.com', profile_pic='a sneaky path', is_staff=False)
        hacker.save()
        self.hacker = hacker
    
    def test_user_can_see_future_polls(self):
        data = {'BookClub_ID': self.bookId}
        response = Client.post('http://testserver/Homepage/get_current_polls', json=data) 

        self.assertEqual(response.status_code, 200) # 200_OK
        self.assertEqual(json.loads(response.content)[0]['Title'], 'Can I ask a question?')

        pollId = json.loads(response.content)[0]['Poll_ID']

        data = {'User_ID': self.userId, 'Poll_ID': pollId}
        response = Client.post('http://testserver/Homepage/get_poll_info', json=data) 

        self.assertEqual(response.status_code, 200) # 200_OK

    def test_user_can_vote_future_poll(self):

        poll = Poll.objects.get(Title = 'Can I ask a question?' )
        choice = Choice.objects.get(Description='yes')

        pollId = poll.Poll_ID
        choiceId = choice.Choice_ID

        data = {'User_ID': self.userId, 'Poll_ID': pollId, 'Choice_ID': choiceId}
        response = Client.post('http://testserver/Homepage/vote_poll', json=data) 

        self.assertEqual(response.status_code, 201)
        for obj in json.loads(response.content):
            if obj['Choice_ID'] is choiceId:
                self.assertEqual(obj['user_vote'], 1)

    def test_user_cannt_vote_twice(self):
        self.test_user_can_vote_future_poll()

        poll = Poll.objects.get(Title = 'Can I ask a question?' )
        choice = Choice.objects.get(Description='yes')

        pollId = poll.Poll_ID
        choiceId = choice.Choice_ID

        data = {'User_ID': self.userId, 'Poll_ID': pollId, 'Choice_ID': choiceId}
        response = Client.post('http://testserver/Homepage/vote_poll', json=data) 

        self.assertEqual(response.status_code, 409) # expect http conflict


    def test_user_can_delete_vote(self):
        self.test_user_can_vote_future_poll()

        poll = Poll.objects.get(Title = 'Can I ask a question?' )
        pollId = poll.Poll_ID

        data = {'User_ID': self.userId, 'Poll_ID': pollId}
        response = Client.post('http://testserver/Homepage/delete_vote', json=data) 

        self.assertEqual(response.status_code, 200)
    
    def test_user_cant_delete_others_vote(self):
        self.test_user_can_vote_future_poll()

        Client.headers.update({'Authorization': 'Token '+ self.hacker.token()})


        poll = Poll.objects.get(Title = 'Can I ask a question?' )
        pollId = poll.Poll_ID

        data = {'User_ID': self.userId, 'Poll_ID': pollId}
        response = Client.post('http://testserver/Homepage/delete_vote', json=data) 

        self.assertEqual(response.status_code, 401)

    def test_deleted_vote_is_gone(self):
        self.test_user_can_delete_vote()

        poll = Poll.objects.get(Title = 'Can I ask a question?' )
        pollId = poll.Poll_ID

        data = {'User_ID': self.userId, 'Poll_ID': pollId}
        response = Client.post('http://testserver/Homepage/get_poll_info', json=data)    

        self.assertEqual(response.status_code, 200)
        for obj in json.loads(response.content):
            self.assertEqual(obj['user_vote'], 0)

    def test_user_cant_delete_poll(self):
        poll = Poll.objects.get(Title='Can I ask a question?')
        pollId = poll.Poll_ID

        data = {'Poll_ID': pollId, 'User_ID': self.userId}

        response = Client.post('http://testserver/Homepage/delete_poll', json=data) 
        self.assertEqual(response.status_code, 401)

    def test_user_cant_create_poll(self):
        data = {'BookClub_ID': self.bookId, 'User_ID': self.userId, 'Time' : '02-02-2019 00:00:00', 'Title': 'Can I ask a question?', 'Choices': ['yes', 'no']}
        response = Client.post('http://testserver/Homepage/create_poll', json=data)
        
        self.assertEqual(response.status_code, 401) # expected status: unauthorised

class SuperUserTest(TestCase):
    """ Test module for a superuser of a bookclub
            with 2 users, 1 bookclub  """
    userId = 0
    bookId = 0

    # make and save a single user who creates a club
    def setUp(self):
        creator = User.objects.create(
            username='ADMIN', email='admin@example.com', profile_pic='a admin path', is_staff=False)
        creator.save()
        data = {'User_ID': creator.id, 'Tags': ["Sydney", "Horror", "Climate Action"], 
                'Name': 'A new club!', 'Profile_Pic': 'path'}
        
        Client.headers.update({'Authorization': 'Token '+ creator.token()})
        response = Client.post('http://testserver/Homepage/create_book_club', json=data)
        self.assertEqual(response.status_code, 201)


        user = User.objects.create(
            username='Jaycar', email='test@example.com', profile_pic='a test path', is_staff=False)
        user.is_superuser = True
        user.is_staff = True
        user.save()

        book = BookClub.objects.get(Name='A new club!')
        self.userId = user.id
        self.bookId = book.BookClub_ID

    # the user who made the book club should be admin
    def test_superuser_is_admin(self):
        data = {'User_ID': self.userId, 'BookClub_ID': self.bookId}
        response = Client.post('http://testserver/Homepage/is_admin', json=data)

        # expected status: 200
        self.assertEqual(response.status_code, 200)
        self.assertEqual(json.loads(response.content), {'isAdmin':True})

    # the admin can delete the bookclub
    def test_superuser_can_delete(self):
        data = {'User_ID': self.userId, 'BookClub_ID': self.bookId}
        response = Client.post('http://testserver/Homepage/delete_book_club', json=data)

        # expected status: 200
        self.assertEqual(response.status_code, 200)

        # the club is deleted, so an error will be raised trying to retrieve it
        with self.assertRaises(BookClub.DoesNotExist):
            book = BookClub.objects.get(Name='A new club!')

    def test_can_get_correct_details(self):
        data = {'BookClub_ID': self.bookId}
        response = Client.post('http://testserver/Homepage/get_single_bookclub', json=data)
        
        self.assertEqual(response.status_code, 200) # expected status: 200
        self.assertEqual(json.loads(response.content)['Name'], 'A new club!')
        self.assertEqual(json.loads(response.content)['Profile_Pic'], 'path')
        self.assertEqual(json.loads(response.content)['Open'], True) # should be open by default

    def test_superuser_can_change_logo(self):
        data = {'BookClub_ID': self.bookId, 'User_ID': self.userId, 'Param_to_change' : 'Logo', 'New_value': 'new_path'}
        response = Client.post('http://testserver/Homepage/set_club', json=data)
        
        self.assertEqual(response.status_code, 200) # expected status: 200
        self.assertEqual(json.loads(response.content)['Name'], 'A new club!')
        self.assertEqual(json.loads(response.content)['Profile_Pic'], 'new_path') #only the logo should be updated
        self.assertEqual(json.loads(response.content)['Open'], True) 

    def test_superuser_can_change_name(self):
        data = {'BookClub_ID': self.bookId, 'User_ID': self.userId, 'Param_to_change' : 'Name', 'New_value': 'a better name'}
        response = Client.post('http://testserver/Homepage/set_club', json=data)
        
        self.assertEqual(response.status_code, 200) # expected status: 200
        self.assertEqual(json.loads(response.content)['Name'], 'a better name') # only name updated
        self.assertEqual(json.loads(response.content)['Profile_Pic'], 'path') 
        self.assertEqual(json.loads(response.content)['Open'], True) 

    def test_superuser_can_toggle_open(self):
        data = {'BookClub_ID': self.bookId, 'User_ID': self.userId, 'Param_to_change' : 'Open', 'New_value': False}
        response = Client.post('http://testserver/Homepage/set_club', json=data)
        
        self.assertEqual(response.status_code, 200) # expected status: 200
        self.assertEqual(json.loads(response.content)['Name'], 'A new club!') 
        self.assertEqual(json.loads(response.content)['Profile_Pic'], 'path') 
        self.assertEqual(json.loads(response.content)['Open'], False) # now closed for new members

    def test_superuser_cant_change_invalid(self):
        data = {'BookClub_ID': self.bookId, 'User_ID': self.userId, 'Param_to_change' : 'kjsefh', 'New_value': 'what does this even mean'}
        response = Client.post('http://testserver/Homepage/set_club', json=data)
        
        self.assertEqual(response.status_code, 400) # expected status: 400 bad request
  
    def test_superuser_can_create_poll(self):
        data = {'BookClub_ID': self.bookId, 'User_ID': self.userId, 'Time' : '02-02-2019 00:00:00', 'Title': 'Can I ask a question?', 'Choices': ['yes', 'no']}
        response = Client.post('http://testserver/Homepage/create_poll', json=data)
        
        self.assertEqual(response.status_code, 201) # expected status: 201_CREATED

        poll = Poll.objects.get(Title='Can I ask a question?')
        serializer = PollSerializer(poll)
        self.assertEqual(json.loads(response.content), serializer.data)

        # note: we use get past meetings, so this test will always work
        response = Client.post('http://testserver/Homepage/get_past_polls', json=data) 

        self.assertEqual(response.status_code, 200) # expected status: 200
        self.assertEqual(json.loads(response.content)[0]['Title'], 'Can I ask a question?') 

    def test_superuser_can_create_meeting(self):
        data = {'BookClub_ID': self.bookId, 'User_ID': self.userId, 'Time' : '03-01-2019 00:00', 'Title': 'Garden Party', 'Location': 'TBA'}
        response = Client.post('http://testserver/Homepage/create_meeting', json=data)

        self.assertEqual(response.status_code, 201) # expected status: 201_CREATED
        self.assertEqual(json.loads(response.content)['Title'], 'Garden Party') 

        # note: we use get past meetings, so this test will always work
        response = Client.post('http://testserver/Homepage/get_past_meetings', json=data) 

        self.assertEqual(response.status_code, 200) # expected status: 200
        self.assertEqual(json.loads(response.content)[0]['Title'], 'Garden Party') 

    def test_superuser_can_delete_meeting(self):

        self.test_superuser_can_create_meeting() # let's re-use this meeting

        meeting = Meeting.objects.get(Title='Garden Party')
        meetingId = meeting.Meeting_ID

        data = {'Meeting_ID': meetingId, 'User_ID': self.userId}

        response = Client.post('http://testserver/Homepage/delete_meeting', json=data) 
        self.assertEqual(response.status_code, 200) # expected status: 200
        
        # the meeting is deleted, so an error will be raised trying to retrieve it
        with self.assertRaises(Meeting.DoesNotExist):
            meeting = Meeting.objects.get(Title='Garden Party')

    def test_superuser_can_delete_poll(self):

        self.test_superuser_can_create_poll() # let's re-use this poll

        poll = Poll.objects.get(Title='Can I ask a question?')
        pollId = poll.Poll_ID

        data = {'Poll_ID': pollId, 'User_ID': self.userId}

        response = Client.post('http://testserver/Homepage/delete_poll', json=data) 
        self.assertEqual(response.status_code, 200) # expected status: 200
        
        # the poll is deleted, so an error will be raised trying to retrieve it
        with self.assertRaises(Poll.DoesNotExist):
            polls = Poll.objects.get(Title='Can I ask a question?')

    def test_superuser_cant_leave_club(self):
        data = {'User_ID': self.userId, 'BookClub_ID': self.bookId}
        response = Client.post('http://testserver/Homepage/leave_club', json=data)
        
        self.assertEqual(response.status_code, 400) # they never joined 400 bad request

class MultiUserAuthTest(TestCase):
    """ Test module for secuirty
            with 2 users  """
    
    userId = 0 # id of a user who is not admin, but part of the club
    hackerId = 0

    # make a club, a user who joins that club
    def setUp(self):
        hacker = User.objects.create(
            username='evil', email='bad@example.com', profile_pic='a sneaky path', is_staff=False)
        hacker.save()
        self.hackerId = hacker.id

        user = User.objects.create(
            username='Jaycar', email='test@example.com', profile_pic='a test path', is_staff=False)
        user.save()
        Client.headers.update({'Authorization': 'Token '+ hacker.token()})
        self.userId = user.id

    def test_user_can_not_change_others_pic(self): 
        data = {'User_ID': self.userId, 'Param_to_change': 'Profile_pic', 'New_value': 'a new path'}
        response = Client.post('http://testserver/Homepage/set_user', json=data)
        self.assertEqual(response.status_code, 401)
