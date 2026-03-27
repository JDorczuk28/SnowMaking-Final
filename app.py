from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
app = Flask(__name__, static_url_path='/static')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///capstone1.sqlite'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
# hello
class Valve(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))

    water_state = db.Column(db.String(20))
    air_state = db.Column(db.String(20))

    note = db.Column(db.String(200))
    time = db.Column(db.String(50))
    lat = db.Column(db.Float)
    lng = db.Column(db.Float)
    cluster =db.Column(db.Integer)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    valves = db.relationship('Valve', backref='user')


class History(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    valve_id = db.Column(db.Integer, db.ForeignKey('valve.id'))
    state = db.Column(db.String(20))
    type = db.Column(db.String(20))
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
            {"name": "SNOWFLAKE CONTROL", "lat": 38.896496332211925, "lng": -106.94899842664006, "cluster": 1},
            {"name": "GOLDLINK BOTTOM", "lat": 38.91370926731311, "lng": -106.95687669336209},
            {"name": "SNOWMAX BUILDING", "lat": 38.90787525887946, "lng": -106.95371358438365},
            {"name": "REDLADY VALVE", "lat": 38.89909708585354, "lng": -106.9652425436975},
            {"name": "KOCHS VALVE", "lat": 38.89256926622391, "lng": -106.95114788764425},
            {"name": "UPPER PARK VALVE", "lat": 38.896233119744714, "lng": -106.94945905780628, "cluster": 1},
            {"name": "PEANUT VALVE", "lat": 38.89710727433946,  "lng":  -106.948932563278},
            {"name": "KEYSTONE VALVE", "lat": 38.89647897681207, "lng": -106.94804922245835, "cluster": 1},
            {"name": "PEANUT DRAIN", "lat": 38.89655182318709, "lng":  -106.94958190652956, "cluster": 1},
            {"name": "UPPER PARK DRAIN", "lat": 38.89606921456027, "lng":  -106.94883896425077, "cluster": 1},
            {"name": "WESTWALL TOP", "lat": 38.89592945669731, "lng": -106.96032443341286},
            {"name": "PEACHTREE JUNCTION TOP", "lat": 38.896553440624764, "lng": -106.96412431021668},
            {"name": "TEST", "lat": 38.912478, "lng": -106.96524}
        ]
        for v in default_valves:
            existing = Valve.query.filter_by(name=v["name"]).first()

            if not existing:
                valve = Valve(
                    name=v["name"],
                    water_state="Open",
                    air_state="Open",
                    note="",
                    time="",
                    lat=v["lat"],
                    lng=v["lng"],
                    cluster=v.get("cluster", 0)

                )
                db.session.add(valve)
        db.session.commit()
        all_valves = Valve.query.all()

    valves_data = [ {"id": v.id, "name": v.name, "water_state": v.water_state, "air_state": v.air_state, "note": v.note, "time": v.time, "lat": v.lat, "lng": v.lng, "cluster": v.cluster} for v in all_valves]

    return render_template('index.html', valves=valves_data)


@app.route('/update_valve', methods=['POST'])
def update_valve():
    data = request.get_json()
    print("DATA:", data)
    valve = db.session.get(Valve, data.get('id'))
    print("Valve:", valve)

    if valve:
        valve.note = data.get('note')
        valve.time = data.get('time')
        selected_user = data.get('user')
        valve_type = data.get('type')
        saved_state = data.get("state")

        changed = False
        if valve_type == "water":
            if valve.water_state != saved_state:
                valve.water_state = saved_state
                changed = True
        elif valve_type == "air":
            if valve.air_state != saved_state:
                valve.air_state = saved_state
                changed = True

        print("changed:", changed)

        if changed:
            history = History(
                valve_id=valve.id,
                state=saved_state,
                type=valve_type,
                note=valve.note,
                time=valve.time,
                user_name=selected_user)
            db.session.add(history)
            print("history added to session")
        db.session.commit()
        print("commit done")

        rows = History.query.all()
        print("history count:", len(rows))
        for r in rows:
            print(r.id, r.valve_id, r.type, r.state, r.time, r.user_name)
        return jsonify({"status": "updated"})

    return jsonify({"status": "error"}), 404

@app.route('/valve_history/<int:valve_id>', methods=['GET'])
def valve_history(valve_id=None):
    rows = (History.query.filter_by(valve_id=valve_id).order_by(History.id.desc()).limit(5).all())
    valve = db.session.get(Valve, valve_id)
    history = [{"valve_name": valve.name, "time": r.time,"type": r.type, "state": r.state,"note": r.note,"user": r.user_name} for r in rows]


    return jsonify({"history": history})


@app.route('/history', methods=['GET'])
def all_History():
    rows = History.query.order_by(History.id.desc()).all()
    history = []
    for r in rows:
        valve = db.session.get(Valve, r.valve_id)
        history.append({
            "valve_name": valve.name if valve else "Unknown",
            "time": r.time,
            "type": r.type,
            "state": r.state,
            "note": r.note,
            "user": r.user_name
        })

    return jsonify({"history": history})

with app.app_context():
    db.create_all()
if __name__ == "__main__":
    app.run(debug=False)