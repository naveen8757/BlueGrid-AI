# =====================================================
# BLUEGRID AI
# ENERGY OPTIMIZATION ENGINE
# =====================================================


def optimize_system(
    demand_mw,
    solar_max_kw=1500,
    wind_max_kw=1500,
    otec_max_kw=1500,
    battery_max_kwh=5000
):

    # -------------------------------------------------
    # CONVERT DEMAND
    # -------------------------------------------------

    demand_kw = demand_mw * 1000


    # -------------------------------------------------
    # CAPACITY FACTORS
    # -------------------------------------------------

    SOLAR_CF = 0.20
    WIND_CF = 0.35
    OTEC_CF = 0.80


    # -------------------------------------------------
    # INITIAL ENERGY MIX
    # -------------------------------------------------

    solar_kw = min(
        demand_kw * 0.30,
        solar_max_kw
    )

    wind_kw = min(
        demand_kw * 0.25,
        wind_max_kw
    )

    otec_kw = min(
        demand_kw * 0.45,
        otec_max_kw
    )


    # -------------------------------------------------
    # RENEWABLE ENERGY CALCULATION
    # -------------------------------------------------

    solar_mwh_year = (
        solar_kw *
        SOLAR_CF *
        8760 /
        1000
    )

    wind_mwh_year = (
        wind_kw *
        WIND_CF *
        8760 /
        1000
    )

    otec_mwh_year = (
        otec_kw *
        OTEC_CF *
        8760 /
        1000
    )


    renewable_mwh_year = (
        solar_mwh_year +
        wind_mwh_year +
        otec_mwh_year
    )


    # -------------------------------------------------
    # BATTERY
    # -------------------------------------------------

    battery_kwh = min(
        demand_kw * 4,
        battery_max_kwh
    )


    # -------------------------------------------------
    # RENEWABLE PERCENTAGE
    # -------------------------------------------------

    annual_demand_mwh = (
        demand_kw *
        8760 /
        1000
    )


    renewable_percentage = (
        renewable_mwh_year /
        annual_demand_mwh
    ) * 100


    renewable_percentage = min(
        renewable_percentage,
        100
    )


    # -------------------------------------------------
    # RELIABILITY
    # -------------------------------------------------

    reliability = min(
        99.5,
        90 +
        renewable_percentage * 0.095
    )


    # -------------------------------------------------
    # RESERVE HOURS
    # -------------------------------------------------

    reserve_hours = (
        battery_kwh /
        demand_kw
    )


    # -------------------------------------------------
    # SOURCE SHARE
    # -------------------------------------------------

    total_generation = (
        solar_mwh_year +
        wind_mwh_year +
        otec_mwh_year
    )


    if total_generation > 0:

        solar_share = (
            solar_mwh_year /
            total_generation
        ) * 100

        wind_share = (
            wind_mwh_year /
            total_generation
        ) * 100

        otec_share = (
            otec_mwh_year /
            total_generation
        ) * 100

    else:

        solar_share = 0
        wind_share = 0
        otec_share = 0


    # -------------------------------------------------
    # SIMPLE LCOE ESTIMATE
    # -------------------------------------------------

    lcoe = (
        7.5
        - renewable_percentage * 0.025
    )

    lcoe = max(
        lcoe,
        3.5
    )


    # -------------------------------------------------
    # SYSTEM SCORE
    # -------------------------------------------------

    score = (
        renewable_percentage * 0.45
        + reliability * 0.35
        + min(reserve_hours * 10, 100) * 0.20
    )


    score = min(
        score,
        100
    )


    # -------------------------------------------------
    # ACTIVE SOURCES
    # -------------------------------------------------

    active_sources = []

    if solar_kw > 0:
        active_sources.append("Solar")

    if wind_kw > 0:
        active_sources.append("Wind")

    if otec_kw > 0:
        active_sources.append("OTEC")

    if battery_kwh > 0:
        active_sources.append("Battery")


    # -------------------------------------------------
    # RECOMMENDATION
    # -------------------------------------------------

    recommendation = (
        "Use a hybrid Solar + Wind + OTEC system "
        "supported by battery storage. "
        "OTEC provides stable baseline generation, "
        "while solar and wind contribute variable "
        "renewable energy. Battery storage improves "
        "system resilience during renewable fluctuations."
    )


    # -------------------------------------------------
    # FINAL RESULT
    # -------------------------------------------------

    result = {

        "solar_kw": round(
            solar_kw,
            2
        ),

        "wind_kw": round(
            wind_kw,
            2
        ),

        "otec_kw": round(
            otec_kw,
            2
        ),

        "battery_kwh": round(
            battery_kwh,
            2
        ),

        "renewable_mwh": round(
            renewable_mwh_year,
            2
        ),

        "renewable_pct": round(
            renewable_percentage,
            2
        ),

        "reliability": round(
            reliability,
            2
        ),

        "reserve_hours": round(
            reserve_hours,
            2
        ),

        "lcoe": round(
            lcoe,
            2
        ),

        "score": round(
            score,
            2
        ),

        "solar_share": round(
            solar_share,
            2
        ),

        "wind_share": round(
            wind_share,
            2
        ),

        "otec_share": round(
            otec_share,
            2
        ),

        "active_sources": active_sources,

        "recommendation": recommendation,

        "engine": "BlueGrid AI Optimization Engine"

    }


    return result