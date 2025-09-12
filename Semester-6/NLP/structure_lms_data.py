import pandas as pd

# Read the CSV as a single column
df = pd.read_csv("data/lmsOrg.csv", header=None, names=["Text"])

# Prepare lists to collect structured data
data = []

current_phase = None
current_question = None

for row in df["Text"]:
    text = str(row).strip()
    if not text:
        continue

    # Detect Phase
    if text.startswith("Phase:"):
        current_phase = text.replace("Phase:", "").strip()
        continue

    # Detect Question
    elif text.startswith("Q") and ":" in text:
        current_question = text.strip()
        continue

    # Detect Answer
    elif ":" in text:
        parts = text.split(":", 1)
        person = parts[0].strip()
        answer = parts[1].strip()
        if current_phase and current_question and person and answer:
            data.append({
                "Phase": current_phase,
                "Question": current_question,
                "Person": person,
                "Answer": answer
            })

# Create a structured DataFrame
df_structured = pd.DataFrame(data)

# Display the structured DataFrame
print("✅ Structured LMS Data:\n")
print(df_structured.head(20))  # Display first 20 rows (adjust as needed)

# Optionally, save to CSV if you want
df_structured.to_csv("data/lms_structured.csv", index=False, encoding="utf-8-sig")
print("\n✅ Structured CSV saved as lms_structured.csv")
