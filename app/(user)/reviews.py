import csv
import json

# Input and output file names
csv_filename = "reviews.csv"  # Change this to your actual CSV file name
js_filename = "reviewsData.js"

# Read CSV and convert to list of dictionaries
reviews = []
with open(csv_filename, mode="r", encoding="utf-8") as file:
    reader = csv.DictReader(file)
    for row in reader:
        reviews.append({
            "Location_Name": row["Location_Name"],
            "Location_Type": row["Location_Type"],
            "Published_Date": row["Published_Date"],
            "reviews.text": row["reviews.text"]
        })

# Convert list to JSON string (formatted for JavaScript)
js_content = "export const reviewsData = " + json.dumps(reviews, indent=2) + ";"

# Write to JS file
with open(js_filename, mode="w", encoding="utf-8") as js_file:
    js_file.write(js_content)

print(f"JavaScript file '{js_filename}' created successfully!")