# BookFace
## Testing
see `frontend` and `backend` folders for testing documentation.

## Frontend

```bash
npm install date-fns@next @date-io/date-fns 
npm i @material-ui/pickers
npm install aws-sdk
npm install date-fns@2.1.0
npm install crypto-js
```
Start the frontend by running `npm install` and then `npm start` in the `front_end` folder.

## Backend
```bash
pip3 install Django==2.2.6
pip3 install djangorestframework==3.9.4
pip3 install jwt==0.6.1
pip3 install Pillow==6.2.0
pip3 install django-cors-headers==3.1.1
pip3 install pycryptodome
```

Start the backend by running `python3 manage.py runserver` in the `BookFace` folder, no need to make migrations before that since backend-pat's db file should already be up to date with the migrations integrated.

#### Test user: 
`Email: barry@bingbong.com ` 
`Password: 2 `

### Table of Contents
Here are the instructions to the pages to:
1. [Register](#homepageregister)
2. [Login](#homepagelogin)
3. [List user book clubs](#homepageget_book_clubs)
4. [List a single book club](#homepageget_single_bookclub)
5. [List book club discussions](#homepageget_discussions)
6. [List discussion information](#homepageget_disussion_information)
7. [List threads of a book club discussion](#homepageget_discussion_threads)
8. [List polls (current and past)](#homepageget_current_polls-and-homepageget_past_polls)
9. [List specific poll info](#homepageget_poll_info)
10. [List meetings (future and past)](#homepageget_future_meetings-and-homepageget_past_meetings)
11. [Search for book clubs based on tags](#homepagesearch_book_clubs)
12. [Create a book club](#homepagecreate_book_club)
13. [Join a book club](#homepagejoin_book_club)
14. [Post new discussion in the specified book club](#homepagepost_discussion)
15. [Post a reply to a discussion](#homepagepost_reply)
16. [Make a new poll in the specified book club](#homepagecreate_poll)
17. [Vote in a poll](#homepagevote_poll)
18. [Search for a book(i.e. book serach bar) (DELETED FUNCTIONALITY)](#homepagesearch_book)
19. [Create a meeting](#homepagecreate_meeting)
20. [Mark as attending a meeting](#homepageattend_meeting)
21. [Delete a book club](#homepagedelete_book_club)
22. [Delete a discussion (including all of its threads) or a single thread](#homepagedelete_discussion-and-homepagedelete_thread)
23. [Delete a poll or a meeting](#homepagedelete_poll-and-homepagedelete_meeting)
24. [Change book details (i.e. Book Club Settings)](#homepageset_club)
25. [Change user details (i.e. User Settings)](#homepageset_user)
26. [Check whether a user is an admin in a specific book club](#homepageis_admin)
27. [Query a user by user id](#homepageget_user)
28. [Delete user's own vote in a poll](#homepagedelete_vote)
29. [Delete a user's mark of attendance from a meeting](#homepageunattend_meeting)
30. [Edit a thread](#homepageedit_thread)
31. [Leave a book club](#homepageleave_club)

### Homepage/register
- INPUT: Send a JSON format POST request with "email", "username" and "password"
- Does NOT allow duplicate emails and usernames
- OUTPUT: A JSON format response with "id", "token", "username" and "email", expected status: 201_CREATED
![register](https://media.github.sydney.edu.au/user/2527/files/bc016f80-ed2e-11e9-9b18-2ef753625829)

### Homepage/login
- INPUT: Send a JSON format POST request with "email" and "password"
- OUTPUT: A JSON format response with "id", "token" and "profile_pic", expected status: 200_OK
![login](https://media.github.sydney.edu.au/user/2527/files/1bf81600-ed2f-11e9-971d-8f080eb32e12)

### **Every view from now on requires an authentication header, set up the auth header by copying the token obtained from registering/loggin in and add a header in the format shown.**
![token](https://media.github.sydney.edu.au/user/2527/files/65486580-ed2f-11e9-8931-60eedeb4bd0d)

### Homepage/get_book_clubs
- INPUT: A JSON format POST request with "id" (user_id)
- OUTPUT: A JSON format response with JSON array of book clubs the user is in, where each object in the array is in the format of "BookClub_ID", "Profile_Pic" and "Name", expected status: 200_OK
![get_book_clubs](https://media.github.sydney.edu.au/user/2527/files/4d396300-f0ee-11e9-8087-c0b24297e8b0)

### Homepage/get_single_bookclub

- INPUT: A JSON format POST request with "BookClub_ID"
```
{
	BookClub_ID: clubId
};
```

- OUTPUT: A JSON format response with a JSON object in the format of "BookClub_ID", "Name" and "Profile_Pic" (path of the picture), expected status: 200_OK
```
{
	BookClub_ID: 29,
	Name: "Test club",
	Open: false,
	Profile_Pic: "dummyPath"
};
```

### Homepage/get_discussions

- INPUT: A JSON format POST request with "BookClub_ID"
- OUTPUT: A JSON format response with JSON array of discussions of the book club, where each object in the array is in the format of "Discssuion_ID", "Title", "Time" and "User_ID" (contains user information needed for rendering), expected status: 200_OK
- Note that the array is ordered from newest to oldest with respect to "Time"
![get_discussions](https://media.github.sydney.edu.au/user/2527/files/9638f800-f17e-11e9-9072-617c76562c48)

### Homepage/get_disussion_information

- INPUT: A JSON format POST request with "Discussion_ID"
- OUTPUT: A JSON format response with a JSON object in the format of "Discssuion_ID", "Title", "Time" and "User_ID" (contains user information needed for rendering), expected status: 200_OK

<img src="https://media.github.sydney.edu.au/user/2536/files/02faf080-f33f-11e9-8204-4c7df63fd358" alt="image" style="zoom:33%;" />

### Homepage/get_discussion_threads

- INPUT: A JSON format POST request with "Discussion_ID"
- OUTPUT: A JSON format response with fields "Title" which is the ittle of the discussion and "Threads" which is a JSON array of thread objects of the discussion, thread objects has fields "Therad_ID", "Content", "Time" and a JSON array called "User_ID" which contains user information needed for rendering, i.e. "username" and "profile_pic", expected status: 200_OK
- Note that the array is ordered from oldest to newest with respect to "Time"
![get_discussion_threads](https://media.github.sydney.edu.au/user/2527/files/8f5ae280-f342-11e9-8b44-e7191e65a459)

### Homepage/get_current_polls AND Homepage/get_past_polls
- get_current_polls returns polls that have NOT reached its end yet, and the opposite is true for get_past_polls, both has the same format of INPUT and OUTPUT however, so it is listed together
- INPUT: A JSON format POST request with "Bookclub_ID"
- OUTPUT: A JSON format response with JSON array of Poll objects of the book club, each object is in the format of "Poll_ID", "Title", "End_Time", expected status: 200_OK
![get_current_polls](https://media.github.sydney.edu.au/user/2527/files/6aa6af80-ed31-11e9-8c01-f83d0bd76e68)

### Homepage/get_poll_info
- The hardest one to code so far :P
- INPUT: A JSON format POST request with "Poll_ID" and "User_ID"
- OUTPUT: A JSON format response with JSON array of Choice objects for the poll, each Choice object has "Choice_ID", "Description", "vote_count" (gives TOTAL NUMBER of votes for this choice) and "user_vote" (0 means user has not voted on this choice and NON-ZERO means they have, somehow this number is actually the total number of votes if the user has voted, I have not been able to fix this jank but I don't see a reason to put more time into it since it already works), expected status: 200_OK

![get_poll_info](https://media.github.sydney.edu.au/user/2527/files/afcae180-ed31-11e9-8fde-1d106a9ba491)

### Homepage/get_future_meetings AND Homepage/get_past_meetings
- Same deal with past and current polls, we have future and past meetings
- INPUT: A JSON format POST request with "BookClub_ID" and "User_ID"
- OUTPUT: A JSON format JSON array of Meeting objects for the book club, each Meeting object has fields "Meeting_ID", "Location", "Time", "Title" and "user_attendance" (0 if user has not attended and 1 if user has attended/marked as attending), expected status: 200_OK

![get_future_meetings](https://media.github.sydney.edu.au/user/2527/files/4ba15200-f9ae-11e9-917f-c060b63bde6f)

### Homepage/search_book_clubs
- INPUT: A JSON format POST request with field "Tags" which should be a JSON array of tags that you would like to search with
- OUTPUT: A JSON format response with JSON array of BookClub objects that meets ALL the tag requirements specified (union), each object has field "Name", "BookClub_ID" and "Profile_Pic"
![search_book_clubs](https://media.github.sydney.edu.au/user/2527/files/b5884480-f0ee-11e9-8e42-9cae24bf8e02)

### Homepage/create_book_club
- INPUT: A JSON format POST request with field "Name", "Profile_Pic", "Tags" and "User_ID"
- "Tags" should be a JSON array of tags to be associated with the book club, tags can be pre-existing or new
- OUTPUT: A JSON format response with "BookClub_ID", "Name" and "Profile_Pic" of newly created book club, expected status: 201_CREATED
- After this operation, a new book club should be created with the specified details and have ONE member, which is the creator specified by "User_ID" in the request, this user has TRUE on "isAdmin"
![create_book_club](https://media.github.sydney.edu.au/user/2527/files/f3cd4480-f17e-11e9-8d7f-fb1ac5a37901)

### Homepage/join_book_club
- INPUT: A JSON format POST request with field "BookClub_ID", "User_ID"
- OUTPUT: A JSON formation response with "BookClub_ID", "User_ID", "isAdmin", expected status: 201_CREATED
- **IMPORTANT: this view checks if user already exists in the book club, if they already exist, then a response with status code 409_CONFLICT with no body will be returned instead**
- A book club can closed to new members, if a book club is closed and a join request is received, response with status code 400_BAD_REQUEST is returned instead
- After this operation, the user will become a member of the book club, and is automatically set to FALSE on isAdmin
![join_bookclub](https://media.github.sydney.edu.au/user/2527/files/f1301680-f1a1-11e9-8e37-f7f4cc72735a)

### Homepage/post_discussion
- INPUT: A JSON format POST request with field "Title", "BookClub_ID", "User_ID" and "Content"
- OUTPUT: A JSON format response of the discussion created with fields "Discussion_ID", "Title", "Time" and "User_ID" (which has content of JSON array of "username" and "profile_pic"), expected status: 201_CREATED
- After this operation, a new discussion will be created under the book club with the specified details and the time set to when server first received and processed the request. This discussion will have ONE thread, which is posted by the author of the thead and has content specified in "Content", "Time" of the thread is the same as the "Time" set in the newly created discussion
![post_discussion](https://media.github.sydney.edu.au/user/2527/files/50c8fa80-f17f-11e9-80f0-90c6fc4c0efd)

### Homepage/post_reply
- INPUT: A JSON format POST request with field "User_ID", "Discussion_ID" and "Content"
- OUTPUT: A JSON format response with fields "Therad_ID", "Content", "Time" and a JSON array called "User_ID" which contains user information needed for rendering, i.e. "username" and "profile_pic", expected status: 201_CREATED
- After this operation, a new thread will be created under the discussion, but more importantly, **the "Time" field of the discussion that the thread is under will now be UPDATED with the "Time" of the new reply thread**, so that `Homepage/get_discussions` always returns the array with the sequence most recent (including replies) discussions first
![post_reply](https://media.github.sydney.edu.au/user/2527/files/01cf9500-f180-11e9-98e3-569b8f549936)

### Homepage/create_poll
- INPUT: A JSON format POST request with field "BookClub_ID", "User_ID", "Time" **(must be in the format of "DD-MM-YYYY HH:MM:SS", this field signifies the END TIME of the poll)**, "Title" and a JSON array of "Choices"
- OUTPUT: A JSON format response with "Poll_ID", "End_Time", "Title", expected status: 201_CREATED
- After this operation, a new poll will be created, the choices specified in "Choices" will also be created and will all refer to the newly created poll
- **Only an admin of the book club can create a new poll, if a non-admin sends this request, a response with no body and status code 401_UNAUTHORIZED will be returned instead**
![create_poll](https://media.github.sydney.edu.au/user/2527/files/6e5b8b80-f1a2-11e9-8c8d-5520df76b228)

### Homepage/vote_poll
- INPUT: A JSON format POST request with field "Poll_ID", "Choice_ID" and "User_ID"
- OUTPUT: Same as [Homepage/get_poll_info](#homepageget_poll_info), expected status: 201_CREATED
- After this operation, a new vote object will be created linked to the specified user and choice
- **NOTE:The view checks for whether the user has previously made a vote of the SAME choice (409_CONFLICT if true), not all choices, it is technically up to frontend to ensure users that have voted cannot vote again**
![vote_poll](https://media.github.sydney.edu.au/user/2527/files/f5a8ff00-f1a2-11e9-99b1-b1f8d5fa7af5)

### Homepage/search_book
- INPUT: A JSON format POST request with field "Title", which is the title you want to search for
- OUTPUT: A JSON array of Book objects that contains the string provided in "Title", note that this search is **case-insensitive**. Each book is shown in the format of "Book_ID" and "Title". Expected_status: 200_OK
![search_book](https://media.github.sydney.edu.au/user/2527/files/59075100-f1e4-11e9-970f-e5979638d4f9)

### Homepage/create_meeting
- INPUT: A JSON format POST request with field "BookClub_ID", "User_ID", "Location", "Book_ID", "Time"
- **"Time" must be a string in the format of "DD-MM-YYYY HH:MM" or we have an exception on our hands :P**
- Note: Time should be in UTC timezone, frontend should convert accordingly before sending it over
- OUTPUT: A JSON format response with fields identical to a Meeting object returned in [Homepage/get_future_meetings AND Homepage/get_past_meetings](#homepageget_future_meetings-and-homepage/get_past_meetings), but it's a SINGLE object, NOT an array. Expected status: 201_CREATED
- **IMPORTANT: Only an admin of the book club can make a new meeting, this is checked against the user id and bookclub id provided to see if the user is an admin of the book club. If not an admin, an empty response with status code 401_UNAUTHORIZED is returned instead**
![create_meeting](https://media.github.sydney.edu.au/user/2527/files/c4e9b980-f1e4-11e9-82e2-f08ae1577060)

### Homepage/attend_meeting
- INPUT: A JSON format POST request with field "Meeting_ID" and "User_ID"
- OUTPUT: Same as [Homepage/create_meeting](#homepagecreate_meeting), expected status: 201_CREATED
- **Note: the view checks if an attendance for the user for the current meeting already exists, if true, returns empty response with status code 409_CONFLICT instead**

![attend_meeting](https://media.github.sydney.edu.au/user/2527/files/e9df2c00-f1e6-11e9-9ddb-a1ed42cd6757)

### Homepage/delete_book_club
- INPUT: A JSON format POST request with field "User_ID", "BookClub_ID"
- OUTPUT: A response with no body and status code 200_OK if deletion successful
- **Only admins of the book club can delete the book club, if a non-admin tries to delete book club, response with status code 401_UNAUTHORIZED is returned instead**

![delete_book_club](https://media.github.sydney.edu.au/user/2527/files/70d7e700-f26f-11e9-9ba2-280e1277806c)

### Homepage/delete_discussion AND Homepage/delete_thread
- INPUT: A JSON format POST request with field "User_ID" and "Discussion_ID" or "Thread_ID" depending on which you are trying to delete
- OUTPUT: A response with status code 200_OK if successful
- **Only authors of the discussion/thread and admins of the book club can delete a discussion/thread, otherwise, response with status code 401_UNAUTHORIZED is returned instead**

Delete discussion:
![delete_discussion](https://media.github.sydney.edu.au/user/2527/files/c44a3500-f26f-11e9-95c8-619c72afb018)

Delete thread:
![delete_thread](https://media.github.sydney.edu.au/user/2527/files/d1672400-f26f-11e9-8527-d8daf2795601)

### Homepage/delete_poll AND Homepage/delete_meeting
- INPUT: A JSON format POST request with field "User_ID" and "Meeting_ID" or "Poll_ID" depending on the object type being deleted
- OUTPUT: A response with status code 200_OK if successful
- **Only admins of the the book club that the meeting/poll belongs to can delete meetings/polls, otherwise, a response with status code 401_UNAUTHORIZED is returned**
- Deleting a poll deletes all the choices associated with the poll, as well as the votes associated with the choices

Delete poll:
![delete_poll](https://media.github.sydney.edu.au/user/2527/files/55b9a700-f270-11e9-830a-60ca4685cf11)

Delete meeting:
![delete_meeting](https://media.github.sydney.edu.au/user/2527/files/5fdba580-f270-11e9-93fd-dbd9124f98b4)

### Homepage/set_club
- INPUT: A JSON format POST request with field "Param_to_change", "New_value", "BookClub_ID" and "User_ID"
- The accepted "Param_to_change" are (**CASE SENSITIVE**):
    - "Name": changes the name of the book club, put new name in "New_value"
    - "Logo": changes the profile pic of the book club, put new path in "New_value"
    - "Open": changes the status of whether the book club is open to new members joining, put boolean `true` or `false` in "New_value"
    - **If you provide any other values in Param_to_change, nothing will be executed and a response with status code 400_BAD_REQUEST is returned instead**
- OUTPUT: A JSON format response with fields "Name", "BookClub_ID", "Profile_Pic" and "Open", expected status: 200_OK
- **Only an admin of the book club can change book club settings, unauthorized users' requests with be responded with status code 401_UNAUTHORIZED instead**
- Currently can only change one field per request, I can implement multi-field changing if requested

![set_club](https://media.github.sydney.edu.au/user/2527/files/2d7e7800-f271-11e9-932b-6a16005c4494)

### Homepage/set_user
- INPUT: A JSON format POST request with field "Param_to_change", "New_value", "User_ID"
- The accepted "Param_to_change" are (**CASE SENSITIVE**):
    - "Profile_pic": changes the user's profile pic, put new path in "New_value"
    - "Email": changes user's email, put new email in "New_value"
    - "Username": changes user's username, put new username in "New_value"
    - "Password": changes user's password, put new password in "New_value"
    - **Same as set_club, if invalid params are provided, response with status code 400_BAD_REQUEST is returned instead**
- OUTPUT: A JSON format response with fields "email", "username" and "profile_pic"
- **The User_ID provided in the body of the request will be checked against the id saved inside the jwt provided in the auth header, so that only if the User_ID and the token's id matches, will the request be performed, otherwise responded with 401_UNAUTHORIZED**

![set_user](https://media.github.sydney.edu.au/user/2527/files/62d79580-f272-11e9-83a3-c26dc3cd0414)

### Homepage/is_admin
- INPUT: A JSON format POST request with fields "User_ID" and "BookClub_ID"
- OUTPUT: A JSON format response with field "isAdmin", which has value `true` or `false` depending on whether user is an admin of the book club
- **A exception will occur if you try to check is admin for a user that is not even a member of the book club, so be careful when using this view**

![is_admin](https://media.github.sydney.edu.au/user/2527/files/8dc0f880-f309-11e9-8928-d7ff9a4b0d16)

### Homepage/get_user
- INPUT: A JSON format POST request with field "User_ID" 
```
{
	User_ID: userId
};
```
- OUTPUT: A JSON format response with field "email", "profile_pic" and "username"
```
{
	email: "user@example.com",
	profile_pic: "dummyPath",
	username: "jaycar"
};
```

### Homepage/delete_vote
- INPUT: A JSON format POST request with "User_ID" and "Poll_ID"
- OUTPUT: Empty response with status code 200_OK if successful, 400_BAD_REQUEST if user does not have a vote in the specified poll or if the poll has already past its end time and 401_UNAUTHORIZED if User_ID provided does not match id stored in the token used in the auth header

### Homepage/unattend_meeting
- INPUT: A JSON format POST request with "User_ID" and "Meeting_ID"
- OUTPUT: Empty response with status code 200_OK if successful, 400_BAD_REQUEST if user has not marked as attending or the meeting was in the past, 401_UNAUTHORIZED if User_ID provided does not match the one stored in the token used in the auth header

### Homepage/edit_thread
- INPUT: A JSON format POST request with "User_ID", "Thread_ID" and "Content"
- OUTPUT: A JSON format Thread object with fields "Thread_ID", "Content", "Time", "Used_ID" (whose content is a JSON array with fields "username" and "profile_pic"), expected status: 200_OK
- Only admins and the author of the thread can edit each particular thread, otherwise, a 401_UNAUTHORIZED response is returned instead with no changes made to the thread in question
![edit_thread](https://media.github.sydney.edu.au/user/2527/files/bbf2a800-f99b-11e9-8c86-eee00401b47b)

### Homepage/leave_club
- INPUT: A JSON format POST request with "User_ID" and "BookClub_ID"
- OUTPUT: Empty response with 200_OK if successful, 401_UNAUTHORIZED if User_ID given does not match id stored in token provided in auth header and 400_BAD_REQUEST if user is not a member of the club

***Note for the commit:***
*Commits from ysun9316 and EuniceMadya are from the same person.*
*Commits from Jingyuan Tu are from jitu0438.* 
*Commits from dodo are from jkha2530.* 
