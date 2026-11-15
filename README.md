# Aurelia Grand — Cloud Hotel Management System (CCL Mini Project)

**Team Rocket:** Rushil Prasad Shitut, Arya Uttam Shirsat, Lavanya Shankar Reddy

## 3-Service AWS Serverless Architecture
1. **Amazon API Gateway (HTTP API):** Exposes REST endpoints (`GET /rooms`, `POST /rooms`, `POST /book`, `GET /bookings`, `PUT /checkout`, `POST /login`) with CORS enabled.
2. **AWS Lambda (Python 3.12):** Executes transactional booking logic, dynamic tariff + 12% GST billing, and staff PIN authentication using pre-configured `LabRole` (no IAM setup required).
3. **Amazon RDS (MySQL 8.0):** Stores `rooms` and `bookings` tables; auto-initialized and seeded on first API request.

## Deployment Order
1. **RDS:** Create MySQL `db.t3.micro` (`hotel_management`), Public Access = `Yes`, inbound port `3306` open.
2. **Lambda:** Run `pip install -r backend/requirements.txt -t backend/` and zip `backend/` contents into `function.zip`. Upload to Lambda (`LabRole`), set timeout to `15s`, and add `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `STAFF_PIN` environment variables.
3. **API Gateway:** Create HTTP API pointing all 6 routes to the Lambda function and enable CORS (`*`).
4. **Frontend:** Open `frontend/index.html` and paste the API Gateway Invoke URL in the top bar.