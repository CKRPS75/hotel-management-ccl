import json
import os
import random
import pymysql

DB_HOST = os.environ.get("DB_HOST")
DB_USER = os.environ.get("DB_USER", "admin")
DB_PASS = os.environ.get("DB_PASS", "HotelAdmin123!")
DB_NAME = os.environ.get("DB_NAME", "hotel_management")
STAFF_PIN = os.environ.get("STAFF_PIN", "admin123")


def get_conn():
    return pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASS,
        database=DB_NAME,
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=False,
    )


def response(status, body):
    return {
        "statusCode": status,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
        },
        "body": json.dumps(body, default=str),
    }


def init_tables_and_seed(conn):
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS rooms (
                room_no VARCHAR(10) PRIMARY KEY,
                room_type VARCHAR(50) NOT NULL,
                price_per_night DECIMAL(10, 2) NOT NULL,
                amenities VARCHAR(255) NOT NULL,
                image_url TEXT NOT NULL,
                status VARCHAR(20) DEFAULT 'Available'
            )
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS bookings (
                booking_id VARCHAR(20) PRIMARY KEY,
                room_no VARCHAR(10) NOT NULL,
                room_type VARCHAR(50) NOT NULL,
                guest_name VARCHAR(100) NOT NULL,
                guest_phone VARCHAR(20) NOT NULL,
                check_in VARCHAR(20) NOT NULL,
                check_out VARCHAR(20) NOT NULL,
                nights INT NOT NULL,
                subtotal DECIMAL(10, 2) NOT NULL,
                gst DECIMAL(10, 2) NOT NULL,
                total_amount DECIMAL(10, 2) NOT NULL,
                payment_status VARCHAR(20) DEFAULT 'PAID',
                booking_status VARCHAR(20) DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cur.execute("SELECT COUNT(*) AS cnt FROM rooms")
        if cur.fetchone()["cnt"] == 0:
            seed_rooms = [
                ("101", "Standard Queen", 2800, "Wi-Fi • Smart TV • Rain Shower • Breakfast",
                 "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=900&q=80", "Available"),
                ("102", "Standard Twin", 2600, "Twin Beds • Wi-Fi • Work Desk • Coffee Maker",
                 "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=900&q=80", "Available"),
                ("201", "Deluxe King", 4500, "City View • King Bed • Mini Bar • High-Speed Wi-Fi",
                 "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=900&q=80", "Available"),
                ("202", "Deluxe Balcony", 4900, "Private Balcony • King Bed • Bathtub • Lounge Access",
                 "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80", "Available"),
                ("301", "Executive Suite", 7800, "Panoramic View • Living Area • Jacuzzi • Butler Service",
                 "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80", "Available"),
                ("302", "Royal Penthouse", 11500, "Private Terrace • Dining Lounge • Spa Access • Airport Pickup",
                 "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=900&q=80", "Available"),
            ]
            cur.executemany(
                "INSERT INTO rooms (room_no, room_type, price_per_night, amenities, image_url, status) VALUES (%s,%s,%s,%s,%s,%s)",
                seed_rooms,
            )
    conn.commit()


def lambda_handler(event, context):
    method = event.get("httpMethod") or event.get("requestContext", {}).get("http", {}).get("method", "GET")
    path = event.get("path") or event.get("rawPath") or "/"

    if method == "OPTIONS":
        return response(200, {"message": "OK"})

    try:
        body = json.loads(event.get("body") or "{}")
    except json.JSONDecodeError:
        body = {}

    conn = None
    try:
        conn = get_conn()
        init_tables_and_seed(conn)

        # 1. GET /rooms
        if method == "GET" and path.endswith("/rooms"):
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM rooms ORDER BY room_no ASC")
                rooms = cur.fetchall()
            return response(200, {"rooms": rooms})

        # 2. POST /rooms
        if method == "POST" and path.endswith("/rooms"):
            room_no = str(body.get("room_no", "")).strip()
            room_type = str(body.get("room_type", "")).strip()
            price = float(body.get("price_per_night", 0))
            amenities = str(body.get("amenities", "Wi-Fi • AC • Smart TV")).strip()
            image_url = str(body.get("image_url", "")).strip() or (
                "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80"
            )
            if not room_no or not room_type or price <= 0:
                return response(400, {"error": "Room number, type, and valid price are required."})

            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO rooms (room_no, room_type, price_per_night, amenities, image_url, status) VALUES (%s,%s,%s,%s,%s,'Available')",
                    (room_no, room_type, price, amenities, image_url),
                )
            conn.commit()
            return response(201, {"message": f"Room {room_no} added successfully."})

        # 3. POST /book
        if method == "POST" and path.endswith("/book"):
            room_no = str(body.get("room_no", "")).strip()
            guest_name = str(body.get("guest_name", "")).strip()
            guest_phone = str(body.get("guest_phone", "")).strip()
            check_in = str(body.get("check_in", "")).strip()
            check_out = str(body.get("check_out", "")).strip()
            nights = int(body.get("nights", 1))

            if not all([room_no, guest_name, guest_phone, check_in, check_out]) or nights < 1:
                return response(400, {"error": "All booking fields and valid dates are required."})

            with conn.cursor() as cur:
                cur.execute("SELECT * FROM rooms WHERE room_no = %s FOR UPDATE", (room_no,))
                room = cur.fetchone()
                if not room:
                    return response(404, {"error": "Room not found."})
                if room["status"] != "Available":
                    return response(409, {"error": "Room is already occupied."})

                rate = float(room["price_per_night"])
                subtotal = round(rate * nights, 2)
                gst = round(subtotal * 0.12, 2)
                total = round(subtotal + gst, 2)
                booking_id = f"BK-{random.randint(1000, 9999)}"

                cur.execute(
                    """
                    INSERT INTO bookings
                    (booking_id, room_no, room_type, guest_name, guest_phone, check_in, check_out, nights, subtotal, gst, total_amount)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                    """,
                    (booking_id, room_no, room["room_type"], guest_name, guest_phone, check_in, check_out, nights, subtotal, gst, total),
                )
                cur.execute("UPDATE rooms SET status = 'Occupied' WHERE room_no = %s", (room_no,))
            conn.commit()

            return response(201, {
                "message": "Booking confirmed!",
                "booking": {
                    "booking_id": booking_id,
                    "room_no": room_no,
                    "room_type": room["room_type"],
                    "guest_name": guest_name,
                    "guest_phone": guest_phone,
                    "check_in": check_in,
                    "check_out": check_out,
                    "nights": nights,
                    "subtotal": subtotal,
                    "gst": gst,
                    "total_amount": total,
                    "payment_status": "PAID",
                    "booking_status": "Active",
                },
            })

        # 4. GET /bookings
        if method == "GET" and path.endswith("/bookings"):
            qs = event.get("queryStringParameters") or {}
            search = (qs.get("query") or "").strip()
            with conn.cursor() as cur:
                if search:
                    like = f"%{search}%"
                    cur.execute(
                        "SELECT * FROM bookings WHERE booking_id LIKE %s OR guest_phone LIKE %s ORDER BY created_at DESC",
                        (like, like),
                    )
                else:
                    cur.execute("SELECT * FROM bookings ORDER BY created_at DESC")
                bookings = cur.fetchall()
            return response(200, {"bookings": bookings})

        # 5. PUT /checkout
        if method == "PUT" and path.endswith("/checkout"):
            booking_id = str(body.get("booking_id", "")).strip()
            room_no = str(body.get("room_no", "")).strip()
            if not booking_id or not room_no:
                return response(400, {"error": "booking_id and room_no are required."})

            with conn.cursor() as cur:
                cur.execute("UPDATE bookings SET booking_status = 'Checked-Out' WHERE booking_id = %s", (booking_id,))
                cur.execute("UPDATE rooms SET status = 'Available' WHERE room_no = %s", (room_no,))
            conn.commit()
            return response(200, {"message": f"Guest checked out. Room {room_no} is now Available."})

        # 6. POST /login
        if method == "POST" and path.endswith("/login"):
            pin = str(body.get("pin", "")).strip()
            if pin == STAFF_PIN:
                return response(200, {"authenticated": True})
            return response(401, {"error": "Invalid Staff PIN."})

        return response(404, {"error": f"Route not found: {method} {path}"})

    except Exception as e:
        if conn:
            conn.rollback()
        return response(500, {"error": str(e)})
    finally:
        if conn:
            conn.close()