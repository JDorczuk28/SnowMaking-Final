from flask import Flask, render_template, request, jsonify, Response, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
import pandas as pd
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from flask_socketio import SocketIO

app = Flask(__name__, static_url_path='/static')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///capstone.sqlite'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'secret-key'

socket = SocketIO(app)
db = SQLAlchemy(app)

login_manager = LoginManager(app)
login_manager.login_view = 'login'


class Valve(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    water_state = db.Column(db.String(20))
    air_state = db.Column(db.String(20))
    water_note = db.Column(db.String(200))
    air_note = db.Column(db.String(200))
    time = db.Column(db.String(50))
    lat = db.Column(db.Float)
    lng = db.Column(db.Float)
    cluster = db.Column(db.Integer)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(100))
    is_admin = db.Column(db.Boolean, default=False)
    valves = db.relationship('Valve', backref='user')


class History(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    valve_id = db.Column(db.Integer, db.ForeignKey('valve.id'))
    state = db.Column(db.String(20))
    type = db.Column(db.String(20))
    note = db.Column(db.String(200))
    time = db.Column(db.String(50))
    user_name = db.Column(db.String(100))


# ── Valve data & user list endpoints ────────────────────────────────────────

@app.route('/valve_data/<int:valve_id>', methods=['GET'])
def valve_data(valve_id):
    valve = db.session.get(Valve, valve_id)
    if not valve:
        return jsonify({"status": "error"}), 404
    return jsonify({
        "water_state": valve.water_state,
        "air_state":   valve.air_state,
        "water_note":  valve.water_note or "",
        "air_note":    valve.air_note   or ""
    })


@app.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify({"users": [{"id": u.id, "name": u.name} for u in users]})


# ── Main index ───────────────────────────────────────────────────────────────

@app.route('/')
def index():
    all_valves = Valve.query.all()
    if not all_valves:
        default_valves = [
            {"name": "Primary Pumphouse", "lat": 38.92212304235683, "lng": -106.9512133554679, "cluster": 5},
            {"name": "Pond/Pit Isolation Valve", "lat": 38.92215477817986, "lng": -106.9510905399406, "cluster": 5},
            {"name": "Manifold Drain", "lat": 38.92211155200594, "lng": -106.951103079818, "cluster": 5},
            {"name": "Pumphouse Drain", "lat": 38.92211546335712, "lng": -106.9511228864435, "cluster": 5},
            {"name": "Supply Line Drain", "lat": 38.92210118694455, "lng": -106.9511652589825, "cluster": 5},
            {"name": "Primary Instrument Air Condensate Drain", "lat": 38.92215458532085, "lng": -106.9511573144119, "cluster": 5},
            {"name": "Backup Instrument Air Condensate Drain", "lat": 38.92214509296524, "lng": -106.9511348940024, "cluster": 5},
            {"name": "Shop Line Low Spot Drain at Indian Trail", "lat": 38.91895854601444, "lng": -106.957582917884},
            {"name": "Supply Line Low Spot Drain at Indian Trail", "lat": 38.91962383225256, "lng": -106.9558829995864},
            {"name": "Old Supply Line Drain at Indian Trail", "lat": 38.91961943050097, "lng": -106.9558808986738},
            {"name": "Shop Line Low Spot Drain At Bridge", "lat": 38.916458352512, "lng": -106.9576546778357},
            {"name": "Shop Line Isolation Valve", "lat": 38.91505892671965, "lng": -106.9565579775909},
            {"name": "Shop Line Low Spot Drain at Isolation Valve", "lat": 38.9150541569166, "lng": -106.9565671446225},
            {"name": "Supply Line Low Spot Drain Bottom of Gold LInk", "lat": 38.91409291772526, "lng": -106.9565647085879},
            {"name": "Cascade Air Drain", "lat": 38.9126886688477, "lng": -106.9564367294931},
            {"name": "Old Supply Drain at Bottom of Cascade", "lat": 38.91269189024945, "lng": -106.9564463784478},
            {"name": "Snomax Building", "lat": 38.90780135286678, "lng": -106.9536181236681},
            {"name": "Prospect Air Isolation Valve", "lat": 38.90782173570921, "lng": -106.953587706901},
            {"name": "Prospect Water Isolation Valve", "lat": 38.90781620297497, "lng": -106.9535830024344},
            {"name": "Agitator Pump Drain", "lat": 38.90780232654392, "lng": -106.9536078734225},
            {"name": "Snomax Injection Line Drain", "lat": 38.90780287999758, "lng": -106.953598012461},
            {"name": "Prospect Water Drain", "lat": 38.91421397691617, "lng": -106.9491546218801},
            {"name": "Prospect Air Drain", "lat": 38.9142140094575, "lng": -106.9491603697095},
            {"name": "Splain's Terrain Park Spur Water Isolation Valve", "lat": 38.90735862474448, "lng": -106.9529750502346},
            {"name": "Old Supply Line Water Isolation Valve", "lat": 38.90265318034756, "lng": -106.9540745775514},
            {"name": "Supply Line Water Low Spot Drain Bottom Of Painter Boy", "lat": 38.90234489370604, "lng": -106.9540139706316, "cluster": 3},
            {"name": "Lower Canaan Air Isolation Valve", "lat": 38.89593739449698, "lng": -106.9528197598721},
            {"name": "Lower Canaan Air Drain", "lat": 38.90008518929765, "lng": -106.9380239643444},
            {"name": "Houston Water Drain", "lat": 38.902458, "lng": -106.954059, "cluster": 3},
            {"name": "12 Water Up Houston Isolation Valve", "lat": 38.902460, "lng": -106.954062, "cluster": 3},
            {"name": "Houston Road Spur Water Drain", "lat": 38.902216, "lng": -106.955425},
            {"name": "Houston Road Spur Air Drain", "lat": 38.902212, "lng": -106.955426},
            {"name": "Houston Spur Air Isolation Valve", "lat": 38.902436, "lng": -106.954072, "cluster": 3},
            {"name": "Houston Spur Water Isolation Valve", "lat": 38.902451, "lng": -106.954101, "cluster": 3},
            {"name": "Houston Spur Low Spot Drain at Water Isolation", "lat": 38.902450, "lng": -106.954092, "cluster": 3},
            {"name": "Houston Spur Air Low Spot Drain At Isolation", "lat": 38.902432, "lng": -106.954070, "cluster": 3},
            {"name": "Springbox Flats Valve Block House", "lat": 38.898733, "lng": -106.952770, "cluster": 6},
            {"name": "Spring Box Water Low Spot Drain", "lat": 38.898737, "lng": -106.952802, "cluster": 6},
            {"name": "Springbox Air Low Spot Drain", "lat": 38.898741, "lng": -106.952805, "cluster": 6},
            {"name": "Air Down Keystone Isolation Valve", "lat": 38.898741, "lng": -106.952797, "cluster": 6},
            {"name": "Gold Link Air Isolation", "lat": 38.898741, "lng": -106.952784, "cluster": 6},
            {"name": "Water Down Keystone Isolation Valve", "lat": 38.898735, "lng": -106.952797, "cluster": 6},
            {"name": "Water Up Keystone Isolation Valve", "lat": 38.898730, "lng": -106.952761, "cluster": 6},
            {"name": "Warming House Hill Water Isolation", "lat": 38.899310, "lng": -106.962264},
            {"name": "Warming House Hill Air Isolation", "lat": 38.899316, "lng": -106.962272},
            {"name": "Warming House Hill Air Drain", "lat": 38.899133, "lng": -106.965524},
            {"name": "Warming House Hill Water Drain", "lat": 38.899131, "lng": -106.965516},
            {"name": "Peachtree Water Drain", "lat": 38.895655, "lng": -106.965957},
            {"name": "Peachtree Air Drain", "lat": 38.895655, "lng": -106.965957},
            {"name": "Ski School Water Isolation", "lat": 38.897612, "lng": -106.964303},
            {"name": "Ski School Water Drain", "lat": 38.897135, "lng": -106.965121},
            {"name": "Ski School Air Drain", "lat": 38.897131, "lng": -106.965125},
            {"name": "Ski School Water Low Spot Drain", "lat": 38.897695, "lng": -106.964971},
            {"name": "Rustler's Low Spot Air Drain", "lat": 38.896830, "lng": -106.963505},
            {"name": "Rustler's Low Spot Water Drain", "lat": 38.896829, "lng": -106.963513},
            {"name": "Air Up Aspen Clear Cut", "lat": 38.896705, "lng": -106.963423},
            {"name": "Water up Aspen Clear Cut", "lat": 38.896696, "lng": -106.963425},
            {"name": "Air Down Aspen Clear Cut", "lat": 38.897979, "lng": -106.960807},
            {"name": "Water Down Aspen Clear Cut", "lat": 38.897972, "lng": -106.960806},
            {"name": "Buckley Air Isolation (Abandoned)", "lat": 38.897367, "lng": -106.964138},
            {"name": "Koch's Water", "lat": 38.894193, "lng": -106.954757},
            {"name": "Koch's Air", "lat": 38.894194, "lng": -106.954752},
            {"name": "Peanut Low Spot Water Drain", "lat": 38.896193, "lng": -106.951251},
            {"name": "Lower Twister Water Isolation Valve", "lat": 38.896059, "lng": -106.951917},
            {"name": "Lower Twister Air Isolation Valve", "lat": 38.896064, "lng": -106.951932},
            {"name": "Lower Twister Air Drain", "lat": 38.899112, "lng": -106.961713},
            {"name": "Lower Twister Water Drain", "lat": 38.899112, "lng": -106.961713},
            {"name": "Lower Treasury Air Drain", "lat": 38.906008, "lng": -106.927220},
            {"name": "Lower Treasury Water Drain", "lat": 38.906005, "lng": -106.927227},
            {"name": "Lower Treasury Water Isolation", "lat": 38.901356, "lng": -106.935061},
            {"name": "Lower Treasury Air Isolation", "lat": 38.901350, "lng": -106.935065},
            {"name": "Daisy Water Isolation", "lat": 38.900322, "lng": -106.935562},
            {"name": "Lower Ruby / Lower Forest Queen Water Tie In", "lat": 38.900480, "lng": -106.939309},
            {"name": "Lower Ruby / Lower Forest Queen Air Tie In", "lat": 38.900482, "lng": -106.939305},
            {"name": "Lower Canaan Water Isolation", "lat": 38.898481, "lng": -106.939108},
            {"name": "Lower Ruby Water Drain", "lat": 38.905179, "lng": -106.937862},
            {"name": "Lower Ruby Air Drain", "lat": 38.905180, "lng": -106.937871},
            {"name": "Upper Canaan Above Ground Spur Air Drain", "lat": 38.893681, "lng": -106.941012},
            {"name": "Upper Canaan Above Ground Spur Water Drain", "lat": 38.893685, "lng": -106.941030},
            {"name": "Buckley Air Isolation", "lat": 38.897020, "lng": -106.959319},
            {"name": "Buckley Water Isolation", "lat": 38.897011, "lng": -106.959294},
            {"name": "Buckley Water Drain", "lat": 38.895621, "lng": -106.965798},
            {"name": "Buckley Air Drain", "lat": 38.895612, "lng": -106.965804},
            {"name": "Ruby Steep Air Isolation", "lat": 38.892769, "lng": -106.941880},
            {"name": "Ruby Steep Water Isolation", "lat": 38.892767, "lng": -106.941886},
            {"name": "East River Water Isolation", "lat": 38.896368, "lng": -106.941714, "cluster": 2},
            {"name": "East River Water LSD at Isolation", "lat": 38.896361, "lng": -106.941722, "cluster": 2},
            {"name": "East River Air Isolation", "lat": 38.896358, "lng": -106.941695, "cluster": 2},
            {"name": "Lower Forest Queen Air Isolation", "lat": 38.896419, "lng": -106.941749, "cluster": 2},
            {"name": "Lower Forest Queen Water Isolation", "lat": 38.896442, "lng": -106.941724, "cluster": 2},
            {"name": "Lower Forest Queen LSD at Isolation", "lat": 38.896419, "lng": -106.941749},
            {"name": "Upper Paradise Air Isolation", "lat": 38.896395, "lng": -106.941757, "cluster": 2},
            {"name": "Upper Paradise Air LSD at Isolation", "lat": 38.896401, "lng": -106.941773, "cluster": 2},
            {"name": "Low Pressure Water Drain", "lat": 38.896363, "lng": -106.941781, "cluster": 2},
            {"name": "High Pressure Water Drain", "lat": 38.896375, "lng": -106.941791, "cluster": 2},
            {"name": "Water Down Ruby Isolation", "lat": 38.899247, "lng": -106.942420, "cluster": 7},
            {"name": "Air Down Ruby Isolation", "lat": 38.899225, "lng": -106.942404, "cluster": 7},
            {"name": "Ruby Isolation Low Spot Drain", "lat": 38.899245, "lng": -106.942433, "cluster": 7},
            {"name": "Houston Water Isolation", "lat": 38.899245, "lng": -106.942433},
            {"name": "10 Emergency Valve", "lat": 38.899173, "lng": -106.942458, "cluster": 7},
            {"name": "Peanut Water Drain", "lat": 38.899236, "lng": -106.942569, "cluster": 7},
            {"name": "Peanut Air Drain", "lat": 38.899215, "lng": -106.942595, "cluster": 7},
            {"name": "High Pressure Drain", "lat": 38.899170, "lng": -106.942490, "cluster": 7},
            {"name": "Air Down Houston Isolation", "lat": 38.899270, "lng": -106.942521, "cluster": 7},
            {"name": "Upper Park Air Isolation", "lat": 38.896572, "lng": -106.948921, "cluster": 4},
            {"name": "Peanut Air Isolation", "lat": 38.896539, "lng": -106.948877, "cluster": 4},
            {"name": "Keystone Air Isolation", "lat": 38.896502, "lng": -106.948858, "cluster": 4},
            {"name": "Upper Park Water Isolation", "lat": 38.896468, "lng": -106.949104, "cluster": 4},
            {"name": "Peanut Water Isolation", "lat": 38.896425, "lng": -106.949068, "cluster": 4},
            {"name": "Peanut Water Drain", "lat": 38.896497, "lng": -106.949012, "cluster": 4},
            {"name": "Upper Park Water Drain", "lat": 38.896399, "lng": -106.948992, "cluster": 4},
            {"name": "Keystone Air Drain", "lat": 38.896483, "lng": -106.948929, "cluster": 4},
            {"name": "Weather Station Flats Air Drain", "lat": 38.895973, "lng": -106.952852},
            {"name": "Weather Station Flats Water Drain", "lat": 38.895937, "lng": -106.952819},
            {"name": "Lower Canaan Water Drain", "lat": 38.900181, "lng": -106.938202},
        ]
        for v in default_valves:
            if not Valve.query.filter_by(name=v["name"]).first():
                db.session.add(Valve(
                    name=v["name"],
                    water_state="Open",
                    air_state="Open",
                    water_note="",
                    air_note="",
                    time="",
                    lat=v["lat"],
                    lng=v["lng"],
                    cluster=v.get("cluster", 0)
                ))
        db.session.commit()
        all_valves = Valve.query.all()

    valves_data = [{
        "id": v.id,
        "name": v.name,
        "water_state": v.water_state,
        "air_state": v.air_state,
        "water_note": v.water_note,
        "air_note": v.air_note,
        "time": v.time,
        "lat": v.lat,
        "lng": v.lng,
        "cluster": v.cluster
    } for v in all_valves]

    return render_template('index.html', valves=valves_data)


# ── Valve update ─────────────────────────────────────────────────────────────

@app.route('/update_valve', methods=['POST'])
def update_valve():
    data = request.get_json()
    valve = db.session.get(Valve, data.get('id'))

    if valve:
        valve.time  = data.get('time')
        valve_type  = data.get('type')
        saved_state = data.get('state')
        user_name   = data.get('user', 'Unknown')
        note        = data.get('note')

        if valve_type == "water":
            valve.water_note  = note
            valve.water_state = saved_state
        elif valve_type == "air":
            valve.air_note  = note
            valve.air_state = saved_state

        history = History(
            valve_id=valve.id,
            state=saved_state,
            type=valve_type,
            note=note,
            time=valve.time,
            user_name=user_name
        )
        db.session.add(history)
        db.session.commit()

        socket.emit('valve_changed', {
            'name': valve.name,
            'type': valve_type,
            'new_state': saved_state,
            'user': user_name
        })

        return jsonify({"status": "updated"})

    return jsonify({"status": "error"}), 404


# ── History endpoints ────────────────────────────────────────────────────────

@app.route('/valve_history/<int:valve_id>', methods=['GET'])
def valve_history(valve_id=None):
    rows = (History.query
            .filter_by(valve_id=valve_id)
            .order_by(History.id.desc())
            .limit(5).all())
    history = [{"time": r.time, "type": r.type, "state": r.state,
                "note": r.note, "user": r.user_name} for r in rows]
    return jsonify({"history": history})


@app.route('/history', methods=['GET'])
def all_history():
    valve_name = request.args.get("valve", "all")
    state      = request.args.get("state", "all")
    type_      = request.args.get("type",  "all")

    query = History.query
    if valve_name != "all":
        valve = Valve.query.filter_by(name=valve_name).first()
        if valve:
            query = query.filter_by(valve_id=valve.id)
    if state != "all":
        query = query.filter_by(state=state)
    if type_ != "all":
        query = query.filter_by(type=type_)

    rows = query.order_by(History.id.desc()).all()
    history = []
    for r in rows:
        v = db.session.get(Valve, r.valve_id)
        history.append({
            "valve_name": v.name if v else "Unknown",
            "time": r.time,
            "type": r.type,
            "state": r.state,
            "note": r.note,
            "user": r.user_name
        })
    return jsonify({"history": history})


# ── CSV download ─────────────────────────────────────────────────────────────

@app.route('/download_CSV')
def download_CSV():
    df = pd.read_sql_table('history', db.engine)
    output = df.to_csv(index=False)
    return Response(
        output,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=data_download.csv"}
    )


# ── Auth ─────────────────────────────────────────────────────────────────────

@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user = User.query.filter_by(name=username).first()
        if user and user.password == password:
            login_user(user)
            return redirect(url_for('index'))
        return render_template('login.html', error="Invalid Credentials")
    return render_template('login.html')


@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('index'))


