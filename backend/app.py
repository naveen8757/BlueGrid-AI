# =====================================================
# BLUEGRID AI
# FLASK BACKEND API
# =====================================================

from flask import Flask, request, jsonify
from flask_cors import CORS

from optimizer import optimize_system


# -----------------------------------------------------
# CREATE FLASK APP
# -----------------------------------------------------

app = Flask(__name__)

CORS(app)


# -----------------------------------------------------
# HOME ROUTE
# -----------------------------------------------------

@app.route("/")
def home():

    return jsonify({
        "project": "BlueGrid AI",
        "status": "online",
        "message": "BlueGrid AI backend is running"
    })


# -----------------------------------------------------
# HEALTH CHECK
# -----------------------------------------------------

@app.route("/api/health")
def health():

    return jsonify({

        "status": "online",

        "service":
            "BlueGrid Optimization API"

    })


# -----------------------------------------------------
# OPTIMIZATION API
# -----------------------------------------------------

@app.route(
    "/api/optimize",
    methods=["POST"]
)
def optimize():

    try:

        data = request.get_json()


        if not data:

            return jsonify({

                "error":
                    "No JSON data received"

            }), 400


        # ---------------------------------------------
        # READ INPUTS
        # ---------------------------------------------

        demand_mw = float(
            data.get(
                "demand_mw",
                1.0
            )
        )


        solar_max_kw = float(
            data.get(
                "solar_max_kw",
                1500
            )
        )


        wind_max_kw = float(
            data.get(
                "wind_max_kw",
                1500
            )
        )


        otec_max_kw = float(
            data.get(
                "otec_max_kw",
                1500
            )
        )


        battery_max_kwh = float(
            data.get(
                "battery_max_kwh",
                5000
            )
        )


        # ---------------------------------------------
        # VALIDATION
        # ---------------------------------------------

        if demand_mw <= 0:

            return jsonify({

                "error":
                    "Demand must be greater than zero"

            }), 400


        if solar_max_kw < 0:
            return jsonify({
                "error": "Solar capacity cannot be negative"
            }), 400


        if wind_max_kw < 0:
            return jsonify({
                "error": "Wind capacity cannot be negative"
            }), 400


        if otec_max_kw < 0:
            return jsonify({
                "error": "OTEC capacity cannot be negative"
            }), 400


        if battery_max_kwh < 0:
            return jsonify({
                "error": "Battery capacity cannot be negative"
            }), 400


        # ---------------------------------------------
        # RUN OPTIMIZER
        # ---------------------------------------------

        result = optimize_system(

            demand_mw=demand_mw,

            solar_max_kw=solar_max_kw,

            wind_max_kw=wind_max_kw,

            otec_max_kw=otec_max_kw,

            battery_max_kwh=battery_max_kwh

        )


        # ---------------------------------------------
        # RETURN RESULT
        # ---------------------------------------------

        return jsonify({

            "success": True,

            "input": {

                "demand_mw":
                    demand_mw,

                "solar_max_kw":
                    solar_max_kw,

                "wind_max_kw":
                    wind_max_kw,

                "otec_max_kw":
                    otec_max_kw,

                "battery_max_kwh":
                    battery_max_kwh

            },

            "result": result

        })


    except ValueError:

        return jsonify({

            "error":
                "Invalid numerical input"

        }), 400


    except Exception as error:

        print(
            "Optimization error:",
            error
        )


        return jsonify({

            "error":
                "Internal server error",

            "details":
                str(error)

        }), 500


# -----------------------------------------------------
# START SERVER
# -----------------------------------------------------

if __name__ == "__main__":

    print()
    print(
        "=========================================="
    )

    print(
        "       BLUEGRID AI BACKEND"
    )

    print(
        "=========================================="
    )

    print(
        "Server starting..."
    )

    print(
        "API: http://127.0.0.1:5000"
    )

    print(
        "=========================================="
    )

    print()


    app.run(

        host="127.0.0.1",

        port=5000,

        debug=True,

        use_reloader=False

    )