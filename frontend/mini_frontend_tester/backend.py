import time
import json
from pprint import pprint
from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin

# Initialise.
app = Flask(__name__)

# Signing Access-Control-Allow-Origin. This is CRITICAL.
CORS(app)

posts = [{'title': 'Default1', 'content': 'Lorum Ipsum'},
		{'title': 'Default2', 'content': 'Lorum Jipsum'},
		{'title': 'Default3', 'content': 'Lorum Jaydsum'},
		{'title': 'Default4', 'content': 'Lorum Eunisum'},
		{'title': 'Default5', 'content': 'Lorum Patysum'},
		{'title': 'Default6', 'content': 'Lorum Jahansum'},
		]

# APIs...
@app.route('/getPosts',methods=['GET'])
def getPosts():
	return jsonify(posts)


@app.route('/savePost', methods=['POST'])
def savePosts():
	# Get the data POSTED to backend, convert byte to string and save it.
	data = json.loads(request.data.decode("utf-8"))
	posts.append(data)

	# Return the new posts so front end can be updated at the same time.
	return jsonify(posts)


# Run the server.
app.debug = True
app.run()
