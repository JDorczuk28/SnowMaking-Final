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
            {"name": "Primary Pumphouse", "lat": 38.92212304235683, "lng": -106.9512133554679,"alt": 2762.369402266106},
            {"name": "Pond/Pit Isolation Valve", "lat": 38.92215477817986, "lng": -106.9510905399406,"alt": 2762.426209372418},
            {"name": "Manifold Drain", "lat": 38.92211155200594, "lng": -106.951103079818, "alt": 2762.405989856616},
            {"name": "Pumphouse Drain", "lat": 38.92211546335712, "lng": -106.9511228864435, "alt": 2762.687158021773},
            {"name": "Supply Line Drain", "lat": 38.92210118694455, "lng": -106.9511652589825,"alt": 2762.608162943292},
            {"name": "Primary Instrument Air Condensate Drain", "lat": 38.92215458532085, "lng": -106.9511573144119,"alt": 2762.22377794831},
            {"name": "Backup Instrument Air Condensate Drain", "lat": 38.92214509296524, "lng": -106.9511348940024,"alt": 2762.292098952913},
            {"name": "Shop Line Low Spot Drain at Indian Trail", "lat": 38.91895854601444, "lng": -106.957582917884,"alt": 2909.870245635975},
            {"name": "Supply Line Low Spot Drain at Indian Trail", "lat": 38.91962383225256, "lng": -106.9558829995864,"alt": 2884.325986115478},
            {"name": "Old Supply Line Drain at Indian Trail", "lat": 38.91961943050097, "lng": -106.9558808986738,"alt": 2884.277518494453},
            {"name": "Shop Line Low Spot Drain At Bridge", "lat": 38.916458352512, "lng": -106.9576546778357,"alt": 2924.588593226947},
            {"name": "Shop Line Isolation Valve", "lat": 38.91505892671965, "lng": -106.9565579775909,"alt": 2931.232594538519},
            {"name": "Shop Line Low Spot Drain at Isolation Valve", "lat": 38.9150541569166, "lng": -106.9565671446225,"alt": 2931.240310888161},
            {"name": "Supply Line Low Spot Drain Bottom of Gold LInk", "lat": 38.91409291772526,"lng": -106.9565647085879, "alt": 2932.880731295937},
            {"name": "Cascade Air Drain", "lat": 38.9126886688477, "lng": -106.9564367294931, "alt": 2942.753051237238},
            {"name": "Old Supply Drain at Bottom of Cascade", "lat": 38.91269189024945, "lng": -106.9564463784478,"alt": 2942.681799352766},
            {"name": "Snomax Building", "lat": 38.90780135286678, "lng": -106.9536181236681, "alt": 3087.524107337515},
            {"name": "Prospect Air Isolation Valve", "lat": 38.90782173570921, "lng": -106.953587706901,"alt": 3087.578842224413},
            {"name": "Prospect Water Isolation Valve", "lat": 38.90781620297497, "lng": -106.9535830024344,"alt": 3087.587307828432},
            {"name": "Agitator Pump Drain", "lat": 38.90780232654392, "lng": -106.9536078734225,"alt": 3087.542563911409},
            {"name": "Snomax Injection Line Drain", "lat": 38.90780287999758, "lng": -106.953598012461,"alt": 3087.560305101853},
            {"name": "Prospect Water Drain", "lat": 38.91421397691617, "lng": -106.9491546218801,"alt": 2932.160380346559},
            {"name": "Prospect Air Drain", "lat": 38.9142140094575, "lng": -106.9491603697095,"alt": 2932.160012852028},
            {"name": "Splain's Terrain Park Spur Water Isolation Valve", "lat": 38.90735862474448,"lng": -106.9529750502346, "alt": 3087.407964582344},
            {"name": "Old Supply Line Water Isolation Valve", "lat": 38.90265318034756, "lng": -106.9540745775514,"alt": 2992.174209413867},
            {"name": "Supply Line Water Low Spot Drain Bottom Of Painter Boy", "lat": 38.90234489370604,"lng": -106.9540139706316, "alt": 2992.122141559981},
            {"name": "Houston Water Drain", "lat": 38.902458, "lng": -106.954059, "alt": 2991.28},
            {"name": "12\" Water Up Houston Isolation Valve", "lat": 38.902460, "lng": -106.954062, "alt": 2991.28},
            {"name": "Houston Road Spur Water Drain", "lat": 38.902216, "lng": -106.955425, "alt": 2983.74},
            {"name": "Houston Road Spur Air Drain", "lat": 38.902212, "lng": -106.955426, "alt": 2983.78},
            {"name": "Houston Spur Air Isolation Valve", "lat": 38.902436, "lng": -106.954072, "alt": 2991.27},
            {"name": "Houston Spur Water Isolation Valve", "lat": 38.902451, "lng": -106.954101, "alt": 2991.27},
            {"name": "Houston Spur Low Spot Drain at Water Isolation", "lat": 38.902450, "lng": -106.954092, "alt": 2991.28},
            {"name": "Houston Spur Air Low Spot Drain At Isolation", "lat": 38.902432, "lng": -106.954070,"alt": 2991.28},
            {"name": "Springbox Flats Valve Block House", "lat": 38.898733, "lng": -106.952770, "alt": 3041.89},
            {"name": "Spring Box Water Low Spot Drain", "lat": 38.898737, "lng": -106.952802, "alt": 3041.60},
            {"name": "Springbox Air Low Spot Drain", "lat": 38.898741, "lng": -106.952805, "alt": 3041.66},
            {"name": "Air Down Keystone Isolation Valve", "lat": 38.898741, "lng": -106.952797, "alt": 3041.75},
            {"name": "Gold Link Air Isolation", "lat": 38.898741, "lng": -106.952784, "alt": 3041.88},
            {"name": "Water Down Keystone Isolation Valve", "lat": 38.898735, "lng": -106.952797, "alt": 3041.63},
            {"name": "Water Up Keystone Isolation Valve", "lat": 38.898730, "lng": -106.952761, "alt": 3041.98},
            {"name": "Upper Canaan Above Ground Spur Air Drain", "lat": 38.893681, "lng": -106.941012, "alt": 3230.34},
            {"name": "Upper Canaan Above Ground Spur Water Drain", "lat": 38.893685, "lng": -106.941030,"alt": 3230.18},
            {"name": "Upper Canaan Above Ground Spur Water Isolation", "lat": 38.892542, "lng": -106.941340,"alt": 3266.38},
            {"name": "Upper Canaan Above Ground Spur Air Isolation", "lat": 38.892542, "lng": -106.941335,"alt": 3266.48},
            {"name": "Lower Canaan Air Isolation Valve", "lat": 38.89593739449698, "lng": -106.9528197598721,"alt": 3084.624397696893},
            {"name": "Lower Canaan Air Drain", "lat": 38.90008518929765, "lng": -106.9380239643444,"alt": 3046.619086111072},
            {"name": "Lower Canaan Water Isolation", "lat": 38.898481, "lng": -106.939108, "alt": 3082.22},
            {"name": "Lower Canaan Water Drain", "lat": 38.900181, "lng": -106.938202, "alt": 3047.36},
            {"name": "Ruby Steep Air Isolation", "lat": 38.892769, "lng": -106.941880, "alt": 3263.56},
            {"name": "Ruby Steep Water Isolation", "lat": 38.892767, "lng": -106.941886, "alt": 3263.66},
            {"name": "East River Water Isolation", "lat": 38.896368, "lng": -106.941714, "alt": 3145.04},
            {"name": "East River Air Isolation", "lat": 38.896358, "lng": -106.941695, "alt": 3145.05},
            {"name": "Lower Forest Queen Air Isolation", "lat": 38.896419, "lng": -106.941749, "alt": 3144.43},
            {"name": "Lower Forest Queen Water Isolation", "lat": 38.896442, "lng": -106.941724, "alt": 3143.83},
            {"name": "Upper Paradise Air Isolation", "lat": 38.896395, "lng": -106.941757, "alt": 3144.91},
            {"name": "Low Pressure Water Drain", "lat": 38.896363, "lng": -106.941781, "alt": 3145.69},
            {"name": "High Pressure Water Drain", "lat": 38.896375, "lng": -106.941791, "alt": 3145.65},
            {"name": "Water Down Ruby Isolation", "lat": 38.899247, "lng": -106.942420, "alt": 3119.19},
            {"name": "Air Down Ruby Isolation", "lat": 38.899225, "lng": -106.942404, "alt": 3119.30},
            {"name": "Peanut Water Drain", "lat": 38.899236, "lng": -106.942569, "alt": 3118.73},
            {"name": "Peanut Air Drain", "lat": 38.899215, "lng": -106.942595, "alt": 3118.88},
            {"name": "Upper Park Air Isolation", "lat": 38.896572, "lng": -106.948921, "alt": 3132.41},
            {"name": "Upper Park Water Isolation", "lat": 38.896468, "lng": -106.949104, "alt": 3131.90},
            {"name": "Peanut Air Isolation", "lat": 38.896539, "lng": -106.948877, "alt": 3133.20},
            {"name": "Peanut Water Isolation", "lat": 38.896425, "lng": -106.949068, "alt": 3133.12},
            {"name": "Keystone Air Isolation", "lat": 38.896502, "lng": -106.948858, "alt": 3133.88},
            {"name": "Keystone Air Drain", "lat": 38.896483, "lng": -106.948929, "alt": 3133.88},
            {"name": "Weather Station Flats Air Drain", "lat": 38.895973, "lng": -106.952852, "alt": 3084.26},
            {"name": "Weather Station Flats Water Drain", "lat": 38.895937, "lng": -106.952819, "alt": 3084.62}
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
                    lng=v["lng"]
                )
                db.session.add(valve)
        db.session.commit()
        all_valves = Valve.query.all()

    valves_data = [ {"id": v.id, "name": v.name, "water_state": v.water_state, "air_state": v.air_state, "note": v.note, "time": v.time, "lat": v.lat, "lng": v.lng} for v in all_valves]

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
    history = [{"time": r.time,"type": r.type, "state": r.state,"note": r.note,"user": r.user_name} for r in rows]

    return jsonify({"history": history})


with app.app_context():
    db.create_all()
if __name__ == "__main__":
    app.run(debug=False)