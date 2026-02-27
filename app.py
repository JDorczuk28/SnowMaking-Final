from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__, static_url_path='/static')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///capstone.sqlite'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
# hello
class Valve(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    state = db.Column(db.String(20))
    note = db.Column(db.String(200))
    time = db.Column(db.String(50))
    lat = db.Column(db.Float)
    lng = db.Column(db.Float)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    valves = db.relationship('Valve', backref='user')


@app.route('/')
def index():
    # If DB is empty, this list will be empty
    all_valves = Valve.query.all()

    valves_data = [ {"id": v.id, "name": v.name, "state": v.state, "note": v.note, "time": v.time, "lat": v.lat, "lng": v.lng} for v in all_valves]

    return render_template('index.html', valves=valves_data)


@app.route('/update_valve', methods=['POST'])
def update_valve():
    data = request.get_json()
    valve = Valve.query.get(data.get('id'))

    if valve:
        valve.state = data.get('state')
        valve.note = data.get('note')
        valve.time = data.get('time')
        db.session.commit()
        return jsonify({"status": "updated"})

    return jsonify({"status": "error"}), 404

if __name__ == "__main__":
    app.run(debug=False)