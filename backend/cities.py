# A small fixed list of Indian cities with real latitude/longitude.
# Used by:
#   - seed.py            -> to place fake complaints on the map
#   - main.py (/analyze) -> to look up lat/lng when a user types a city name
#
# Keeping this in one shared file means the map dashboard and the chat
# module always agree on where a city is.

CITIES = {
    "Mumbai": (19.0760, 72.8777),
    "Delhi": (28.7041, 77.1025),
    "Bengaluru": (12.9716, 77.5946),
    "Hyderabad": (17.3850, 78.4867),
    "Chennai": (13.0827, 80.2707),
    "Kolkata": (22.5726, 88.3639),
    "Pune": (18.5204, 73.8567),
    "Ahmedabad": (23.0225, 72.5714),
    "Jaipur": (26.9124, 75.7873),
    "Lucknow": (26.8467, 80.9462),
    "Surat": (21.1702, 72.8311),
    "Chandigarh": (30.7333, 76.7794),
    "Bhopal": (23.2599, 77.4126),
    "Patna": (25.5941, 85.1376),
    "Kochi": (9.9312, 76.2673),
}

# Convenience list of just the names, e.g. for a dropdown or random.choice()
CITY_NAMES = list(CITIES.keys())


def get_city_coords(city_name: str):
    """Return (lat, lng) for a known city, or (None, None) if we don't know it."""
    if not city_name:
        return None, None
    match = CITIES.get(city_name.strip().title())
    if match:
        return match
    return None, None