# ── Admin ────────────────────────────────────────────────────────────────────

@app.route('/admin/users')
@login_required
def manage_users():
    if not current_user.is_admin:
        return redirect(url_for('index'))
    return render_template('manage_users.html', users=User.query.all())


@app.route('/admin/create_user', methods=['POST'])
@login_required
def create_user():
    if not current_user.is_admin:
        return jsonify({"status": "error", "message": "Unauthorized"}), 403

    name     = request.form.get('name')
    password = request.form.get('password')
    is_admin = bool(request.form.get('is_admin'))

    if User.query.filter_by(name=name).first():
        return "User already exists", 400

    db.session.add(User(name=name, password=password, is_admin=is_admin))
    db.session.commit()
    return redirect(url_for('manage_users'))


@app.route('/admin/delete_user/<int:user_id>', methods=['POST'])
@login_required
def delete_user(user_id):
    if not current_user.is_admin:
        return "Unauthorized", 403
    user = db.session.get(User, user_id)
    if user and user.id != current_user.id:
        db.session.delete(user)
        db.session.commit()
    return redirect(url_for('manage_users'))


@app.route('/admin/update_coords', methods=['POST'])
@login_required
def update_coords():
    if not current_user.is_admin:
        return jsonify({"status": "error", "message": "Unauthorized"}), 403

    data = request.get_json()
    valve = db.session.get(Valve, data.get("id"))
    if not valve:
        return jsonify({"status": "error", "message": "Valve not found"}), 404

    valve.lat = float(data.get("lat"))
    valve.lng = float(data.get("lng"))
    db.session.commit()
    return jsonify({"status": "success"})


# ── Startup ──────────────────────────────────────────────────────────────────

with app.app_context():
    db.create_all()

    for u in [
        {"name": "desmond", "password": "p", "is_admin": False},
        {"name": "dano",    "password": "p", "is_admin": False},
        {"name": "admin",   "password": "p", "is_admin": True},
    ]:
        if not User.query.filter_by(name=u["name"]).first():
            db.session.add(User(**u))
    db.session.commit()

if __name__ == "__main__":
    socket.run(app, debug=False, port=5001, allow_unsafe_werkzeug=True)