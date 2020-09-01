# Backend Testing
Django test modules have been written for all functionalities and endpoints in the backend. Overall, the tests have 96% coverage.

### beforehand
in backend folder (Not deployment):
```
python3 -m pip3 install -r requirements.txt
```
then delete everything `Homepage/migrations` except `init.py`
```
python3 manage.py makemigrations
python3 manage.py migrate
python3 manage.py runserver
```
to run the server
### run tests
to just run the tests:
```
backend % python3 manage.py test 
```
to run with coverage:
```
backend % python3 -m pip install coverage
backend % python3 -m coverage run --source='.' manage.py test 
```
to view the html report:
```
backend % python3 -m coverage html   
```

