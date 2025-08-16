import json
import boto3
import os
from botocore.exceptions import ClientError
from flask import Flask, request, jsonify

app = Flask(__name__)

# Load environment variables
SECRET_ARN = os.getenv("SECRET_ARN")
REGION_NAME = os.getenv("AWS_REGION")
PORT = int(os.environ.get("PORT", 80))

def get_secret_value(secret_arn, key):
    client = boto3.client("secretsmanager", region_name=REGION_NAME)

    try:
        response = client.get_secret_value(SecretId=secret_arn)
        if "SecretString" in response:
            secret_dict = json.loads(response["SecretString"])
        else:
            secret_dict = json.loads(response["SecretBinary"].decode("utf-8"))

        return secret_dict.get(key)
    except ClientError as e:
        return {"error": str(e)}

@app.route("/health", methods=["GET"])
def healthcheck():
    return "healthy",200

@app.route('/test')
def test():
    return {'message': 'Pipeline deployment successful!', 'timestamp': datetime.now().isoformat()}

@app.route("/", methods=["GET"])
def fetch_secret():
    key = request.args.get("key")
    if not key:
        return jsonify({"error": "Missing 'key' query parameter"}), 400

    value = get_secret_value(SECRET_ARN, key)
    if value:
        return jsonify({key: value}), 200
    else:
        return jsonify({"error": f"Key '{key}' not found"}), 404

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=True)
