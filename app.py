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

class History(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    valve_id = db.Column(db.Integer, db.ForeignKey('valve.id'))
    state = db.Column(db.String(20))
    note = db.Column(db.String(200))
    time = db.Column(db.String(50))
    user_name = db.Column(db.String(100))

@app.route('/')
def index():
    # If DB is empty, this list will be empty
    all_valves = Valve.query.all()
    if not all_valves:
        default_valves = [
            {"name": "EAST RIVER PUMP HOUSE", "lat": 38.92212358356308, "lng": -106.95092218936132},
            {"name": "FLEET MAINT SHOP", "lat": 38.9190267637674, "lng": -106.95764916955467},
            {"name": "SNOWFLAKE CONTROL", "lat": 38.896496332211925, "lng": -106.94899842664006},
            {"name": "GOLDLINK BOTTOM", "lat": 38.91370926731311, "lng": -106.95687669336209},
            {"name": "SNOWMAX BUILDING", "lat": 38.90787525887946, "lng": -106.95371358438365},
            {"name": "REDLADY VALVE", "lat": 38.89909708585354, "lng": -106.9652425436975},
        ]
        for v in default_valves:
            existing = Valve.query.filter_by(name=v["name"]).first()

            if not existing:
                valve = Valve(
                    name=v["name"],
                    state="Open",
                    note="",
                    time="",
                    lat=v["lat"],
                    lng=v["lng"]
                )
                db.session.add(valve)
        db.session.commit()
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
        history = History(valve_id=valve.id, state=valve.state, note=valve.note, time=valve.time, user_name=data.get('user_name'))
        db.session.add(history)
        db.session.commit()
        return jsonify({"status": "updated"})

    return jsonify({"status": "error"}), 404

@app.route('/valve_history/<int:valve_id>', methods=['GET'])
def valve_history(valve_id=None):
    rows = (History.query.filter_by(valve_id=valve_id).order_by(History.id.desc()).limit(5).all())
    history = [{"time": r.time,"state": r.state,"note": r.note,"user": r.user_name} for r in rows]

    return jsonify({"history": history})


with app.app_context():
    db.create_all()
if __name__ == "__main__":
    app.run(debug=False)