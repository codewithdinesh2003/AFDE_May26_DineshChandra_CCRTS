"""
Run this after schema.sql is applied:
  python database/seed.py

Credentials seeded:
  admin@ccrts.com     / Admin@1234
  agent1@ccrts.com    / Agent@1234
  agent2@ccrts.com    / Agent@1234
  supervisor@ccrts.com/ Super@1234
  alice@example.com   / Cust@1234
  bob@example.com     / Cust@1234
  carol@example.com   / Cust@1234
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'backend', '.env'))

import pymysql
from passlib.context import CryptContext
from datetime import datetime, timedelta

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

DB_CONFIG = {
    "host":     os.getenv("DB_HOST", "localhost"),
    "port":     int(os.getenv("DB_PORT", 3306)),
    "user":     os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", "root"),
    "database": os.getenv("DB_NAME", "ccrts_db"),
    "charset":  "utf8mb4",
}

conn = pymysql.connect(**DB_CONFIG)
cur  = conn.cursor()

# Roles
cur.executemany(
    "INSERT IGNORE INTO roles (role_name) VALUES (%s)",
    [("Admin",),("Agent",),("Supervisor",),("Customer",),("QualityTeam",)]
)

# Categories
cur.executemany(
    "INSERT IGNORE INTO categories (category_name) VALUES (%s)",
    [("Billing",),("Service Disruption",),("Product Defects",),
     ("Technical",),("Delivery",),("Account",),("Customer Service",)]
)

# Get role IDs
cur.execute("SELECT role_id, role_name FROM roles")
roles = {r: i for i, r in cur.fetchall()}

# Users
users = [
    ("Admin User",     "admin@ccrts.com",      "Admin@1234",  roles["Admin"]),
    ("Agent Alice",    "agent1@ccrts.com",     "Agent@1234",  roles["Agent"]),
    ("Agent Bob",      "agent2@ccrts.com",     "Agent@1234",  roles["Agent"]),
    ("Supervisor Sam", "supervisor@ccrts.com", "Super@1234",  roles["Supervisor"]),
    ("Alice Customer", "alice@example.com",    "Cust@1234",   roles["Customer"]),
    ("Bob Customer",   "bob@example.com",      "Cust@1234",   roles["Customer"]),
    ("Carol Customer", "carol@example.com",    "Cust@1234",   roles["Customer"]),
    ("QA User",        "qa@ccrts.com",         "QA@1234",     roles["QualityTeam"]),
]
for name, email, password, role_id in users:
    cur.execute(
        "INSERT IGNORE INTO users (name, email, password_hash, role_id) VALUES (%s,%s,%s,%s)",
        (name, email, pwd.hash(password), role_id)
    )

# Get user IDs
cur.execute("SELECT user_id, email FROM users")
uid = {e: i for i, e in cur.fetchall()}

cur.execute("SELECT category_id, category_name FROM categories")
cats = {n: i for i, n in cur.fetchall()}

now = datetime.utcnow()

# Sample complaints
complaints = [
    (uid["alice@example.com"], uid["agent1@ccrts.com"], cats["Billing"],
     "CCRTS-2024-00001", "Incorrect bill amount",
     "I was charged twice for the same service in April.",
     "High", "In Progress", now + timedelta(hours=24), False, None),

    (uid["bob@example.com"], uid["agent2@ccrts.com"], cats["Technical"],
     "CCRTS-2024-00002", "App crashes on login",
     "The mobile app crashes whenever I try to log in.",
     "Critical", "Escalated", now + timedelta(hours=4), True, None),

    (uid["carol@example.com"], None, cats["Delivery"],
     "CCRTS-2024-00003", "Order not delivered",
     "My order #12345 was not delivered despite the tracking showing delivered.",
     "Medium", "Open", now + timedelta(hours=48), False, None),

    (uid["alice@example.com"], uid["agent1@ccrts.com"], cats["Product Defects"],
     "CCRTS-2024-00004", "Defective product received",
     "The product I received has a physical defect - broken hinge.",
     "High", "Resolved", now - timedelta(hours=10), False, now - timedelta(hours=5)),

    (uid["bob@example.com"], uid["agent2@ccrts.com"], cats["Account"],
     "CCRTS-2024-00005", "Unable to reset password",
     "The password reset link is not working, I have tried 5 times.",
     "Medium", "Closed", now - timedelta(hours=72), False, now - timedelta(hours=48)),

    (uid["carol@example.com"], uid["agent1@ccrts.com"], cats["Customer Service"],
     "CCRTS-2024-00006", "Rude behavior from support agent",
     "Agent was very rude during my last call on 10th May.",
     "Low", "Assigned", now + timedelta(hours=72), False, None),

    (uid["alice@example.com"], None, cats["Service Disruption"],
     "CCRTS-2024-00007", "Internet service down for 2 days",
     "My broadband has been down since Monday morning.",
     "Critical", "Open", now + timedelta(hours=4), False, None),

    (uid["bob@example.com"], uid["agent2@ccrts.com"], cats["Billing"],
     "CCRTS-2024-00008", "Refund not processed",
     "I cancelled my subscription 2 weeks ago but refund not received.",
     "Medium", "In Progress", now + timedelta(hours=20), False, None),

    (uid["carol@example.com"], uid["agent1@ccrts.com"], cats["Technical"],
     "CCRTS-2024-00009", "Payment gateway error",
     "Payment fails every time I try to pay my bill online.",
     "High", "Pending Customer Response", now - timedelta(hours=5), False, None),

    (uid["alice@example.com"], uid["agent2@ccrts.com"], cats["Delivery"],
     "CCRTS-2024-00010", "Wrong item delivered",
     "I ordered product A but received product B.",
     "Medium", "Resolved", now - timedelta(hours=24), False, now - timedelta(hours=12)),
]

for (cust, agent, cat, num, subj, desc, prio, stat, sla, esc, res) in complaints:
    cur.execute("""
        INSERT IGNORE INTO complaints
        (complaint_number, customer_id, assigned_agent_id, category_id, subject, description,
         priority, status, sla_deadline, is_escalated, resolved_at)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """, (num, cust, agent, cat, subj, desc, prio, stat, sla, esc, res))

cur.execute("SELECT complaint_id, complaint_number FROM complaints")
comp_map = {n: i for i, n in cur.fetchall()}

# History entries
histories = [
    (comp_map["CCRTS-2024-00001"], uid["admin@ccrts.com"], "Open", "Assigned", "Assigned to Agent Alice"),
    (comp_map["CCRTS-2024-00001"], uid["agent1@ccrts.com"], "Assigned", "In Progress", "Started investigation"),
    (comp_map["CCRTS-2024-00002"], uid["admin@ccrts.com"], "Open", "Assigned", "Assigned to Agent Bob"),
    (comp_map["CCRTS-2024-00002"], uid["supervisor@ccrts.com"], "Assigned", "Escalated", "Critical issue escalated"),
    (comp_map["CCRTS-2024-00004"], uid["agent1@ccrts.com"], "In Progress", "Resolved", "Replacement shipped"),
    (comp_map["CCRTS-2024-00005"], uid["agent2@ccrts.com"], "Resolved", "Closed", "Customer confirmed resolution"),
]
for (cid, uid_, os_, ns_, cm_) in histories:
    cur.execute("""
        INSERT INTO complaint_history (complaint_id, updated_by, old_status, new_status, comment)
        VALUES (%s,%s,%s,%s,%s)
    """, (cid, uid_, os_, ns_, cm_))

# Feedback
feedbacks = [
    (comp_map["CCRTS-2024-00004"], uid["alice@example.com"], 4, "Good resolution but took time."),
    (comp_map["CCRTS-2024-00005"], uid["bob@example.com"],   5, "Excellent support, very happy!"),
    (comp_map["CCRTS-2024-00010"], uid["alice@example.com"], 3, "Issue resolved but process was slow."),
]
for (cid, cust, rating, comment) in feedbacks:
    cur.execute("""
        INSERT IGNORE INTO feedback (complaint_id, customer_id, rating, comments)
        VALUES (%s,%s,%s,%s)
    """, (cid, cust, rating, comment))

# Notifications
notifs = [
    (uid["alice@example.com"], "Your complaint CCRTS-2024-00001 has been assigned to an agent.", False),
    (uid["bob@example.com"],   "Your complaint CCRTS-2024-00002 has been escalated.", False),
    (uid["alice@example.com"], "Your complaint CCRTS-2024-00004 has been resolved.", True),
    (uid["bob@example.com"],   "Your complaint CCRTS-2024-00005 has been closed.", True),
    (uid["agent1@ccrts.com"],  "New complaint CCRTS-2024-00006 assigned to you.", False),
    (uid["agent2@ccrts.com"],  "Complaint CCRTS-2024-00002 escalated — action required.", False),
]
for (user, msg, read) in notifs:
    cur.execute(
        "INSERT INTO notifications (user_id, message, is_read) VALUES (%s,%s,%s)",
        (user, msg, read)
    )

conn.commit()
cur.close()
conn.close()
print("Seed data inserted successfully!")
print("\nLogin credentials:")
print("  admin@ccrts.com       / Admin@1234  (Admin)")
print("  agent1@ccrts.com      / Agent@1234  (Agent)")
print("  agent2@ccrts.com      / Agent@1234  (Agent)")
print("  supervisor@ccrts.com  / Super@1234  (Supervisor)")
print("  alice@example.com     / Cust@1234   (Customer)")
print("  bob@example.com       / Cust@1234   (Customer)")
print("  qa@ccrts.com          / QA@1234     (QualityTeam)")
