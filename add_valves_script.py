from app import app, db, Valve

valves = [
    {
        "name": "KOCHES VALVE",
        "state": "ClOSED",
        "note": "",
        "lat": 38.892577000641715,
        "lng": -106.95115705900642,
        "user_id": None
    },
]

with app.app_context():
    for v in valves:
        exists = Valve.query.filter_by(name=v["name"]).first()
        if not exists:
            db.session.add(Valve(**v))

    db.session.commit()
    print("Valve seed complete.")