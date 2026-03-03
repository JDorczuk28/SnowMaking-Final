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
    if all_valves:
        default_valves = [
            {"name": "EAST RIVER PUMP HOUSE", "lat": 38.92212358356308, "lng": -106.95092218936132},
            {"name": "FLEET MAINT SHOP", "lat": 38.9190267637674, "lng": -106.95764916955467},
            {"name": "SNOWFLAKE CONTROL", "lat": 38.896496332211925, "lng": -106.94899842664006},
            {"name": "GOLDLINK BOTTOM", "lat": 38.91370926731311, "lng": -106.95687669336209},
            {"name": "SNOWMAX BUILDING", "lat": 38.90787525887946, "lng": -106.95371358438365},
            {"name": "REDLADY VALVE", "lat": 38.89909708585354, "lng": -106.9652425436975},
            {"name": "KOCHS VALVE", "lat": 38.89256926622391, "lng": -106.95114788764425},
            {"name": "UPPER PARK VALVE", "lat": 38.896233119744714, "lng": -106.94945905780628},
            {"name": "PEANUT VALVE", "lat": 38.89710727433946,  "lng":  -106.948932563278},
            {"name": "KEYSTONE VALVE", "lat": 38.89647897681207, "lng": -106.94804922245835},
            {"name": "PEANUT DRAIN", "lat": 38.89655182318709, "lng":  -106.94958190652956},
            {"name": "UPPER PARK DRAIN", "lat": 38.89606921456027, "lng":  -106.94883896425077},
            {"name": "WESTWALL TOP", "lat": 38.89592945669731, "lng": -106.96032443341286},
            {"name": "PEACHTREE JUNCTION TOP", "lat": 38.896553440624764, "lng": -106.96412431021668},
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
        db.session.commit()
        return jsonify({"status": "updated"})

    return jsonify({"status": "error"}), 404

if __name__ == "__main__":
    app.run(debug=False)